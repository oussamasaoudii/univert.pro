import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getAapanelConfig } from "@/lib/aapanel/config";
import { AapanelClient } from "@/lib/aapanel/client";
import { CloudflareClient, hasCloudflareDnsAccess } from "@/lib/cloudflare/client";
import {
  getUserDomains,
  createDomain,
  getDomain,
  removeDomainCascade,
  resetDnsVerificationAttempts,
  setPrimaryDomain,
  updateDomainStatus,
} from "@/lib/db/domains";
import { getWebsiteById } from "@/lib/db/websites";
import { toDashboardDomainRecord, type DashboardDomainRecord } from "@/lib/domain/dashboard-records";
import { DnsVerificationEngine } from "@/lib/domain/dns-verification";
import { DomainLifecycle } from "@/lib/domain/domain-lifecycle";
import { updateWebsiteDeployment } from "@/lib/mysql/platform";

const DEPLOYMENT_MARKER_FILE = ".ovmon-deployment.json";
const cloudflare = hasCloudflareDnsAccess() ? new CloudflareClient() : null;

async function reopenStaleVerificationFailure(domain: Awaited<ReturnType<typeof getDomain>>) {
  if (
    !domain ||
    domain.dns_status === "verified" ||
    typeof domain.error_message !== "string" ||
    !domain.error_message.includes("Maximum verification attempts")
  ) {
    return domain;
  }

  if (domain.status !== "failed" && domain.dns_status !== "failed") {
    return domain;
  }

  await resetDnsVerificationAttempts(domain.id);
  await updateDomainStatus(domain.id, {
    status: "verifying",
    dns_status: "verifying",
    failed_at: null,
    error_message: null,
  });

  return getDomain(domain.id);
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

function resolveSiteName(subdomain: string) {
  return `${subdomain}.${getAapanelConfig().platformSubdomainSuffix}`;
}

async function resolveWebRoot(sitePath: string) {
  const markerPath = path.join(sitePath, DEPLOYMENT_MARKER_FILE);
  const markerRaw = await fs.readFile(markerPath, "utf8").catch(() => "");
  if (!markerRaw.trim()) {
    return sitePath;
  }

  try {
    const marker = JSON.parse(markerRaw) as { profile?: string };
    if (marker.profile === "laravel") {
      return path.join(sitePath, "public");
    }
  } catch {
    // Fall back to the site root when the marker cannot be parsed.
  }

  return sitePath;
}

async function prepareVerificationMarker(input: {
  domainId: string;
  domainName: string;
  sitePath: string;
  websiteName: string | null;
  siteName: string;
}) {
  const webRoot = await resolveWebRoot(input.sitePath);
  const markerToken = crypto.randomBytes(24).toString("hex");
  const relativeMarkerPath = `/.well-known/univert-domain-check/${input.domainId}.txt`;
  const absoluteMarkerPath = path.join(
    webRoot,
    ".well-known",
    "univert-domain-check",
    `${input.domainId}.txt`,
  );

  await fs.mkdir(path.dirname(absoluteMarkerPath), { recursive: true });
  await fs.writeFile(absoluteMarkerPath, `${markerToken}\n`, "utf8");

  return {
    markerToken,
    relativeMarkerPath,
    metadata: {
      verificationMarkerPath: relativeMarkerPath,
      verificationMarkerToken: markerToken,
      siteName: input.siteName,
      websiteName: input.websiteName,
      boundForVerificationAt: new Date().toISOString(),
    },
  };
}

function getOriginIpAddress() {
  const env = getAapanelConfig();
  const hostname = new URL(env.baseUrl).hostname;
  return /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ? hostname : null;
}

async function ensureCustomDomainTargetRecord() {
  const env = getAapanelConfig();
  const targetHost = env.customDomainTargetHost.trim().toLowerCase();
  const platformRootDomain = env.platformRootDomain.trim().toLowerCase();
  const ipAddress = getOriginIpAddress();

  if (!cloudflare || !ipAddress || !targetHost.endsWith(`.${platformRootDomain}`)) {
    return;
  }

  await cloudflare.ensureHostnameARecord({
    name: targetHost,
    ipAddress,
    proxied: false,
  });
}

async function bindDomainToWebsite(input: {
  domainId: string;
  domainName: string;
  websiteId: string;
  websiteName: string | null;
  subdomain: string;
  existingMetadata?: Record<string, unknown>;
}) {
  const siteName = resolveSiteName(input.subdomain);
  const client = new AapanelClient();
  const site = await client.getSiteByName(siteName);
  if (!site) {
    throw new Error(`aaPanel site not found for ${siteName}`);
  }

  try {
    await client.addDomain(site.id, siteName, input.domainName);
  } catch (error) {
    if (!isAlreadyExistsError(error)) {
      throw error;
    }
  }

  const marker = await prepareVerificationMarker({
    domainId: input.domainId,
    domainName: input.domainName,
    sitePath: site.path,
    websiteName: input.websiteName,
    siteName,
  });

  await updateDomainStatus(input.domainId, {
    website_id: input.websiteId,
    metadata: {
      ...(input.existingMetadata || {}),
      ...marker.metadata,
      websiteName: input.websiteName,
    },
  });

  return { siteName };
}

export async function listDashboardDomainsForUser(userId: string): Promise<DashboardDomainRecord[]> {
  const ownedDomains = (await Promise.all((await getUserDomains(userId)).map((domain) => reopenStaleVerificationFailure(domain))))
    .filter(Boolean)
    .sort((left, right) => {
      if (left.is_primary === right.is_primary) {
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      }
      return left.is_primary ? -1 : 1;
    });

  return Promise.all(ownedDomains.map((domain) => toDashboardDomainRecord(domain)));
}

export async function getOwnedDashboardDomain(
  userId: string,
  domainId: string,
): Promise<DashboardDomainRecord | null> {
  const domain = await reopenStaleVerificationFailure(await getDomain(domainId));
  if (!domain || domain.user_id !== userId) {
    return null;
  }

  return toDashboardDomainRecord(domain);
}

export async function createCustomDomainForUser(input: {
  userId: string;
  websiteId?: string | null;
  domain: string;
  isPrimary?: boolean;
}): Promise<
  | { success: true; domain: DashboardDomainRecord }
  | { success: false; error: string; status?: number }
> {
  const validation = DnsVerificationEngine.validateDomain(input.domain);
  if (!validation.valid) {
    return { success: false, error: validation.error || "invalid_domain", status: 400 };
  }

  const availability = await DnsVerificationEngine.checkDomainAvailability(input.domain);
  if (!availability.available) {
    return { success: false, error: "already_exists", status: 409 };
  }

  const website = input.websiteId ? await getWebsiteById(input.websiteId) : null;
  if (input.websiteId && (!website || website.user_id !== input.userId)) {
    return { success: false, error: "website_not_found", status: 404 };
  }

  await ensureCustomDomainTargetRecord();

  const domain = await createDomain(input.userId, input.websiteId || null, input.domain, "custom_domain");
  if (!domain) {
    return { success: false, error: "failed_to_create_domain", status: 500 };
  }

  const lifecycle = new DomainLifecycle();
  const initiated = await lifecycle.initiateVerification(
    domain.id,
    input.websiteId,
    input.userId,
    domain.domain,
  );

  if (!initiated.success) {
    await removeDomainCascade(domain.id);
    return { success: false, error: initiated.error || "failed_to_start_verification", status: 500 };
  }

  try {
    if (website) {
      await bindDomainToWebsite({
        domainId: domain.id,
        domainName: domain.domain,
        websiteId: website.id,
        websiteName: website.project_name || null,
        subdomain: website.subdomain,
        existingMetadata: domain.metadata || {},
      });
    }
  } catch (error) {
    await removeDomainCascade(domain.id);
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed_to_bind_domain",
      status: 500,
    };
  }

  if (input.isPrimary && input.websiteId) {
    await setPrimaryDomain(input.websiteId, domain.id);
  }

  const fresh = await getDomain(domain.id);
  if (!fresh) {
    return { success: false, error: "domain_not_found", status: 404 };
  }

  return {
    success: true,
    domain: await toDashboardDomainRecord(fresh),
  };
}

export async function assignDashboardDomainToWebsiteForUser(input: {
  userId: string;
  domainId: string;
  websiteId: string;
  isPrimary?: boolean;
}): Promise<
  | { success: true; domain: DashboardDomainRecord; message: string }
  | { success: false; error: string; status?: number }
> {
  const domain = await getDomain(input.domainId);
  if (!domain || domain.user_id !== input.userId) {
    return { success: false, error: "domain_not_found", status: 404 };
  }

  const website = await getWebsiteById(input.websiteId);
  if (!website || website.user_id !== input.userId) {
    return { success: false, error: "website_not_found", status: 404 };
  }

  if (domain.website_id && domain.website_id !== website.id && domain.status === "active") {
    return { success: false, error: "active_domains_cannot_be_reassigned_yet", status: 409 };
  }

  if (domain.website_id && domain.website_id !== website.id) {
    const previousWebsite = await getWebsiteById(domain.website_id);
    if (previousWebsite) {
      const previousSiteName = resolveSiteName(previousWebsite.subdomain);
      const client = new AapanelClient();
      const previousSite = await client.getSiteByName(previousSiteName).catch(() => null);
      if (previousSite) {
        await client.removeDomain(previousSite.id, previousSiteName, domain.domain).catch(() => undefined);
      }

      if (previousWebsite.custom_domain === domain.domain) {
        await updateWebsiteDeployment(previousWebsite.id, {
          customDomain: null,
          liveUrl: `${getAapanelConfig().defaultProtocol}://${previousSiteName}`,
        });
      }
    }
  }

  await bindDomainToWebsite({
    domainId: domain.id,
    domainName: domain.domain,
    websiteId: website.id,
    websiteName: website.project_name || null,
    subdomain: website.subdomain,
    existingMetadata: domain.metadata || {},
  });

  if (input.isPrimary) {
    await setPrimaryDomain(website.id, domain.id);
  }

  if (domain.dns_status === "verified") {
    const lifecycle = new DomainLifecycle();
    const ssl = await lifecycle.provisionSsl(domain.id, website.id, input.userId, domain.domain);
    if (!ssl.success) {
      return { success: false, error: ssl.error || "ssl_provisioning_failed", status: 500 };
    }
  }

  const fresh = await getDomain(domain.id);
  if (!fresh) {
    return { success: false, error: "domain_not_found", status: 404 };
  }

  return {
    success: true,
    domain: await toDashboardDomainRecord(fresh),
    message:
      fresh.dns_status === "verified"
        ? "Domain bound successfully and SSL has been issued."
        : "Domain bound successfully. Finish DNS verification to activate SSL.",
  };
}

export async function verifyDashboardDomainForUser(input: {
  userId: string;
  domainId: string;
}): Promise<
  | { success: true; domain: DashboardDomainRecord; message: string }
  | { success: false; error: string; domain?: DashboardDomainRecord; status?: number; pending?: boolean }
> {
  let domain = await reopenStaleVerificationFailure(await getDomain(input.domainId));
  if (!domain || domain.user_id !== input.userId) {
    return { success: false, error: "domain_not_found", status: 404 };
  }

  if (domain.dns_status === "verified") {
    if (!domain.website_id) {
      return {
        success: true,
        domain: await toDashboardDomainRecord(domain),
        message: "Domain ownership is already verified. You can now bind it to a website.",
      };
    }

    if (domain.ssl_status === "issued") {
      return {
        success: true,
        domain: await toDashboardDomainRecord(domain),
        message: "Domain is already verified and secured.",
      };
    }

    const lifecycle = new DomainLifecycle();
    const ssl = await lifecycle.provisionSsl(domain.id, domain.website_id, input.userId, domain.domain);
    const refreshed = await getDomain(domain.id);
    if (!refreshed) {
      return { success: false, error: "domain_not_found", status: 404 };
    }

    if (!ssl.success) {
      return {
        success: false,
        error: ssl.error || "ssl_provisioning_failed",
        status: 500,
        domain: await toDashboardDomainRecord(refreshed),
      };
    }

    return {
      success: true,
      domain: await toDashboardDomainRecord(refreshed),
      message: "Domain verified and SSL issued",
    };
  }

  const lifecycle = new DomainLifecycle();
  const verification = await lifecycle.completeDnsVerification(
    domain.id,
    domain.website_id,
    input.userId,
    domain.domain,
  );

  if (!verification.success) {
    const fresh = await getDomain(domain.id);
    return {
      success: false,
      error: verification.error || "dns_not_verified",
      pending: verification.pending,
      domain: fresh ? await toDashboardDomainRecord(fresh) : undefined,
      status: verification.pending ? 202 : 400,
    };
  }

  if (!domain.website_id) {
    const freshUnbound = await getDomain(domain.id);
    if (!freshUnbound) {
      return { success: false, error: "domain_not_found", status: 404 };
    }

    return {
      success: true,
      domain: await toDashboardDomainRecord(freshUnbound),
      message: "Domain ownership verified. You can now bind it to a website.",
    };
  }

  const ssl = await lifecycle.provisionSsl(
    domain.id,
    domain.website_id,
    input.userId,
    domain.domain,
  );

  const fresh = await getDomain(domain.id);
  if (!fresh) {
    return { success: false, error: "domain_not_found", status: 404 };
  }

  if (!ssl.success) {
    return {
      success: false,
      error: ssl.error || "ssl_provisioning_failed",
      status: 500,
      domain: await toDashboardDomainRecord(fresh),
    };
  }

  return {
    success: true,
    domain: await toDashboardDomainRecord(fresh),
    message: "Domain verified and SSL issued",
  };
}

export async function deleteDashboardDomainForUser(input: {
  userId: string;
  domainId: string;
}): Promise<{ success: boolean; error?: string; status?: number }> {
  const domain = await getDomain(input.domainId);
  if (!domain || domain.user_id !== input.userId) {
    return { success: false, error: "domain_not_found", status: 404 };
  }

  const website = await getWebsiteById(domain.website_id);
  if (domain.website_id && (!website || website.user_id !== input.userId)) {
    return { success: false, error: "website_not_found", status: 404 };
  }

  if (website) {
    const siteName = resolveSiteName(website.subdomain);
    const client = new AapanelClient();
    const site = await client.getSiteByName(siteName).catch(() => null);
    if (site && domain.domain !== siteName) {
      try {
        await client.removeDomain(site.id, siteName, domain.domain);
      } catch (error) {
        if (!isAlreadyExistsError(error)) {
          console.warn(`[domains] Failed to remove bound domain ${domain.domain} from aaPanel:`, error);
        }
      }
    }

    if (website.custom_domain === domain.domain) {
      await updateWebsiteDeployment(website.id, {
        customDomain: null,
        liveUrl: `${getAapanelConfig().defaultProtocol}://${siteName}`,
      });
    }

    const markerPath =
      typeof domain.metadata.verificationMarkerPath === "string"
        ? domain.metadata.verificationMarkerPath
        : null;
    const markerSitePath =
      typeof domain.metadata.siteName === "string" ? domain.metadata.siteName : siteName;
    if (markerPath && markerSitePath) {
      const boundSite = await client.getSiteByName(markerSitePath).catch(() => null);
      if (boundSite) {
        const webRoot = await resolveWebRoot(boundSite.path);
        const absolutePath = path.join(webRoot, markerPath.replace(/^\//, ""));
        await fs.rm(absolutePath, { force: true }).catch(() => undefined);
      }
    }
  }

  const removed = await removeDomainCascade(domain.id);
  if (!removed) {
    return { success: false, error: "failed_to_delete_domain", status: 500 };
  }

  return { success: true };
}
