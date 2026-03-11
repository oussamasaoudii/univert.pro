'use server';

import { getAdminRequestUser, getAuthenticatedRequestUser } from '@/lib/api-auth';
import { createDomain, getWebsiteDomains, getDomain } from '@/lib/db/domains';
import { DomainLifecycle } from '@/lib/domain/domain-lifecycle';
import { DnsVerificationEngine } from '@/lib/domain/dns-verification';
import type { DomainRow } from '@/lib/db/types';
import { getAapanelConfig } from '@/lib/aapanel/config';

const lifecycle = new DomainLifecycle();
const dnsEngine = new DnsVerificationEngine();

/**
 * User Action: Add custom domain
 */
export async function addCustomDomain(websiteId: string, domain: string): Promise<{ success: boolean; error?: string; domain?: DomainRow }> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate domain format
    const validation = DnsVerificationEngine.validateDomain(domain);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check availability
    const availability = await DnsVerificationEngine.checkDomainAvailability(domain);
    if (!availability.available) {
      return { success: false, error: `Domain ${domain} is already registered` };
    }

    // Create domain record
    const newDomain = await createDomain(
      user.id,
      websiteId,
      domain,
      'custom_domain'
    );

    if (!newDomain) {
      return { success: false, error: 'Failed to create domain' };
    }

    return { success: true, domain: newDomain };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to add domain';
    return { success: false, error: msg };
  }
}

/**
 * User Action: Start DNS verification
 */
export async function startDnsVerification(domainId: string): Promise<{
  success: boolean;
  error?: string;
  challenge?: any;
}> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const domain = await getDomain(domainId);
    if (!domain) {
      return { success: false, error: 'Domain not found' };
    }

    if (domain.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await lifecycle.initiateVerification(
      domainId,
      domain.website_id,
      user.id,
      domain.domain
    );

    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'DNS verification failed';
    return { success: false, error: msg };
  }
}

/**
 * User Action: Check DNS verification status
 */
export async function checkDnsVerificationStatus(domainId: string): Promise<{
  success: boolean;
  verified: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { success: false, verified: false, error: 'Unauthorized' };
    }

    const domain = await getDomain(domainId);
    if (!domain) {
      return { success: false, verified: false, error: 'Domain not found' };
    }

    if (domain.user_id !== user.id) {
      return { success: false, verified: false, error: 'Unauthorized' };
    }

    if (domain.status === 'active') {
      return { success: true, verified: true, message: 'Domain is active' };
    }

    if (domain.status === 'failed') {
      return { success: false, verified: false, error: domain.error_message || 'Domain verification failed' };
    }

    // Attempt to complete verification
    const result = await lifecycle.completeDnsVerification(
      domainId,
      domain.website_id,
      user.id,
      domain.domain
    );

    if (result.success) {
      // Provision SSL automatically
      await lifecycle.provisionSsl(
        domainId,
        domain.website_id,
        user.id,
        domain.domain
      );

      return { success: true, verified: true, message: 'Domain verified and SSL provisioned' };
    }

    return { success: false, verified: false, error: result.error };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Status check failed';
    return { success: false, verified: false, error: msg };
  }
}

/**
 * Admin Action: Process domain verification for platform subdomains
 */
export async function createPlatformSubdomain(
  websiteId: string,
  subdomain: string
): Promise<{ success: boolean; error?: string; domain?: DomainRow }> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return { success: false, error: 'Admin only' };
    }

    // Create platform subdomain
    const config = getAapanelConfig();
    const domain = await createDomain(
      adminUser.id,
      websiteId,
      `${subdomain}.${config.platformSubdomainSuffix}`,
      'platform_subdomain'
    );

    if (!domain) {
      return { success: false, error: 'Failed to create subdomain' };
    }

    return { success: true, domain };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create subdomain';
    return { success: false, error: msg };
  }
}

/**
 * Get domain status for user dashboard
 */
export async function getDomainStatus(domainId: string): Promise<{
  success: boolean;
  status?: any;
  error?: string;
}> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const domain = await getDomain(domainId);
    if (!domain || domain.user_id !== user.id) {
      return { success: false, error: 'Domain not found' };
    }

    const status = await lifecycle.getStatusSummary(domainId);
    return { success: true, status };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to get status';
    return { success: false, error: msg };
  }
}

/**
 * Get all domains for website
 */
export async function getWebsiteDomainsWithStatus(websiteId: string): Promise<{
  success: boolean;
  domains?: Array<DomainRow & { statusSummary?: any }>;
  error?: string;
}> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const domains = await getWebsiteDomains(websiteId);
    
    // Filter to user's domains
    const userDomains = domains.filter(d => d.user_id === user.id);

    // Enrich with status
    const enriched = await Promise.all(
      userDomains.map(async (domain) => ({
        ...domain,
        statusSummary: await lifecycle.getStatusSummary(domain.id),
      }))
    );

    return { success: true, domains: enriched };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to get domains';
    return { success: false, error: msg };
  }
}
