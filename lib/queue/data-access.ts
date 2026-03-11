import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureQueueSchema } from "@/lib/mysql/legacy-schema";
import { toMySqlDateTime } from "@/lib/mysql/datetime";

export type JobType =
  | "provisioning"
  | "deployment_retry"
  | "status_poll"
  | "post_deploy"
  | "cleanup"
  | "notification";

export type JobStatus =
  | "pending"
  | "claimed"
  | "processing"
  | "completed"
  | "failed"
  | "dead_letter";

export interface QueueJob {
  id: string;
  job_type: JobType;
  provisioning_job_id: string | null;
  status: JobStatus;
  priority: number;
  scheduled_at: string;
  claimed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  worker_id: string | null;
  locked_until: string | null;
  attempt_count: number;
  max_attempts: number;
  last_error: string | null;
  next_retry_at: string | null;
  backoff_seconds: number;
  timeout_seconds: number;
  payload: Record<string, any>;
  result: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface DeadLetterJob {
  id: string;
  original_job_id: string;
  job_type: JobType;
  provisioning_job_id: string | null;
  failure_reason: string;
  attempt_count: number;
  last_error: string | null;
  payload: Record<string, any>;
  failed_at: string;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
}

type QueueJobDbRow = Omit<QueueJob, "payload" | "result"> & {
  payload: string;
  result: string | null;
};

type DeadLetterDbRow = Omit<DeadLetterJob, "payload"> & {
  payload: string;
};

function parseJsonRecord(value: string | null): Record<string, any> | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, any>;
  } catch {
    return null;
  }
}

function serializeJson(value: unknown) {
  return value == null ? null : JSON.stringify(value);
}

function mapQueueJob(row: QueueJobDbRow | null): QueueJob | null {
  if (!row) {
    return null;
  }

  return {
    ...row,
    priority: Number(row.priority || 0),
    attempt_count: Number(row.attempt_count || 0),
    max_attempts: Number(row.max_attempts || 0),
    backoff_seconds: Number(row.backoff_seconds || 0),
    timeout_seconds: Number(row.timeout_seconds || 0),
    payload: parseJsonRecord(row.payload) || {},
    result: parseJsonRecord(row.result),
  };
}

function mapDeadLetter(row: DeadLetterDbRow): DeadLetterJob {
  return {
    ...row,
    attempt_count: Number(row.attempt_count || 0),
    payload: parseJsonRecord(row.payload) || {},
  };
}

async function getQueueJobById(jobId: string): Promise<QueueJob | null> {
  await ensureQueueSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query(
    `
      SELECT *
      FROM job_queue
      WHERE id = ?
      LIMIT 1
    `,
    [jobId],
  );

  return mapQueueJob(((rows as QueueJobDbRow[])[0] || null));
}

async function moveToDeadLetter(
  job: QueueJob,
  failureReason: string,
): Promise<boolean> {
  await ensureQueueSchema();
  const pool = getMySQLPool();
  const deadLetterId = randomUUID();

  try {
    await pool.query(
      `
        INSERT INTO dead_letter_queue (
          id, original_job_id, job_type, provisioning_job_id, failure_reason,
          attempt_count, last_error, payload, failed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        deadLetterId,
        job.id,
        job.job_type,
        job.provisioning_job_id,
        failureReason,
        job.attempt_count,
        job.last_error,
        serializeJson(job.payload) || "{}",
      ],
    );

    await pool.query(
      `
        UPDATE job_queue
        SET status = 'dead_letter',
            last_error = ?,
            completed_at = NOW(),
            locked_until = NULL
        WHERE id = ?
      `,
      [failureReason, job.id],
    );

    return true;
  } catch (error) {
    console.error("[queue] Error moving to dead letter:", error);
    return false;
  }
}

export async function enqueueJob(
  jobType: JobType,
  payload: Record<string, any>,
  options: {
    provisioningJobId?: string;
    priority?: number;
    scheduledAt?: Date;
    maxAttempts?: number;
    timeoutSeconds?: number;
    backoffSeconds?: number;
  } = {},
): Promise<QueueJob | null> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO job_queue (
          id, job_type, provisioning_job_id, status, priority, scheduled_at,
          attempt_count, max_attempts, backoff_seconds, timeout_seconds, payload
        )
        VALUES (?, ?, ?, 'pending', ?, ?, 0, ?, ?, ?, ?)
      `,
      [
        id,
        jobType,
        options.provisioningJobId || null,
        options.priority ?? 100,
        toMySqlDateTime(options.scheduledAt || new Date()),
        options.maxAttempts ?? 3,
        options.backoffSeconds ?? 30,
        options.timeoutSeconds ?? 300,
        JSON.stringify(payload),
      ],
    );

    return getQueueJobById(id);
  } catch (error) {
    console.error("[queue] Error enqueuing job:", error);
    return null;
  }
}

export async function claimNextJob(
  workerId: string,
  jobTypes: JobType[],
  lockDurationSeconds: number = 300,
): Promise<QueueJob | null> {
  await ensureQueueSchema();
  const pool = getMySQLPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const placeholders = jobTypes.map(() => "?").join(", ");
    const [rows] = await connection.query(
      `
        SELECT *
        FROM job_queue
        WHERE job_type IN (${placeholders})
          AND status = 'pending'
          AND scheduled_at <= NOW()
          AND (next_retry_at IS NULL OR next_retry_at <= NOW())
          AND (locked_until IS NULL OR locked_until <= NOW())
        ORDER BY priority ASC, scheduled_at ASC, created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `,
      jobTypes,
    );

    const nextJob = (rows as QueueJobDbRow[])[0];
    if (!nextJob) {
      await connection.commit();
      return null;
    }

    await connection.query(
      `
        UPDATE job_queue
        SET status = 'claimed',
            worker_id = ?,
            claimed_at = NOW(),
            locked_until = DATE_ADD(NOW(), INTERVAL ? SECOND)
        WHERE id = ?
      `,
      [workerId, lockDurationSeconds, nextJob.id],
    );

    await connection.commit();
    return getQueueJobById(nextJob.id);
  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error("[queue] Error claiming job:", error);
    return null;
  } finally {
    connection.release();
  }
}

export async function startJob(jobId: string): Promise<boolean> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE job_queue
        SET status = 'processing',
            started_at = NOW()
        WHERE id = ?
          AND status = 'claimed'
      `,
      [jobId],
    );

    return true;
  } catch (error) {
    console.error("[queue] Error starting job:", error);
    return false;
  }
}

export async function completeJob(
  jobId: string,
  result?: Record<string, any>,
): Promise<boolean> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE job_queue
        SET status = 'completed',
            completed_at = NOW(),
            result = ?,
            locked_until = NULL
        WHERE id = ?
      `,
      [serializeJson(result), jobId],
    );

    return true;
  } catch (error) {
    console.error("[queue] Error completing job:", error);
    return false;
  }
}

export async function failJob(
  jobId: string,
  error: string,
  shouldRetry: boolean = true,
): Promise<boolean> {
  try {
    const job = await getQueueJobById(jobId);
    if (!job) {
      console.error("[queue] Job not found for failure:", jobId);
      return false;
    }

    const newAttemptCount = job.attempt_count + 1;
    const hasMoreRetries = shouldRetry && newAttemptCount < job.max_attempts;
    const pool = getMySQLPool();

    if (hasMoreRetries) {
      const backoffMs = job.backoff_seconds * 1000 * Math.pow(2, newAttemptCount - 1);
      const actualBackoffMs = Math.min(backoffMs, 60 * 60 * 1000);
      const nextRetryAt = new Date(Date.now() + actualBackoffMs);

      await pool.query(
        `
          UPDATE job_queue
          SET status = 'pending',
              attempt_count = ?,
              last_error = ?,
              next_retry_at = ?,
              scheduled_at = ?,
              worker_id = NULL,
              locked_until = NULL,
              claimed_at = NULL,
              started_at = NULL
          WHERE id = ?
        `,
        [
          newAttemptCount,
          error,
          toMySqlDateTime(nextRetryAt),
          toMySqlDateTime(nextRetryAt),
          jobId,
        ],
      );

      return true;
    }

    await pool.query(
      `
        UPDATE job_queue
        SET status = 'failed',
            attempt_count = ?,
            last_error = ?,
            completed_at = NOW(),
            locked_until = NULL
        WHERE id = ?
      `,
      [newAttemptCount, error, jobId],
    );

    return moveToDeadLetter(
      {
        ...job,
        attempt_count: newAttemptCount,
        last_error: error,
      },
      `Max attempts (${job.max_attempts}) exceeded. Last error: ${error}`,
    );
  } catch (failureError) {
    console.error("[queue] Error failing job:", failureError);
    return false;
  }
}

export async function releaseStaleLocks(): Promise<number> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `
        UPDATE job_queue
        SET status = 'pending',
            worker_id = NULL,
            locked_until = NULL,
            claimed_at = NULL,
            started_at = NULL
        WHERE status IN ('claimed', 'processing')
          AND locked_until IS NOT NULL
          AND locked_until <= NOW()
      `,
    );

    return Number((result as { affectedRows?: number }).affectedRows || 0);
  } catch (error) {
    console.error("[queue] Error releasing stale locks:", error);
    return 0;
  }
}

export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  deadLetter: number;
}> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT status, COUNT(*) AS total
        FROM job_queue
        GROUP BY status
      `,
    );

    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      deadLetter: 0,
    };

    for (const row of rows as Array<{ status: JobStatus; total: number | string }>) {
      const total = Number(row.total || 0);
      if (row.status === "pending" || row.status === "claimed") stats.pending += total;
      if (row.status === "processing") stats.processing += total;
      if (row.status === "completed") stats.completed += total;
      if (row.status === "failed") stats.failed += total;
      if (row.status === "dead_letter") stats.deadLetter += total;
    }

    return stats;
  } catch (error) {
    console.error("[queue] Error fetching stats:", error);
    return { pending: 0, processing: 0, completed: 0, failed: 0, deadLetter: 0 };
  }
}

export async function getJobsForProvisioning(
  provisioningJobId: string,
): Promise<QueueJob[]> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM job_queue
        WHERE provisioning_job_id = ?
        ORDER BY created_at DESC
      `,
      [provisioningJobId],
    );

    return (rows as QueueJobDbRow[])
      .map((row) => mapQueueJob(row))
      .filter(Boolean) as QueueJob[];
  } catch (error) {
    console.error("[queue] Error fetching jobs:", error);
    return [];
  }
}

export async function getRecentJobs(limit: number = 20): Promise<QueueJob[]> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM job_queue
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [limit],
    );

    return (rows as QueueJobDbRow[])
      .map((row) => mapQueueJob(row))
      .filter(Boolean) as QueueJob[];
  } catch (error) {
    console.error("[queue] Error fetching recent jobs:", error);
    return [];
  }
}

export async function cancelQueueJobById(jobId: string): Promise<boolean> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `
        UPDATE job_queue
        SET status = 'failed',
            last_error = 'Cancelled by admin',
            completed_at = NOW(),
            locked_until = NULL
        WHERE id = ?
          AND status IN ('pending', 'claimed')
      `,
      [jobId],
    );

    return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
  } catch (error) {
    console.error("[queue] Error canceling job:", error);
    return false;
  }
}

export async function resetQueueJob(jobId: string): Promise<boolean> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `
        UPDATE job_queue
        SET status = 'pending',
            attempt_count = 0,
            last_error = NULL,
            next_retry_at = NULL,
            scheduled_at = NOW(),
            worker_id = NULL,
            locked_until = NULL,
            claimed_at = NULL,
            started_at = NULL,
            completed_at = NULL,
            result = NULL
        WHERE id = ?
      `,
      [jobId],
    );

    return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
  } catch (error) {
    console.error("[queue] Error resetting job:", error);
    return false;
  }
}

export async function purgeCompletedJobsOlderThan(olderThanDays: number): Promise<number> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `
        DELETE FROM job_queue
        WHERE status = 'completed'
          AND completed_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `,
      [olderThanDays],
    );

    return Number((result as { affectedRows?: number }).affectedRows || 0);
  } catch (error) {
    console.error("[queue] Error purging completed jobs:", error);
    return 0;
  }
}

export async function getDeadLetterJobs(
  limit: number = 50,
  unresolvedOnly: boolean = true,
): Promise<DeadLetterJob[]> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM dead_letter_queue
        ${unresolvedOnly ? "WHERE resolved_at IS NULL" : ""}
        ORDER BY failed_at DESC
        LIMIT ?
      `,
      [limit],
    );

    return (rows as DeadLetterDbRow[]).map(mapDeadLetter);
  } catch (error) {
    console.error("[queue] Error fetching dead letter jobs:", error);
    return [];
  }
}

export async function resolveDeadLetterJob(
  deadLetterId: string,
  userId: string,
  notes: string,
): Promise<boolean> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `
        UPDATE dead_letter_queue
        SET resolved_at = NOW(),
            resolved_by = ?,
            resolution_notes = ?
        WHERE id = ?
      `,
      [userId, notes, deadLetterId],
    );

    return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
  } catch (error) {
    console.error("[queue] Error resolving dead letter:", error);
    return false;
  }
}

export async function retryDeadLetterJob(
  deadLetterId: string,
): Promise<QueueJob | null> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM dead_letter_queue
        WHERE id = ?
        LIMIT 1
      `,
      [deadLetterId],
    );

    const deadLetter = (rows as DeadLetterDbRow[])[0];
    if (!deadLetter) {
      return null;
    }

    const newJob = await enqueueJob(deadLetter.job_type, parseJsonRecord(deadLetter.payload) || {}, {
      provisioningJobId: deadLetter.provisioning_job_id || undefined,
      maxAttempts: 3,
    });

    if (newJob) {
      await resolveDeadLetterJob(deadLetterId, "system", "Retried via admin action");
    }

    return newJob;
  } catch (error) {
    console.error("[queue] Error retrying dead letter job:", error);
    return null;
  }
}

export async function updateWorkerHeartbeat(
  workerId: string,
  jobsProcessed: number = 0,
  jobsFailed: number = 0,
): Promise<void> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        INSERT INTO worker_heartbeats (
          worker_id, last_heartbeat, jobs_processed, jobs_failed, status
        )
        VALUES (?, NOW(), ?, ?, 'active')
        ON DUPLICATE KEY UPDATE
          last_heartbeat = NOW(),
          jobs_processed = VALUES(jobs_processed),
          jobs_failed = VALUES(jobs_failed),
          status = 'active'
      `,
      [workerId, jobsProcessed, jobsFailed],
    );
  } catch (error) {
    console.error("[queue] Error updating heartbeat:", error);
  }
}

export async function getWorkerHeartbeats(limit: number = 10): Promise<
  Array<{
    worker_id: string;
    last_heartbeat: string;
    jobs_processed: number;
    jobs_failed: number;
    status: "active" | "dead";
  }>
> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT worker_id, last_heartbeat, jobs_processed, jobs_failed, status
        FROM worker_heartbeats
        ORDER BY last_heartbeat DESC
        LIMIT ?
      `,
      [limit],
    );

    return (rows as Array<{
      worker_id: string;
      last_heartbeat: string;
      jobs_processed: number | string;
      jobs_failed: number | string;
      status: "active" | "dead";
    }>).map((row) => ({
      ...row,
      jobs_processed: Number(row.jobs_processed || 0),
      jobs_failed: Number(row.jobs_failed || 0),
    }));
  } catch (error) {
    console.error("[queue] Error fetching worker heartbeats:", error);
    return [];
  }
}

export async function markDeadWorkers(
  staleThresholdSeconds: number = 120,
): Promise<number> {
  try {
    await ensureQueueSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `
        UPDATE worker_heartbeats
        SET status = 'dead'
        WHERE last_heartbeat < DATE_SUB(NOW(), INTERVAL ? SECOND)
          AND status <> 'dead'
      `,
      [staleThresholdSeconds],
    );

    return Number((result as { affectedRows?: number }).affectedRows || 0);
  } catch (error) {
    console.error("[queue] Error marking dead workers:", error);
    return 0;
  }
}
