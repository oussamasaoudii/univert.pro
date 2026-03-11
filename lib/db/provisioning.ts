import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureProvisioningSchema } from "@/lib/mysql/legacy-schema";
import { toMySqlDateTime } from "@/lib/mysql/datetime";
import type { ProvisioningJobRow } from "./types";
import type { JobLogEntry } from "@/lib/provisioning/types";

type ProvisioningJobDbRow = {
  id: string;
  website_id: string;
  user_id: string;
  status: ProvisioningJobRow["status"];
  progress: number | string;
  current_step: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  retry_count: number | string;
};

type ProvisioningLogDbRow = {
  id: string;
  job_id: string;
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  step_name: string | null;
  details: string | null;
};

function normalizeLogLevelForDatabase(level: JobLogEntry["level"] | undefined) {
  if (level === "warning") {
    return "warn" as const;
  }
  if (level === "error") {
    return "error" as const;
  }
  if (level === "success") {
    return "info" as const;
  }
  return "info" as const;
}

function normalizeLogLevelFromDatabase(level: ProvisioningLogDbRow["level"]): JobLogEntry["level"] {
  if (level === "warn") {
    return "warning";
  }
  if (level === "error") {
    return "error";
  }
  return "info";
}

function serializeJson(value: unknown) {
  return value == null ? null : JSON.stringify(value);
}

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

function mapProvisioningJob(row: ProvisioningJobDbRow | null): ProvisioningJobRow | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    website_id: row.website_id,
    user_id: row.user_id,
    status: row.status,
    progress: Number(row.progress || 0),
    current_step: row.current_step,
    error_message: row.error_message,
    started_at: row.started_at,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    retry_count: Number(row.retry_count || 0),
  };
}

function mapLog(row: ProvisioningLogDbRow): JobLogEntry {
    return {
      id: row.id,
      jobId: row.job_id,
      timestamp: row.timestamp,
      level: normalizeLogLevelFromDatabase(row.level),
      message: row.message,
      stepName: row.step_name || undefined,
      details: parseJsonRecord(row.details) || undefined,
    };
}

async function getProvisioningJobByField(
  field: "id" | "website_id",
  value: string,
): Promise<ProvisioningJobRow | null> {
  await ensureProvisioningSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query(
    `
      SELECT
        id,
        website_id,
        user_id,
        status,
        progress,
        current_step,
        error_message,
        started_at,
        completed_at,
        created_at,
        updated_at,
        retry_count
      FROM provisioning_jobs
      WHERE ${field} = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [value],
  );

  return mapProvisioningJob(((rows as ProvisioningJobDbRow[])[0] || null));
}

export async function createJobLog(log: JobLogEntry): Promise<boolean> {
  try {
    await ensureProvisioningSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        INSERT INTO provisioning_job_logs (
          id, job_id, timestamp, level, message, step_name, details
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        log.id || randomUUID(),
        log.jobId,
        toMySqlDateTime(log.timestamp || new Date()),
        normalizeLogLevelForDatabase(log.level),
        log.message,
        log.stepName || null,
        serializeJson(log.details),
      ],
    );

    return true;
  } catch (error) {
    console.error("[db] Error creating job log:", error);
    return false;
  }
}

export async function getJobLogs(jobId: string): Promise<JobLogEntry[]> {
  try {
    await ensureProvisioningSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT
          id,
          job_id,
          timestamp,
          level,
          message,
          step_name,
          details
        FROM provisioning_job_logs
        WHERE job_id = ?
        ORDER BY timestamp ASC, created_at ASC
      `,
      [jobId],
    );

    return (rows as ProvisioningLogDbRow[]).map(mapLog);
  } catch (error) {
    console.error("[db] Error fetching job logs:", error);
    return [];
  }
}

export async function getRecentJobLogs(jobId: string, limit: number = 50): Promise<JobLogEntry[]> {
  const logs = await getJobLogs(jobId);
  return logs.slice(-limit);
}

export async function getJobErrors(jobId: string): Promise<JobLogEntry[]> {
  const logs = await getJobLogs(jobId);
  return logs.filter((log) => log.level === "error");
}

export async function getProvisioningJob(jobId: string): Promise<ProvisioningJobRow | null> {
  return getProvisioningJobByField("id", jobId);
}

export async function getWebsiteProvisioningJob(websiteId: string): Promise<ProvisioningJobRow | null> {
  return getProvisioningJobByField("website_id", websiteId);
}

export async function createProvisioningJob(
  websiteId: string,
  userId: string,
): Promise<ProvisioningJobRow | null> {
  try {
    await ensureProvisioningSchema();
    const pool = getMySQLPool();
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO provisioning_jobs (
          id, website_id, user_id, status, progress, current_step, retry_count
        )
        VALUES (?, ?, ?, 'pending', 0, 'Validating configuration', 0)
      `,
      [id, websiteId, userId],
    );

    return getProvisioningJob(id);
  } catch (error) {
    console.error("[db] Error creating provisioning job:", error);
    return null;
  }
}

export async function updateProvisioningJob(
  jobId: string,
  updates: Partial<ProvisioningJobRow>,
): Promise<ProvisioningJobRow | null> {
  try {
    await ensureProvisioningSchema();
    const pool = getMySQLPool();
    const fields: string[] = [];
    const values: Array<string | number | null> = [];

    if (updates.status) {
      fields.push("status = ?");
      values.push(updates.status);
    }
    if (typeof updates.progress === "number") {
      fields.push("progress = ?");
      values.push(updates.progress);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "current_step")) {
      fields.push("current_step = ?");
      values.push(updates.current_step ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "error_message")) {
      fields.push("error_message = ?");
      values.push(updates.error_message ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "started_at")) {
      fields.push("started_at = ?");
      values.push(toMySqlDateTime(updates.started_at));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "completed_at")) {
      fields.push("completed_at = ?");
      values.push(toMySqlDateTime(updates.completed_at));
    }
    if (typeof updates.retry_count === "number") {
      fields.push("retry_count = ?");
      values.push(updates.retry_count);
    }

    if (fields.length === 0) {
      return getProvisioningJob(jobId);
    }

    values.push(jobId);
    await pool.query(
      `
        UPDATE provisioning_jobs
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
      values,
    );

    return getProvisioningJob(jobId);
  } catch (error) {
    console.error("[db] Error updating provisioning job:", error);
    return null;
  }
}

async function listJobsByStatus(status: ProvisioningJobRow["status"]) {
  await ensureProvisioningSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query(
    `
      SELECT
        id,
        website_id,
        user_id,
        status,
        progress,
        current_step,
        error_message,
        started_at,
        completed_at,
        created_at,
        updated_at,
        retry_count
      FROM provisioning_jobs
      WHERE status = ?
      ORDER BY created_at ASC
    `,
    [status],
  );

  return (rows as ProvisioningJobDbRow[])
    .map((row) => mapProvisioningJob(row))
    .filter(Boolean) as ProvisioningJobRow[];
}

export async function getAllPendingJobs(): Promise<ProvisioningJobRow[]> {
  return listJobsByStatus("pending");
}

export async function getAllRunningJobs(): Promise<ProvisioningJobRow[]> {
  return listJobsByStatus("running");
}

export async function listProvisioningJobs(limit: number = 100): Promise<ProvisioningJobRow[]> {
  try {
    await ensureProvisioningSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT
          id,
          website_id,
          user_id,
          status,
          progress,
          current_step,
          error_message,
          started_at,
          completed_at,
          created_at,
          updated_at,
          retry_count
        FROM provisioning_jobs
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [limit],
    );

    return (rows as ProvisioningJobDbRow[])
      .map((row) => mapProvisioningJob(row))
      .filter(Boolean) as ProvisioningJobRow[];
  } catch (error) {
    console.error("[db] Error listing provisioning jobs:", error);
    return [];
  }
}
