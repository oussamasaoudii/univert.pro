'use server';

import { getAdminRequestUser } from '@/lib/api-auth';
import { getJobLogs, getProvisioningJob, updateProvisioningJob } from '@/lib/db/provisioning';
import type { ProvisioningJobRow } from '@/lib/db/types';
import { getJobsForProvisioning } from '@/lib/queue/data-access';
import { enqueueProvisioningJob, processNextJob } from '@/lib/queue/queue-manager';
import { ProvisioningJobManager } from '@/lib/provisioning/job-manager';
import type { ProvisioningConfig, ProvisioningContext } from '@/lib/provisioning/types';
import { getTemplateById, getWebsiteById } from '@/lib/mysql/platform';

function normalizeTemplateStack(
  stack: 'Laravel' | 'Next.js' | 'WordPress',
): ProvisioningConfig['stack'] {
  if (stack === 'Laravel') return 'laravel';
  if (stack === 'WordPress') return 'wordpress';
  return 'nextjs';
}

async function buildProvisioningInputs(jobId: string): Promise<{
  context: ProvisioningContext;
  config: ProvisioningConfig;
} | null> {
  const job = await getProvisioningJob(jobId);
  if (!job) {
    return null;
  }

  const website = await getWebsiteById(job.website_id);
  if (!website || !website.templateId) {
    return null;
  }

  const template = await getTemplateById(website.templateId, { includeInactive: true });
  if (!template) {
    return null;
  }

  return {
    context: {
      jobId,
      websiteId: website.id,
      userId: website.userId,
      templateId: template.id,
      subdomain: website.subdomain,
      customDomain: website.customDomain || undefined,
      metadata: {
        projectName: website.projectName,
        ownerEmail: website.ownerEmail,
        templateName: template.name,
        templateSlug: template.slug,
        templateSourcePath: template.templateSourcePath,
        deploymentProfile: template.deploymentProfile,
      },
    },
    config: {
      stack: normalizeTemplateStack(template.stack),
      environment: 'production',
      templateSlug: template.slug,
      templateSourcePath: template.templateSourcePath || undefined,
      deploymentProfile: template.deploymentProfile || undefined,
      scaling: {
        minServers: 1,
        maxServers: 1,
      },
      backup: {
        enabled: true,
        frequency: 'daily',
      },
    },
  };
}

function kickProvisioningWorker() {
  const workerId = `admin-${Date.now().toString(36)}`;
  setTimeout(() => {
    processNextJob(workerId, ['provisioning']).catch((error) => {
      console.error('[admin-provisioning] Failed to kick worker:', error);
    });
  }, 0);
}

/**
 * Trigger provisioning for a queued website.
 * Keeps compatibility with legacy admin approval flow without changing the UI.
 */
export async function approveProvisioningJob(
  jobId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const job = await getProvisioningJob(jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    if (!['pending', 'failed'].includes(job.status)) {
      return {
        success: false,
        error: `Job must be pending or failed before approval (current: ${job.status})`,
      };
    }

    const inputs = await buildProvisioningInputs(jobId);
    if (!inputs) {
      return {
        success: false,
        error: 'Provisioning context could not be rebuilt from the current website/template data',
      };
    }

    const queueJobs = await getJobsForProvisioning(jobId);
    const hasOpenQueueJob = queueJobs.some((item) =>
      ['pending', 'claimed', 'processing'].includes(item.status),
    );

    if (!hasOpenQueueJob) {
      const queueJobId = await enqueueProvisioningJob(jobId, inputs.context, inputs.config);
      if (!queueJobId) {
        return { success: false, error: 'Failed to enqueue provisioning job' };
      }
    }

    kickProvisioningWorker();
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[admin-provisioning] Error approving job:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Retry a failed provisioning job.
 */
export async function retryProvisioningJob(
  jobId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const job = await getProvisioningJob(jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    if (job.status !== 'failed') {
      return { success: false, error: 'Only failed jobs can be retried' };
    }

    const updated = await updateProvisioningJob(jobId, {
      status: 'pending',
      progress: 0,
      current_step: 'queued',
      error_message: null,
      completed_at: null,
      retry_count: (job.retry_count || 0) + 1,
    });

    if (!updated) {
      return { success: false, error: 'Failed to reset job status' };
    }

    return approveProvisioningJob(jobId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

/**
 * Cancel a provisioning job.
 */
export async function cancelProvisioningJob(
  jobId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const manager = new ProvisioningJobManager('aapanel');
    const canceled = await manager.cancelJob(jobId);
    if (!canceled) {
      return { success: false, error: 'Job could not be canceled' };
    }

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

/**
 * Get provisioning job details with logs.
 */
export async function getProvisioningDetails(jobId: string): Promise<{
  job: ProvisioningJobRow | null;
  logs: Array<unknown>;
  error?: string;
}> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return { job: null, logs: [], error: 'Unauthorized' };
    }

    const job = await getProvisioningJob(jobId);
    if (!job) {
      return { job: null, logs: [], error: 'Job not found' };
    }

    const logs = await getJobLogs(jobId);
    return {
      job,
      logs,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { job: null, logs: [], error: msg };
  }
}

/**
 * Check aaPanel provider health.
 */
export async function checkProvisioningHealth(): Promise<{
  healthy: boolean;
  message: string;
}> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return { healthy: false, message: 'Unauthorized' };
    }

    const manager = new ProvisioningJobManager('aapanel');
    const isHealthy = await manager.checkProviderHealth();

    return {
      healthy: isHealthy,
      message: isHealthy ? 'aaPanel provider is operational' : 'aaPanel provider is unreachable',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { healthy: false, message: msg };
  }
}
