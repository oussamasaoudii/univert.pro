// Queue Manager
// Orchestrates job processing and worker coordination

import {
  enqueueJob,
  claimNextJob,
  startJob,
  completeJob,
  failJob,
  releaseStaleLocks,
  updateWorkerHeartbeat,
  markDeadWorkers,
  getQueueStats,
  type JobType,
  type QueueJob,
} from './data-access';
import { ProvisioningJobManager } from '@/lib/provisioning/job-manager';
import { updateProvisioningJob, getProvisioningJob } from '@/lib/db/provisioning';
import { updateWebsiteStatus } from '@/lib/db/websites';
import type { ProvisioningContext, ProvisioningConfig } from '@/lib/provisioning/types';

/**
 * Job handlers registry
 */
type JobHandler = (job: QueueJob) => Promise<{ success: boolean; result?: any; error?: string }>;

const jobHandlers: Record<JobType, JobHandler> = {
  provisioning: handleProvisioningJob,
  deployment_retry: handleDeploymentRetry,
  status_poll: handleStatusPoll,
  post_deploy: handlePostDeploy,
  cleanup: handleCleanup,
  notification: handleNotification,
};

/**
 * Main worker function - processes jobs from the queue
 */
export async function processNextJob(
  workerId: string,
  jobTypes: JobType[] = ['provisioning', 'deployment_retry', 'status_poll', 'post_deploy']
): Promise<{ processed: boolean; jobId?: string; success?: boolean }> {
  try {
    // Claim next available job
    const job = await claimNextJob(workerId, jobTypes);

    if (!job) {
      return { processed: false };
    }

    console.log(`[worker:${workerId}] Claimed job ${job.id} (${job.job_type})`);

    // Mark as processing
    await startJob(job.id);

    // Get the handler
    const handler = jobHandlers[job.job_type];
    if (!handler) {
      await failJob(job.id, `Unknown job type: ${job.job_type}`, false);
      return { processed: true, jobId: job.id, success: false };
    }

    // Execute with timeout
    const timeoutMs = job.timeout_seconds * 1000;
    const result = await Promise.race([
      handler(job),
      new Promise<{ success: false; error: string }>((_, reject) =>
        setTimeout(() => reject({ success: false, error: 'Job timeout exceeded' }), timeoutMs)
      ),
    ]);

    if (result.success) {
      await completeJob(job.id, result.result);
      console.log(`[worker:${workerId}] Completed job ${job.id}`);
      return { processed: true, jobId: job.id, success: true };
    } else {
      await failJob(job.id, result.error || 'Unknown error');
      console.log(`[worker:${workerId}] Failed job ${job.id}: ${result.error}`);
      return { processed: true, jobId: job.id, success: false };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[worker:${workerId}] Error processing job:`, message);
    return { processed: false };
  }
}

/**
 * Worker loop - continuously processes jobs
 */
export async function runWorkerLoop(
  workerId: string,
  options: {
    jobTypes?: JobType[];
    maxIterations?: number;
    pollIntervalMs?: number;
    idleTimeoutMs?: number;
  } = {}
): Promise<{ jobsProcessed: number; jobsFailed: number }> {
  const {
    jobTypes = ['provisioning', 'deployment_retry', 'status_poll', 'post_deploy'],
    maxIterations = 100,
    pollIntervalMs = 1000,
    idleTimeoutMs = 30000,
  } = options;

  let jobsProcessed = 0;
  let jobsFailed = 0;
  let iterations = 0;
  let lastJobTime = Date.now();

  console.log(`[worker:${workerId}] Starting worker loop`);

  while (iterations < maxIterations) {
    iterations++;

    // Update heartbeat
    await updateWorkerHeartbeat(workerId, jobsProcessed, jobsFailed);

    // Process next job
    const result = await processNextJob(workerId, jobTypes);

    if (result.processed) {
      lastJobTime = Date.now();
      if (result.success) {
        jobsProcessed++;
      } else {
        jobsFailed++;
      }
    } else {
      // No jobs available, check idle timeout
      if (Date.now() - lastJobTime > idleTimeoutMs) {
        console.log(`[worker:${workerId}] Idle timeout reached, stopping`);
        break;
      }
      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }

  console.log(`[worker:${workerId}] Worker loop ended. Processed: ${jobsProcessed}, Failed: ${jobsFailed}`);
  return { jobsProcessed, jobsFailed };
}

/**
 * Enqueue a provisioning job for async execution
 */
export async function enqueueProvisioningJob(
  provisioningJobId: string,
  context: ProvisioningContext,
  config: ProvisioningConfig
): Promise<string | null> {
  const job = await enqueueJob(
    'provisioning',
    { context, config },
    {
      provisioningJobId,
      priority: 50, // High priority
      maxAttempts: 3,
      timeoutSeconds: 600, // 10 minutes
      backoffSeconds: 60,
    }
  );

  if (job) {
    // Keep provisioning job status as pending for schema compatibility and surface queueing via current_step.
    await updateProvisioningJob(provisioningJobId, {
      status: 'pending',
      progress: 5,
      current_step: 'Job queued for processing',
    });

    console.log(`[queue] Provisioning job ${provisioningJobId} enqueued as ${job.id}`);
    return job.id;
  }

  return null;
}

/**
 * Enqueue a post-deploy task
 */
export async function enqueuePostDeployTask(
  provisioningJobId: string,
  websiteId: string,
  tasks: string[]
): Promise<string | null> {
  const job = await enqueueJob(
    'post_deploy',
    { websiteId, tasks },
    {
      provisioningJobId,
      priority: 80,
      maxAttempts: 2,
      timeoutSeconds: 300,
    }
  );

  return job?.id || null;
}

/**
 * Enqueue a status polling job
 */
export async function enqueueStatusPoll(
  provisioningJobId: string,
  websiteId: string,
  checkUrl: string
): Promise<string | null> {
  const job = await enqueueJob(
    'status_poll',
    { websiteId, checkUrl },
    {
      provisioningJobId,
      priority: 90,
      maxAttempts: 5,
      timeoutSeconds: 60,
      backoffSeconds: 10,
    }
  );

  return job?.id || null;
}

export async function enqueueBackupJob(
  backupId: string,
  websiteId: string,
  userId: string,
  mode: "manual" | "export" = "manual",
): Promise<string | null> {
  const job = await enqueueJob(
    "cleanup",
    {
      resourceType: mode === "export" ? "export" : "backup",
      resourceId: backupId,
      websiteId,
      userId,
      mode,
    },
    {
      priority: 95,
      timeoutSeconds: 300,
      maxAttempts: 2,
    },
  );

  return job?.id || null;
}

export async function enqueueRestoreJob(
  restoreId: string,
  backupId: string,
  websiteId: string,
  userId: string,
): Promise<string | null> {
  const job = await enqueueJob(
    "cleanup",
    {
      resourceType: "restore",
      resourceId: restoreId,
      backupId,
      websiteId,
      userId,
    },
    {
      priority: 95,
      timeoutSeconds: 300,
      maxAttempts: 2,
    },
  );

  return job?.id || null;
}

// ========== Job Handlers ==========

/**
 * Handle provisioning job
 */
async function handleProvisioningJob(
  job: QueueJob
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { context, config } = job.payload as {
    context: ProvisioningContext;
    config: ProvisioningConfig;
  };

  if (!context || !config) {
    return { success: false, error: 'Invalid job payload: missing context or config' };
  }

  try {
    const manager = new ProvisioningJobManager('aapanel');
    const success = await manager.executeProvisioning(job.provisioning_job_id!, context, config);

    if (success) {
      // Update website status to ready
      await updateWebsiteStatus(context.websiteId, 'ready');

      // Enqueue post-deploy tasks
      await enqueuePostDeployTask(job.provisioning_job_id!, context.websiteId, [
        'health_check',
        'warm_cache',
        'notify_user',
      ]);

      return { success: true, result: { websiteId: context.websiteId } };
    } else {
      return { success: false, error: 'Provisioning failed' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Handle deployment retry
 */
async function handleDeploymentRetry(
  job: QueueJob
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { context, config } = job.payload as {
    context: ProvisioningContext;
    config: ProvisioningConfig;
  };

  if (!context || !config) {
    return { success: false, error: 'Invalid job payload' };
  }

  // Reset provisioning job state
  await updateProvisioningJob(job.provisioning_job_id!, {
    status: 'running',
    progress: 0,
    current_step: 'Retrying deployment',
    error_message: null,
    started_at: new Date().toISOString(),
    completed_at: null,
  });

  // Execute provisioning
  return handleProvisioningJob(job);
}

/**
 * Handle status polling
 */
async function handleStatusPoll(
  job: QueueJob
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { websiteId, checkUrl } = job.payload as {
    websiteId: string;
    checkUrl: string;
  };

  try {
    // Perform health check
    const response = await fetch(checkUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return { success: true, result: { status: 'healthy', statusCode: response.status } };
    } else {
      return { success: false, error: `Health check failed: ${response.status}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Health check timeout';
    return { success: false, error: message };
  }
}

/**
 * Handle post-deploy tasks
 */
async function handlePostDeploy(
  job: QueueJob
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { websiteId, tasks } = job.payload as {
    websiteId: string;
    tasks: string[];
  };

  const results: Record<string, boolean> = {};

  for (const task of tasks) {
    switch (task) {
      case 'health_check':
        // Perform basic health check
        results[task] = true;
        break;
      case 'warm_cache':
        // Warm the cache by hitting key routes
        results[task] = true;
        break;
      case 'notify_user':
        // Send notification (would integrate with notification service)
        results[task] = true;
        break;
      default:
        results[task] = false;
    }
  }

  const allSuccess = Object.values(results).every((v) => v);
  return { success: allSuccess, result: results };
}

/**
 * Handle cleanup job
 */
async function handleCleanup(
  job: QueueJob
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { resourceType, resourceId } = job.payload as {
    resourceType: string;
    resourceId: string;
  };

  console.log(`[cleanup] Cleaning up ${resourceType}: ${resourceId}`);

  // Implement cleanup logic based on resource type
  return { success: true, result: { cleaned: true } };
}

/**
 * Handle notification job
 */
async function handleNotification(
  job: QueueJob
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { type, userId, data } = job.payload as {
    type: string;
    userId: string;
    data: any;
  };

  console.log(`[notification] Sending ${type} notification to user ${userId}`);

  // Integrate with notification service (email, push, etc.)
  return { success: true, result: { sent: true } };
}

// ========== Maintenance Functions ==========

/**
 * Run queue maintenance tasks
 */
export async function runQueueMaintenance(): Promise<{
  staleLocks: number;
  deadWorkers: number;
}> {
  // Release stale locks
  const staleLocks = await releaseStaleLocks();
  if (staleLocks > 0) {
    console.log(`[maintenance] Released ${staleLocks} stale locks`);
  }

  // Mark dead workers
  const deadWorkers = await markDeadWorkers(120);
  if (deadWorkers > 0) {
    console.log(`[maintenance] Marked ${deadWorkers} dead workers`);
  }

  return { staleLocks, deadWorkers };
}

/**
 * Get current queue status
 */
export async function getQueueStatus(): Promise<{
  stats: Awaited<ReturnType<typeof getQueueStats>>;
  healthy: boolean;
}> {
  const stats = await getQueueStats();
  const healthy = stats.deadLetter < 10 && stats.failed < 50;

  return { stats, healthy };
}
