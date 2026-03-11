// Provider Abstraction Interface
// Defines the contract that any infrastructure provider must implement

import type { ProvisioningResult, ProvisioningContext, ProvisioningConfig, JobLogEntry } from './types';

/**
 * Abstract interface for infrastructure providers
 * Implementations: aaPanel, AWS, DigitalOcean, etc.
 */
export interface IProvisioningProvider {
  /**
   * Provider name for identification
   */
  name: string;

  /**
   * Provision a complete environment for a website
   * This orchestrates: server allocation, database setup, domain linking, SSL
   */
  provisionWebsite(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<ProvisioningResult>;

  /**
   * Allocate or get a server for the website
   */
  allocateServer(
    context: ProvisioningContext,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ serverId: string; ipAddress: string }>;

  /**
   * Create database for the website
   */
  createDatabase(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ databaseId: string; host: string; port: number }>;

  /**
   * Deploy the application code
   */
  deployApplication(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ deploymentUrl: string; containerIds?: string[] }>;

  /**
   * Link custom domain to website
   */
  linkDomain(
    context: ProvisioningContext,
    domain: string,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ dnsRecords: Record<string, string> }>;

  /**
   * Activate SSL certificate
   */
  activateSSL(
    context: ProvisioningContext,
    domain: string,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ certificateId: string; expiresAt: string }>;

  /**
   * Get provisioning status
   */
  getProvisioningStatus(jobId: string): Promise<{
    progress: number;
    currentStep: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
  }>;

  /**
   * Cancel provisioning job
   */
  cancelProvisioning(jobId: string): Promise<boolean>;

  /**
   * Health check for provider connectivity
   */
  healthCheck(): Promise<{ healthy: boolean; message: string }>;
}

/**
 * Base class for providers to extend
 * Provides common functionality and error handling
 */
export abstract class BaseProvider implements IProvisioningProvider {
  abstract name: string;

  protected createLog(
    jobId: string,
    level: 'info' | 'warning' | 'error' | 'success',
    message: string,
    stepName?: string,
    details?: Record<string, any>
  ): JobLogEntry {
    return {
      jobId,
      timestamp: new Date().toISOString(),
      level,
      message,
      stepName,
      details,
    };
  }

  abstract provisionWebsite(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<ProvisioningResult>;

  abstract allocateServer(
    context: ProvisioningContext,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ serverId: string; ipAddress: string }>;

  abstract createDatabase(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ databaseId: string; host: string; port: number }>;

  abstract deployApplication(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ deploymentUrl: string; containerIds?: string[] }>;

  abstract linkDomain(
    context: ProvisioningContext,
    domain: string,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ dnsRecords: Record<string, string> }>;

  abstract activateSSL(
    context: ProvisioningContext,
    domain: string,
    onProgress: (log: JobLogEntry) => Promise<void>
  ): Promise<{ certificateId: string; expiresAt: string }>;

  abstract getProvisioningStatus(jobId: string): Promise<{
    progress: number;
    currentStep: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
  }>;

  abstract cancelProvisioning(jobId: string): Promise<boolean>;

  abstract healthCheck(): Promise<{ healthy: boolean; message: string }>;
}
