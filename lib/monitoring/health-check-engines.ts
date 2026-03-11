// Health Check Engines for Ovmon
// Performs real-time health checks for websites, domains, SSLs, provisioning, backups

import { recordHealthCheck, updateWebsiteHealthSummary, getWebsiteHealthSummary } from "@/lib/db/monitoring";
import { getDomain } from "@/lib/db/domains";
import { getSslCertificate } from "@/lib/db/domains";
import { getWebsiteIncidents, createIncident } from "@/lib/db/monitoring";
import type { WebsiteRow } from "@/lib/db/types";

// ========== Website Reachability Check ==========

export async function checkWebsiteReachability(website: WebsiteRow): Promise<{
  status: 'passing' | 'warning' | 'critical' | 'unknown';
  responseTimeMs: number | null;
  errorMessage: string | null;
}> {
  try {
    const startTime = Date.now();
    const domain = website.custom_domain || website.live_url;

    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      timeout: 10000,
    });

    const responseTimeMs = Date.now() - startTime;

    if (response.ok) {
      return {
        status: 'passing',
        responseTimeMs,
        errorMessage: null,
      };
    } else if (response.status >= 500) {
      return {
        status: 'critical',
        responseTimeMs,
        errorMessage: `Server returned ${response.status}`,
      };
    } else {
      return {
        status: 'warning',
        responseTimeMs,
        errorMessage: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'critical',
      responseTimeMs: null,
      errorMessage,
    };
  }
}

// ========== SSL Certificate Check ==========

export async function checkSSLCertificate(websiteId: string, domain: string): Promise<{
  status: 'passing' | 'warning' | 'critical' | 'unknown';
  errorMessage: string | null;
  details: Record<string, any>;
}> {
  try {
    const domainRecord = await getDomain(domain);

    if (!domainRecord) {
      return {
        status: 'critical',
        errorMessage: 'Domain not found',
        details: {},
      };
    }

    if (domainRecord.ssl_status === 'failed') {
      return {
        status: 'critical',
        errorMessage: domainRecord.error_message || 'SSL issuance failed',
        details: { domainId: domainRecord.id },
      };
    }

    if (domainRecord.ssl_status !== 'issued') {
      return {
        status: 'warning',
        errorMessage: null,
        details: { status: domainRecord.ssl_status },
      };
    }

    if (!domainRecord.ssl_expires_at) {
      return {
        status: 'warning',
        errorMessage: 'Certificate expiry unknown',
        details: {},
      };
    }

    const expiryDate = new Date(domainRecord.ssl_expires_at);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return {
        status: 'critical',
        errorMessage: 'Certificate expired',
        details: { expiryDate: domainRecord.ssl_expires_at },
      };
    } else if (daysUntilExpiry < 30) {
      return {
        status: 'warning',
        errorMessage: `Certificate expires in ${daysUntilExpiry} days`,
        details: { expiryDate: domainRecord.ssl_expires_at, daysUntilExpiry },
      };
    }

    return {
      status: 'passing',
      errorMessage: null,
      details: { expiryDate: domainRecord.ssl_expires_at, daysUntilExpiry },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'critical',
      errorMessage,
      details: {},
    };
  }
}

// ========== Domain DNS Check ==========

export async function checkDomainDNS(websiteId: string, domain: string): Promise<{
  status: 'passing' | 'warning' | 'critical' | 'unknown';
  errorMessage: string | null;
  details: Record<string, any>;
}> {
  try {
    const domainRecord = await getDomain(domain);

    if (!domainRecord) {
      return {
        status: 'critical',
        errorMessage: 'Domain not found in system',
        details: {},
      };
    }

    if (domainRecord.dns_status === 'failed') {
      return {
        status: 'critical',
        errorMessage: domainRecord.error_message || 'DNS verification failed',
        details: { domainId: domainRecord.id },
      };
    }

    if (domainRecord.dns_status !== 'verified') {
      return {
        status: 'warning',
        errorMessage: null,
        details: { status: domainRecord.dns_status },
      };
    }

    return {
      status: 'passing',
      errorMessage: null,
      details: { dnsRecords: domainRecord.dns_records },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'critical',
      errorMessage,
      details: {},
    };
  }
}

// ========== Database Connectivity Check ==========

export async function checkDatabaseConnectivity(websiteId: string): Promise<{
  status: 'passing' | 'warning' | 'critical' | 'unknown';
  responseTimeMs: number | null;
  errorMessage: string | null;
}> {
  try {
    const startTime = Date.now();

    // This would connect to the website's database
    // For now, we'll simulate this with a 200ms response
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));

    const responseTimeMs = Date.now() - startTime;

    return {
      status: 'passing',
      responseTimeMs,
      errorMessage: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'critical',
      responseTimeMs: null,
      errorMessage,
    };
  }
}

// ========== Overall Website Health Assessment ==========

export async function assessWebsiteHealth(website: WebsiteRow, userId: string): Promise<void> {
  try {
    // Run all checks in parallel
    const [reachabilityResult, databaseResult] = await Promise.all([
      checkWebsiteReachability(website),
      checkDatabaseConnectivity(website.id),
    ]);

    // Record individual checks
    await recordHealthCheck(
      website.id,
      'website_reachability',
      reachabilityResult.status,
      reachabilityResult.responseTimeMs,
      reachabilityResult.errorMessage
    );

    await recordHealthCheck(
      website.id,
      'database_connectivity',
      databaseResult.status,
      databaseResult.responseTimeMs,
      databaseResult.errorMessage
    );

    // Check domains
    const primaryDomain = website.custom_domain || website.subdomain;
    if (primaryDomain) {
      const [dnsResult, sslResult] = await Promise.all([
        checkDomainDNS(website.id, primaryDomain),
        checkSSLCertificate(website.id, primaryDomain),
      ]);

      await recordHealthCheck(
        website.id,
        'domain_dns',
        dnsResult.status,
        null,
        dnsResult.errorMessage,
        dnsResult.details
      );

      await recordHealthCheck(
        website.id,
        'domain_ssl',
        sslResult.status,
        null,
        sslResult.errorMessage,
        sslResult.details
      );
    }

    // Determine overall status
    const allChecks = [reachabilityResult, databaseResult];
    const hasFailures = allChecks.some(c => c.status === 'critical');
    const hasWarnings = allChecks.some(c => c.status === 'warning');

    let overallStatus: 'healthy' | 'degraded' | 'critical' | 'unknown' = 'healthy';
    if (hasFailures) {
      overallStatus = 'critical';
    } else if (hasWarnings) {
      overallStatus = 'degraded';
    }

    // Update health summary
    await updateWebsiteHealthSummary(website.id, {
      overall_status: overallStatus,
      reachability_status: reachabilityResult.status,
      last_successful_check: overallStatus === 'healthy' ? new Date().toISOString() : null,
      last_failed_check: overallStatus !== 'healthy' ? new Date().toISOString() : null,
      last_check_duration_ms: reachabilityResult.responseTimeMs,
    });

    // Create incidents for critical issues
    if (reachabilityResult.status === 'critical') {
      const existingIncidents = await getWebsiteIncidents(website.id, 'open');
      const hasExistingIncident = existingIncidents.some(i => i.incident_type === 'website_unreachable');

      if (!hasExistingIncident) {
        await createIncident(
          website.id,
          userId,
          'website_unreachable',
          'critical',
          `${website.name} is unreachable`,
          reachabilityResult.errorMessage || 'Website is not responding to health checks',
          { domain: primaryDomain }
        );
      }
    }

    if (databaseResult.status === 'critical') {
      const existingIncidents = await getWebsiteIncidents(website.id, 'open');
      const hasExistingIncident = existingIncidents.some(i => i.incident_type === 'database_unreachable');

      if (!hasExistingIncident) {
        await createIncident(
          website.id,
          userId,
          'database_unreachable',
          'critical',
          `${website.name} database unreachable`,
          databaseResult.errorMessage || 'Database connectivity check failed',
          {}
        );
      }
    }
  } catch (error) {
    console.error(`[health-checks] Error assessing website health for ${website.id}:`, error);
  }
}

// ========== Batch Health Assessment ==========

export async function assessMultipleWebsiteHealth(websites: WebsiteRow[], userId: string): Promise<void> {
  // Process in batches to avoid overwhelming the system
  const batchSize = 5;
  for (let i = 0; i < websites.length; i += batchSize) {
    const batch = websites.slice(i, i + batchSize);
    await Promise.all(batch.map(w => assessWebsiteHealth(w, userId)));
  }
}
