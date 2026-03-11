// Provisioning Job Lifecycle Manager
// Orchestrates state transitions and provider execution

import type { ProvisioningContext, ProvisioningConfig, ProvisioningState, JobLogEntry } from './types';
import type { IProvisioningProvider } from './provider';
import { AapanelProvider } from './providers/aapanel';
import { updateProvisioningJob, createJobLog, getProvisioningJob } from '@/lib/db/provisioning';
import type { ProvisioningJobRow } from '@/lib/db/types';
import {
  createUserActivity,
  createUserNotification,
  updateWebsiteDeployment,
} from '@/lib/mysql/platform';
import {
  createProvisioningQueueJob,
  updateProvisioningQueueJob,
} from '@/lib/mysql/operations';

export class ProvisioningJobManager {
  private provider: IProvisioningProvider;
  private retryConfig = {
    maxAttempts: 3,
    delayMs: 2000,
    backoffMultiplier: 2,
  };

  constructor(providerName: string = 'aapanel') {
    // Provider factory - extensible for multiple providers
    this.provider = this.createProvider(providerName);
  }

  private createProvider(name: string): IProvisioningProvider {
    switch (name) {
      case 'aapanel':
        return new AapanelProvider();
      default:
        throw new Error(`Unknown provider: ${name}`);
    }
  }

  /**
   * Transition job to next state
   */
  private async transitionState(
    jobId: string,
    fromState: ProvisioningState,
    toState: ProvisioningState
  ): Promise<boolean> {
    // Validate state transition
    const validTransitions: Record<ProvisioningState, ProvisioningState[]> = {
      pending: ['queued', 'running', 'canceled'],
      queued: ['running', 'canceled'],
      running: ['completed', 'failed', 'canceled'],
      completed: [],
      failed: ['queued', 'running'], // Allow retry
      canceled: [],
    };

    if (!validTransitions[fromState]?.includes(toState)) {
      console.error(`[provisioning] Invalid transition: ${fromState} -> ${toState}`);
      return false;
    }

    const job = await getProvisioningJob(jobId);
    if (!job || job.status !== fromState) {
      console.error(`[provisioning] Job not in expected state. Expected: ${fromState}, Got: ${job?.status}`);
      return false;
    }

    const updates: Partial<ProvisioningJobRow> = { status: toState };

    if (toState === 'running' && !job.started_at) {
      updates.started_at = new Date().toISOString();
    }

    if ((toState === 'completed' || toState === 'failed') && !job.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const updated = await updateProvisioningJob(jobId, updates);
    return !!updated;
  }

  /**
   * Main provisioning workflow
   */
  async executeProvisioning(
    jobId: string,
    context: ProvisioningContext,
    config: ProvisioningConfig
  ): Promise<boolean> {
    try {
      const job = await getProvisioningJob(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Log handler that persists job logs
      const onProgress = async (log: JobLogEntry) => {
        log.jobId = jobId;
        const progress = this.calculateProgress(log.stepName);
        await createJobLog(log);
        
        // Update job progress
        await updateProvisioningJob(jobId, {
          current_step: log.stepName || log.message,
          progress,
        });

        await updateProvisioningQueueJob(jobId, {
          status: log.stepName === 'queued' ? 'pending' : 'running',
          progress,
          step: log.message,
          error: log.level === 'error' ? log.message : null,
        }).catch(() => {});
      };

      await createProvisioningQueueJob({
        id: jobId,
        websiteName: context.metadata?.projectName || context.subdomain,
        serverName: 'aaPanel',
        status: 'pending',
        progress: 0,
        step: 'Queued for provisioning',
      }).catch(() => {});

      if (job.status === 'pending') {
        await onProgress({
          jobId,
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Job queued for provisioning',
          stepName: 'queued',
        });
      }

      const fromState = job.status === 'failed' ? 'failed' : 'pending';
      await this.transitionState(jobId, fromState, 'running');
      await updateWebsiteDeployment(context.websiteId, {
        status: 'provisioning',
        provisioningError: null,
      }).catch(() => {});

      // Execute provisioning through provider
      const result = await this.executeWithRetry(
        () => this.provider.provisionWebsite(context, config, onProgress),
        jobId,
        onProgress
      );

      if (!result.success) {
        await this.transitionState(jobId, 'running', 'failed');
        await updateProvisioningJob(jobId, {
          error_message: result.error,
          progress: 100,
          current_step: 'failed',
        });
        await updateWebsiteDeployment(context.websiteId, {
          status: 'failed',
          provisioningError: result.error || 'Provisioning failed',
        }).catch(() => {});
        await updateProvisioningQueueJob(jobId, {
          status: 'failed',
          progress: 100,
          step: result.error || 'Provisioning failed',
          error: result.error || 'Provisioning failed',
        }).catch(() => {});
        await createUserActivity(context.userId, {
          activityType: 'provisioning_failed',
          message: `${context.metadata?.projectName || context.subdomain} provisioning failed.`,
        }).catch(() => {});
        await createUserNotification(context.userId, {
          title: 'Provisioning failed',
          message: `We could not finish provisioning ${context.metadata?.projectName || context.subdomain}.`,
        }).catch(() => {});
        return false;
      }

      // Transition: running -> completed
      await this.transitionState(jobId, 'running', 'completed');
      await updateProvisioningJob(jobId, {
        progress: 100,
        error_message: null,
        current_step: 'completed',
      });
      await updateWebsiteDeployment(context.websiteId, {
        status: 'ready',
        liveUrl: result.deploymentUrl ?? null,
        dashboardUrl: result.deploymentUrl ? `${result.deploymentUrl}/admin` : null,
        provisioningError: null,
      }).catch(() => {});
      await updateProvisioningQueueJob(jobId, {
        status: 'completed',
        progress: 100,
        step: 'Provisioning completed',
        error: null,
      }).catch(() => {});
      await createUserActivity(context.userId, {
        activityType: 'provisioning_completed',
        message: `${context.metadata?.projectName || context.subdomain} is ready.`,
      }).catch(() => {});
      await createUserNotification(context.userId, {
        title: 'Website is ready',
        message: `${context.metadata?.projectName || context.subdomain} has been provisioned successfully.`,
      }).catch(() => {});

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[provisioning] Job ${jobId} failed:`, message);
      
      await updateProvisioningJob(jobId, {
        status: 'failed',
        error_message: message,
        completed_at: new Date().toISOString(),
      });
      await updateWebsiteDeployment(context.websiteId, {
        status: 'failed',
        provisioningError: message,
      }).catch(() => {});
      await updateProvisioningQueueJob(jobId, {
        status: 'failed',
        progress: 100,
        step: message,
        error: message,
      }).catch(() => {});

      return false;
    }
  }

  /**
   * Execute with automatic retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    jobId: string,
    onProgress: (log: JobLogEntry) => Promise<void>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      if (attempt < this.retryConfig.maxAttempts) {
        const delayMs = this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        
        await onProgress({
          jobId,
          timestamp: new Date().toISOString(),
          level: 'warning',
          message: `Attempt ${attempt} failed: ${message}. Retrying in ${delayMs}ms...`,
        });

        await new Promise(r => setTimeout(r, delayMs));
        return this.executeWithRetry(fn, jobId, onProgress, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Cancel provisioning job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await getProvisioningJob(jobId);
    if (!job) return false;

    if (job.status === 'completed' || job.status === 'canceled') {
      return false; // Cannot cancel already completed or canceled jobs
    }

    const canceled = await this.provider.cancelProvisioning(jobId);
    if (canceled) {
      await this.transitionState(jobId, job.status, 'canceled');
      await createJobLog({
        jobId,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Job canceled by user',
      });
      await updateWebsiteDeployment(job.website_id, {
        status: 'failed',
        provisioningError: 'Provisioning canceled by admin',
      }).catch(() => {});
      await updateProvisioningQueueJob(jobId, {
        status: 'failed',
        progress: 100,
        step: 'Provisioning canceled',
        error: 'Provisioning canceled by admin',
      }).catch(() => {});
      if (job.user_id) {
        await createUserActivity(job.user_id, {
          activityType: 'provisioning_canceled',
          message: `${job.website_id} provisioning was canceled.`,
        }).catch(() => {});
        await createUserNotification(job.user_id, {
          title: 'Provisioning canceled',
          message: 'Your website provisioning was canceled by an administrator.',
        }).catch(() => {});
      }
    }

    return canceled;
  }

  /**
   * Retry failed job
   */
  async retryJob(
    jobId: string,
    context: ProvisioningContext,
    config: ProvisioningConfig
  ): Promise<boolean> {
    const job = await getProvisioningJob(jobId);
    if (!job || job.status !== 'failed') {
      return false;
    }

    await updateProvisioningJob(jobId, {
      status: 'pending',
      progress: 0,
      current_step: 'queued',
      error_message: null,
    });
    
    await createJobLog({
      jobId,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Job retried by admin',
    });

    return this.executeProvisioning(jobId, context, config);
  }

  /**
   * Calculate progress percentage based on step
   */
  private calculateProgress(step?: string): number {
    const progressMap: Record<string, number> = {
      'queued': 5,
      'validating_config': 5,
      'allocating_server': 15,
      'creating_database': 30,
      'setting_up_environment': 45,
      'deploying_application': 65,
      'configuring_domain': 80,
      'setting_up_ssl': 90,
      'finalizing': 95,
      'completed': 100,
    };

    return progressMap[step || 'pending'] || 0;
  }

  /**
   * Check provider health
   */
  async checkProviderHealth(): Promise<boolean> {
    try {
      const health = await this.provider.healthCheck();
      return health.healthy;
    } catch (error) {
      console.error('[provisioning] Provider health check failed:', error);
      return false;
    }
  }
}
