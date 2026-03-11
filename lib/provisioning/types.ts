// Provisioning Engine Type Definitions

/**
 * Lifecycle states for provisioning jobs
 * pending -> queued -> running -> completed/failed
 * canceled can happen at any point
 */
export type ProvisioningState = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'canceled';

/**
 * Steps within provisioning process
 */
export type ProvisioningStep = 
  | 'validating_config'
  | 'allocating_server'
  | 'creating_database'
  | 'setting_up_environment'
  | 'deploying_application'
  | 'configuring_domain'
  | 'setting_up_ssl'
  | 'finalizing'
  | 'completed'
  | 'failed';

/**
 * Provider-agnostic provisioning result
 */
export interface ProvisioningResult {
  success: boolean;
  serverId?: string;
  databaseId?: string;
  deploymentUrl?: string;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Context passed through provisioning workflow
 */
export interface ProvisioningContext {
  jobId: string;
  websiteId: string;
  userId: string;
  templateId: string;
  subdomain: string;
  customDomain?: string;
  metadata?: Record<string, any>;
}

/**
 * Configuration for a provisioning request
 */
export interface ProvisioningConfig {
  stack: 'laravel' | 'nextjs' | 'wordpress';
  environment: 'production' | 'staging';
  templateSlug?: string;
  templateSourcePath?: string;
  deploymentProfile?: string;
  siteRootPath?: string;
  scaling?: {
    minServers: number;
    maxServers: number;
  };
  backup?: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
  };
}

/**
 * Log entry for job audit trail
 */
export interface JobLogEntry {
  id?: string;
  jobId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: Record<string, any>;
  stepName?: string;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs?: number;
}
