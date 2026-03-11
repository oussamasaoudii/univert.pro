import type { DnsRecord } from "@/lib/types";
import type { DomainRow } from "@/lib/db/types";
import { getDnsVerification, getSslCertificate } from "@/lib/db/domains";
import { getWebsiteById } from "@/lib/db/websites";

export type DashboardDomainRecord = {
  id: string;
  userId: string;
  websiteId: string | null;
  websiteName: string | null;
  domain: string;
  isPrimary: boolean;
  verificationStatus: "pending" | "verified" | "failed";
  sslStatus: "pending" | "active" | "expired" | "failed";
  status: DomainRow["status"];
  domainType: DomainRow["domain_type"];
  dnsRecords: DnsRecord[];
  instructions: string[];
  ownerTokenRecord: DnsRecord | null;
  routingRecord: DnsRecord | null;
  dnsVerifiedAt: string | null;
  sslExpiresAt: string | null;
  lastCheckedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

type DomainDnsRecordShape = {
  type?: string;
  name?: string;
  value?: string;
  ttl?: number;
};

function asDnsRecord(value: unknown): DnsRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as DomainDnsRecordShape;
  if (!record.type || !record.name || !record.value) {
    return null;
  }

  return {
    type: record.type,
    name: record.name,
    value: record.value,
    ttl: typeof record.ttl === "number" ? record.ttl : undefined,
  };
}

function flattenDnsRecords(dnsRecords: Record<string, unknown>): DnsRecord[] {
  const explicitRecords = Array.isArray(dnsRecords.records)
    ? dnsRecords.records.map(asDnsRecord).filter(Boolean)
    : [];

  if (explicitRecords.length > 0) {
    return explicitRecords as DnsRecord[];
  }

  const fallbackRecords = [
    asDnsRecord(dnsRecords.verification),
    asDnsRecord(dnsRecords.routing),
  ].filter(Boolean);

  return fallbackRecords as DnsRecord[];
}

function getInstructions(dnsRecords: Record<string, unknown>) {
  if (!Array.isArray(dnsRecords.instructions)) {
    return [];
  }

  return dnsRecords.instructions.filter(
    (instruction): instruction is string => typeof instruction === "string" && instruction.trim().length > 0,
  );
}

function mapVerificationStatus(domain: DomainRow): DashboardDomainRecord["verificationStatus"] {
  if (domain.dns_status === "verified" || domain.status === "active") {
    return "verified";
  }

  if (domain.status === "failed" || domain.dns_status === "failed") {
    return "failed";
  }

  return "pending";
}

function mapSslStatus(domain: DomainRow): DashboardDomainRecord["sslStatus"] {
  if (domain.ssl_status === "issued") {
    return "active";
  }

  if (domain.ssl_status === "failed") {
    return "failed";
  }

  if (domain.ssl_expires_at) {
    const expiresAt = new Date(domain.ssl_expires_at).getTime();
    if (!Number.isNaN(expiresAt) && expiresAt < Date.now()) {
      return "expired";
    }
  }

  return "pending";
}

export async function toDashboardDomainRecord(domain: DomainRow): Promise<DashboardDomainRecord> {
  const [verification, certificate, website] = await Promise.all([
    getDnsVerification(domain.id),
    getSslCertificate(domain.id),
    domain.website_id ? getWebsiteById(domain.website_id) : Promise.resolve(null),
  ]);

  return {
    id: domain.id,
    userId: domain.user_id,
    websiteId: domain.website_id,
    websiteName: domain.metadata.websiteName ?? website?.project_name ?? null,
    domain: domain.domain,
    isPrimary: domain.is_primary,
    verificationStatus: mapVerificationStatus(domain),
    sslStatus: mapSslStatus(domain),
    status: domain.status,
    domainType: domain.domain_type,
    dnsRecords: flattenDnsRecords(domain.dns_records),
    instructions: getInstructions(domain.dns_records),
    ownerTokenRecord: asDnsRecord(domain.dns_records.verification),
    routingRecord: asDnsRecord(domain.dns_records.routing),
    dnsVerifiedAt: domain.dns_verified_at,
    sslExpiresAt: domain.ssl_expires_at,
    lastCheckedAt: verification?.last_checked_at ?? null,
    errorMessage: domain.error_message,
    createdAt: domain.created_at,
    updatedAt: domain.updated_at,
  };
}
