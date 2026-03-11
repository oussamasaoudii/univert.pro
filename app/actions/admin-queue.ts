'use server';

import { getAdminRequestUser } from '@/lib/api-auth';
import {
  cancelQueueJobById,
  getDeadLetterJobs,
  getJobsForProvisioning,
  getQueueStats,
  getRecentJobs,
  purgeCompletedJobsOlderThan,
  resetQueueJob,
  resolveDeadLetterJob,
  retryDeadLetterJob,
  type DeadLetterJob,
  type QueueJob,
} from '@/lib/queue/data-access';
import { revalidatePath } from 'next/cache';

async function requireAdmin(): Promise<string> {
  const adminUser = await getAdminRequestUser();
  if (!adminUser) {
    throw new Error('Unauthorized: Admin access required');
  }

  return adminUser.id;
}

export async function getQueueDashboard(): Promise<{
  stats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    deadLetter: number;
  };
  deadLetterJobs: DeadLetterJob[];
  recentJobs: QueueJob[];
}> {
  await requireAdmin();

  const [stats, deadLetterJobs, recentJobs] = await Promise.all([
    getQueueStats(),
    getDeadLetterJobs(20, true),
    getRecentJobs(20),
  ]);

  return {
    stats,
    deadLetterJobs,
    recentJobs,
  };
}

export async function resolveDeadLetter(
  deadLetterId: string,
  notes: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAdmin();
    const success = await resolveDeadLetterJob(deadLetterId, userId, notes);

    if (success) {
      revalidatePath('/admin/queue');
      return { success: true };
    }

    return { success: false, error: 'Failed to resolve dead letter' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function retryDeadLetter(
  deadLetterId: string,
): Promise<{ success: boolean; newJobId?: string; error?: string }> {
  try {
    await requireAdmin();
    const newJob = await retryDeadLetterJob(deadLetterId);

    if (newJob) {
      revalidatePath('/admin/queue');
      return { success: true, newJobId: newJob.id };
    }

    return { success: false, error: 'Failed to retry dead letter job' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function cancelQueueJob(
  jobId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const success = await cancelQueueJobById(jobId);
    if (!success) {
      return { success: false, error: 'Job could not be canceled' };
    }

    revalidatePath('/admin/queue');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function forceRetryJob(
  jobId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const success = await resetQueueJob(jobId);
    if (!success) {
      return { success: false, error: 'Failed to reset job for retry' };
    }

    revalidatePath('/admin/queue');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function getProvisioningQueueJobs(
  provisioningJobId: string,
): Promise<QueueJob[]> {
  await requireAdmin();
  return getJobsForProvisioning(provisioningJobId);
}

export async function purgeCompletedJobs(
  olderThanDays: number = 7,
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await requireAdmin();
    const count = await purgeCompletedJobsOlderThan(olderThanDays);
    revalidatePath('/admin/queue');
    return { success: true, count };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function triggerWorker(): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    await requireAdmin();
    const internalBaseUrl = process.env.INTERNAL_APP_URL?.trim() || 'http://127.0.0.1:3100';

    const response = await fetch(`${internalBaseUrl}/api/queue/worker`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'batch',
        maxIterations: 5,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { success: false, error: result?.error || 'Failed to trigger worker' };
    }

    revalidatePath('/admin/queue');
    return { success: true, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
