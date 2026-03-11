import { addDays } from "date-fns";
import { getAapanelConfig } from "@/lib/aapanel/config";
import { AapanelClient } from "@/lib/aapanel/client";
import { ensureSiteCertificateSsl } from "@/lib/aapanel/platform-subdomain-ssl";
import {
  createSslCertificate,
  getCertificatesExpiringSoon,
  getDomain,
  getSslCertificate,
  logDomainAction,
  updateDomainStatus,
  updateSslCertificate,
} from "@/lib/db/domains";
import type { SslCertificateRow } from "@/lib/db/types";
import { getWebsiteById } from "@/lib/db/websites";
import { updateWebsiteDeployment } from "@/lib/mysql/platform";

export interface SslProvisioningRequest {
  domain: string;
  subjectAltNames?: string[];
  autoRenewal?: boolean;
  provider?: "letsencrypt" | "zerossl";
}

export interface SslProvisioningResult {
  success: boolean;
  certificateId?: string;
  expiresAt?: string;
  issuedAt?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface SslRenewalResult {
  success: boolean;
  renewalCount: number;
  failedDomains: string[];
  errors: Record<string, string>;
}

function isAlreadyExistsError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("already exists") ||
    message.includes("the domain name already exists") ||
    message.includes("the specified domain already exists")
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asIsoDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function extractSslMetadata(payload: unknown) {
  const record = asRecord(payload);
  if (!record) {
    return {
      issuer: null,
      expiresAt: null,
    };
  }

  const issuer =
    typeof record.issuer === "string"
      ? record.issuer
      : typeof record.issuer_name === "string"
        ? record.issuer_name
        : null;

  const expiresAt =
    asIsoDate(record.endtime) ||
    asIsoDate(record.notAfter) ||
    asIsoDate(record.end_time) ||
    asIsoDate(record.endDate) ||
    null;

  return { issuer, expiresAt };
}

export class SslAutomationEngine {
  private readonly client = new AapanelClient();
  private readonly env = getAapanelConfig();
  private readonly certificateValidityDays = 90;
  private readonly renewalThresholdDays = 30;

  async requestSslCertificate(
    domainId: string,
    websiteId: string,
    userId: string,
    domain: string,
    options: SslProvisioningRequest = {},
  ): Promise<SslProvisioningResult> {
    try {
      if (!domain.trim()) {
        return { success: false, error: "Domain is required" };
      }

      const website = await getWebsiteById(websiteId);
      if (!website) {
        return { success: false, error: "Website not found" };
      }

      const siteName = `${website.subdomain}.${this.env.platformSubdomainSuffix}`;
      const site = await this.client.getSiteByName(siteName);
      if (!site) {
        return { success: false, error: `aaPanel site not found for ${siteName}` };
      }

      const certificate = await createSslCertificate(
        domainId,
        websiteId,
        userId,
        domain,
        options.subjectAltNames || [],
      );

      if (!certificate) {
        return { success: false, error: "Failed to create SSL certificate record" };
      }

      await updateDomainStatus(domainId, {
        status: "ssl_pending" as const,
        ssl_status: "requested" as const,
        error_message: null,
      });

      await updateSslCertificate(certificate.id, {
        status: "provisioning",
        provider: "aapanel_letsencrypt",
        metadata: {
          siteName,
          requestedAt: new Date().toISOString(),
        },
      });

      await logDomainAction(
        domainId,
        websiteId,
        userId,
        "ssl_requested",
        null,
        { certificateId: certificate.id, domain },
        { provider: "aapanel_letsencrypt", siteName },
      );

      try {
        await this.client.addDomain(site.id, siteName, domain);
      } catch (error) {
        if (!isAlreadyExistsError(error)) {
          throw error;
        }
      }

      const certificateDomains = Array.from(
        new Set([siteName, domain, ...(options.subjectAltNames || [])].filter(Boolean)),
      );

      const createResult = await this.client.createLetsEncryptCertificate({
        siteName,
        domains: certificateDomains,
        email: process.env.LETSENCRYPT_EMAIL || null,
      });

      await ensureSiteCertificateSsl({
        siteName,
        certificateName: siteName,
      });

      try {
        await this.client.enableHttpToHttps(siteName);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!message.toLowerCase().includes("already")) {
          console.warn(`[ssl-automation] Failed to force HTTPS for ${siteName}:`, error);
        }
      }

      const sslInfo = await this.client.getSsl(siteName).catch(() => null);
      const metadata = extractSslMetadata(sslInfo?.raw);
      const issuedAt = new Date().toISOString();
      const expiresAt = metadata.expiresAt || addDays(new Date(), this.certificateValidityDays).toISOString();
      const certificateId = `aapanel:${siteName}:${domain}`;

      await updateSslCertificate(certificate.id, {
        status: "issued",
        certificate_id: certificateId,
        issue_date: issuedAt,
        expires_at: expiresAt,
        provider: "aapanel_letsencrypt",
        metadata: {
          siteName,
          certificateDomains,
          createResult: createResult.raw,
          sslInfo: sslInfo?.raw ?? null,
        },
      });

      await updateDomainStatus(domainId, {
        status: "active" as const,
        ssl_status: "issued" as const,
        ssl_cert_id: certificateId,
        ssl_expires_at: expiresAt,
        verified_at: issuedAt,
        error_message: null,
      });

      await updateWebsiteDeployment(websiteId, {
        customDomain: domain,
        liveUrl: `https://${domain}`,
      });

      await logDomainAction(
        domainId,
        websiteId,
        userId,
        "ssl_issued",
        null,
        {
          certificateId,
          siteName,
          expiresAt,
        },
        {
          issuer: metadata.issuer,
        },
      );

      return {
        success: true,
        certificateId,
        expiresAt,
        issuedAt,
        details: {
          issuer: metadata.issuer,
          siteName,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "SSL provisioning failed";
      const certificate = await getSslCertificate(domainId);
      if (certificate) {
        await updateSslCertificate(certificate.id, {
          status: "failed",
          error_message: message,
        });
      }

      await updateDomainStatus(domainId, {
        status: "failed" as const,
        ssl_status: "failed" as const,
        error_message: message,
      });

      await logDomainAction(
        domainId,
        websiteId,
        userId,
        "ssl_failed",
        null,
        { domain, error: message },
      );

      return { success: false, error: message };
    }
  }

  async renewExpiringCertificates(): Promise<SslRenewalResult> {
    const expiring = await getCertificatesExpiringSoon(this.renewalThresholdDays);
    const result: SslRenewalResult = {
      success: true,
      renewalCount: 0,
      failedDomains: [],
      errors: {},
    };

    for (const certificate of expiring) {
      const renewal = await this.renewCertificate(certificate);
      if (renewal.success) {
        result.renewalCount += 1;
      } else {
        result.failedDomains.push(certificate.common_name);
        result.errors[certificate.common_name] = renewal.error || "Unknown renewal error";
      }
    }

    return result;
  }

  async handleRenewalFailure(
    certificateId: string,
    domainId: string,
    websiteId: string,
    userId: string,
    error: string,
  ): Promise<void> {
    await updateSslCertificate(certificateId, {
      renewal_status: "failed",
      error_message: error,
    });

    await updateDomainStatus(domainId, {
      ssl_status: "failed" as const,
      error_message: `SSL renewal failed: ${error}`,
    });

    await logDomainAction(
      domainId,
      websiteId,
      userId,
      "ssl_renewal_failed",
      null,
      { certificateId, error },
      { requiresManualIntervention: true },
    );
  }

  private async renewCertificate(
    certificate: SslCertificateRow,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateSslCertificate(certificate.id, {
        renewal_status: "in_progress",
        renewal_last_attempted: new Date().toISOString(),
      });

      const domain = await getDomain(certificate.domain_id);
      if (!domain) {
        throw new Error("Domain not found for renewal");
      }

      const website = await getWebsiteById(certificate.website_id);
      if (!website) {
        throw new Error("Website not found for renewal");
      }

      const siteName = `${website.subdomain}.${this.env.platformSubdomainSuffix}`;
      await this.client.createLetsEncryptCertificate({
        siteName,
        domains: [certificate.common_name],
        email: process.env.LETSENCRYPT_EMAIL || null,
      });

      const sslInfo = await this.client.getSsl(siteName).catch(() => null);
      const metadata = extractSslMetadata(sslInfo?.raw);
      const expiresAt = metadata.expiresAt || addDays(new Date(), this.certificateValidityDays).toISOString();

      await updateSslCertificate(certificate.id, {
        renewal_status: "completed",
        issue_date: new Date().toISOString(),
        expires_at: expiresAt,
        metadata: {
          ...certificate.metadata,
          renewedAt: new Date().toISOString(),
          sslInfo: sslInfo?.raw ?? null,
        },
      });

      await updateDomainStatus(domain.id, {
        ssl_status: "issued" as const,
        ssl_expires_at: expiresAt,
        error_message: null,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Certificate renewal failed";
      await updateSslCertificate(certificate.id, {
        renewal_status: "failed",
        error_message: message,
      });
      return { success: false, error: message };
    }
  }
}
