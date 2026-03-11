// Domain Lifecycle State Machine for Ovmon
// Manages state transitions for domains through their entire lifecycle

import { getDomain, updateDomainStatus, logDomainAction } from '@/lib/db/domains';
import { DnsVerificationEngine } from './dns-verification';
import { SslAutomationEngine } from './ssl-automation';
import type { DomainRow } from '@/lib/db/types';

export type DomainState = 'pending' | 'verifying' | 'verified' | 'ssl_pending' | 'active' | 'failed';
export type DomainTransition = {
  from: DomainState;
  to: DomainState;
  action: string;
  condition?: () => Promise<boolean>;
};

/**
 * Domain Lifecycle State Machine
 * Orchestrates domain state transitions and events
 */
export class DomainLifecycle {
  private dnsEngine = new DnsVerificationEngine();
  private sslEngine = new SslAutomationEngine();

  // State transition graph
  private stateTransitions: Record<DomainState, DomainState[]> = {
    pending: ['verifying', 'failed'],
    verifying: ['verified', 'failed'],
    verified: ['ssl_pending', 'failed'],
    ssl_pending: ['active', 'failed'],
    active: ['active', 'failed'], // Can stay active or fail
    failed: ['pending', 'verifying'], // Can retry from certain states
  };

  /**
   * Check if transition is allowed
   */
  canTransition(fromState: DomainState, toState: DomainState): boolean {
    const allowedTransitions = this.stateTransitions[fromState] || [];
    return allowedTransitions.includes(toState);
  }

  /**
   * Handle domain verification initiation
   */
  async initiateVerification(
    domainId: string,
    websiteId: string | null,
    userId: string,
    domain: string
  ): Promise<{ success: boolean; challenge?: any; error?: string }> {
    const domainRecord = await getDomain(domainId);

    if (!domainRecord) {
      return { success: false, error: 'Domain not found' };
    }

    // Validate state transition
    if (!this.canTransition(domainRecord.status as DomainState, 'verifying')) {
      return {
        success: false,
        error: `Cannot transition from ${domainRecord.status} to verifying`,
      };
    }

    // Initiate DNS verification
    const result = await this.dnsEngine.initiateVerification(
      domainId,
      websiteId,
      userId,
      domain
    );

    if ('error' in result) {
      await updateDomainStatus(domainId, {
        status: 'failed' as any,
        error_message: result.error,
      });

      await logDomainAction(
        domainId,
        websiteId,
        userId,
        'verification_initiation_failed',
        null,
        { error: result.error }
      );

      return { success: false, error: result.error };
    }

    return {
      success: true,
      challenge: result.verification,
    };
  }

  /**
   * Handle DNS verification completion
   */
  async completeDnsVerification(
    domainId: string,
    websiteId: string | null,
    userId: string,
    domain: string
  ): Promise<{ success: boolean; pending?: boolean; error?: string }> {
    const domainRecord = await getDomain(domainId);

    if (!domainRecord) {
      return { success: false, error: 'Domain not found' };
    }

    if (domainRecord.status !== 'verifying') {
      return {
        success: false,
        error: `Domain is not in verifying state (current: ${domainRecord.status})`,
      };
    }

    // Verify DNS records
    const verificationResult = await this.dnsEngine.verifyDnsRecord(
      domainId,
      domain,
      30 // Max attempts
    );

    if (!verificationResult.verified) {
      const shouldRemainPending = verificationResult.retryable !== false;

      await updateDomainStatus(domainId, {
        status: (shouldRemainPending ? 'verifying' : 'failed') as any,
        dns_status: (shouldRemainPending ? 'verifying' : 'failed') as any,
        error_message: verificationResult.error || null,
      });

      await logDomainAction(
        domainId,
        websiteId,
        userId,
        'dns_verification_failed',
        { status: domainRecord.status },
        {
          status: shouldRemainPending ? 'verifying' : 'failed',
          error: verificationResult.error,
          retryable: shouldRemainPending,
        }
      );

      return {
        success: false,
        pending: shouldRemainPending,
        error: verificationResult.error,
      };
    }

    // Mark DNS as verified
    await updateDomainStatus(domainId, {
      status: 'verified' as any,
      dns_status: 'verified' as any,
      dns_verified_at: new Date().toISOString(),
      error_message: null,
    });

    await logDomainAction(
      domainId,
      websiteId,
      userId,
      'dns_verified',
      { status: 'verifying' },
      { status: 'verified', dns_verified_at: new Date().toISOString() }
    );

    return { success: true };
  }

  /**
   * Handle SSL provisioning
   */
  async provisionSsl(
    domainId: string,
    websiteId: string,
    userId: string,
    domain: string
  ): Promise<{ success: boolean; error?: string }> {
    const domainRecord = await getDomain(domainId);

    if (!domainRecord) {
      return { success: false, error: 'Domain not found' };
    }

    // DNS must be verified first
    if (domainRecord.dns_status !== 'verified') {
      return {
        success: false,
        error: `DNS must be verified before SSL provisioning (current: ${domainRecord.dns_status})`,
      };
    }

    await updateDomainStatus(domainId, {
      status: 'ssl_pending' as any,
      error_message: null,
    });

    // Request SSL certificate
    const sslResult = await this.sslEngine.requestSslCertificate(
      domainId,
      websiteId,
      userId,
      domain
    );

    if (!sslResult.success) {
      await updateDomainStatus(domainId, {
        status: 'failed' as any,
        error_message: sslResult.error,
      });

      await logDomainAction(
        domainId,
        websiteId,
        userId,
        'ssl_provisioning_failed',
        { status: domainRecord.status },
        { status: 'failed', error: sslResult.error }
      );

      return { success: false, error: sslResult.error };
    }

    await logDomainAction(
      domainId,
      websiteId,
      userId,
      'domain_activated',
      { status: 'verified' },
      {
        status: 'active',
        ssl_cert_id: sslResult.certificateId,
        ssl_expires_at: sslResult.expiresAt,
      }
    );

    return { success: true };
  }

  /**
   * Handle domain failure
   */
  async failDomain(
    domainId: string,
    websiteId: string,
    userId: string,
    reason: string
  ): Promise<boolean> {
    const domainRecord = await getDomain(domainId);

    if (!domainRecord) {
      return false;
    }

    await updateDomainStatus(domainId, {
      status: 'failed' as any,
      failed_at: new Date().toISOString(),
      error_message: reason,
    });

    await logDomainAction(
      domainId,
      websiteId,
      userId,
      'domain_failed',
      { status: domainRecord.status },
      { status: 'failed', reason }
    );

    return true;
  }

  /**
   * Handle domain retry
   */
  async retryDomain(
    domainId: string,
    websiteId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const domainRecord = await getDomain(domainId);

    if (!domainRecord) {
      return { success: false, error: 'Domain not found' };
    }

    if (domainRecord.status !== 'failed') {
      return { success: false, error: 'Domain is not in failed state' };
    }

    // Reset to pending for retry
    await updateDomainStatus(domainId, {
      status: 'pending' as any,
      error_message: null,
      failed_at: null,
    });

    await logDomainAction(
      domainId,
      websiteId,
      userId,
      'domain_retry',
      { status: 'failed' },
      { status: 'pending' }
    );

    return { success: true };
  }

  /**
   * Get domain status summary
   */
  async getStatusSummary(domainId: string): Promise<{
    state: DomainState;
    dnsStatus: string;
    sslStatus: string;
    progress: number;
    nextStep?: string;
    error?: string;
  } | null> {
    const domain = await getDomain(domainId);

    if (!domain) {
      return null;
    }

    let progress = 0;
    let nextStep = '';

    switch (domain.status) {
      case 'pending':
        progress = 0;
        nextStep = 'Start DNS verification';
        break;
      case 'verifying':
        progress = 25;
        nextStep = 'Waiting for DNS propagation...';
        break;
      case 'verified':
        progress = 50;
        nextStep = 'Request SSL certificate';
        break;
      case 'ssl_pending':
        progress = 75;
        nextStep = 'SSL provisioning in progress...';
        break;
      case 'active':
        progress = 100;
        nextStep = undefined;
        break;
      case 'failed':
        progress = 0;
        nextStep = 'Retry or contact support';
        break;
    }

    return {
      state: domain.status as DomainState,
      dnsStatus: domain.dns_status,
      sslStatus: domain.ssl_status,
      progress,
      nextStep,
      error: domain.error_message || undefined,
    };
  }
}
