import crypto from "node:crypto";
import * as dns from "node:dns";
import { isIP } from "node:net";
import { promisify } from "node:util";
import { getAapanelConfig } from "@/lib/aapanel/config";
import {
  createDnsVerification,
  getDnsVerification,
  getDomain,
  incrementDnsVerificationAttempt,
  logDomainAction,
  markDnsVerified,
  updateDomainStatus,
} from "@/lib/db/domains";
import type { DomainRow } from "@/lib/db/types";
import type { DnsRecord } from "@/lib/types";

const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);

export interface DnsVerificationResult {
  success: boolean;
  verified: boolean;
  pending?: boolean;
  retryable?: boolean;
  record: DnsRecord;
  foundValue?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface DnsVerificationChallenge {
  recordType: "TXT";
  recordName: string;
  recordValue: string;
  instructions: string;
  exampleSteps: string[];
  records: DnsRecord[];
  verificationRecord: DnsRecord;
  routingRecord: DnsRecord;
}

function hasResolvedAddresses(result: DnsVerificationResult) {
  const addresses = result.details?.addresses;
  return Array.isArray(addresses) && addresses.length > 0;
}

type ExpectedDnsConfiguration = {
  verificationRecord: DnsRecord;
  routingRecord: DnsRecord;
};

function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*/, "").replace(/\.$/, "");
}

function isDnsPropagationError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("enotfound") ||
    normalized.includes("enodata") ||
    normalized.includes("servfail") ||
    normalized.includes("timeout") ||
    normalized.includes("querya") ||
    normalized.includes("querytxt")
  );
}

function buildExpectedDnsConfiguration(domain: string, token: string): ExpectedDnsConfiguration {
  const normalizedDomain = normalizeDomain(domain);
  const env = getAapanelConfig();
  return {
    verificationRecord: {
      type: "TXT",
      name: `_univert-verify.${normalizedDomain}`,
      value: token,
      ttl: 300,
    },
    routingRecord: {
      type: "CNAME",
      name: normalizedDomain,
      value: env.customDomainTargetHost,
      ttl: 300,
    },
  };
}

function extractExpectedDnsConfiguration(
  domain: string,
  token: string,
  domainRecord?: DomainRow | null,
): ExpectedDnsConfiguration {
  const fallback = buildExpectedDnsConfiguration(domain, token);
  if (!domainRecord) {
    return fallback;
  }

  const verificationRecord = asDnsRecord(domainRecord.dns_records.verification) || fallback.verificationRecord;
  const routingRecord = asDnsRecord(domainRecord.dns_records.routing) || fallback.routingRecord;
  return { verificationRecord, routingRecord };
}

function asDnsRecord(value: unknown): DnsRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<DnsRecord>;
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

function flattenTxtRecords(records: string[][]) {
  return records.map((entry) => entry.join("")).filter(Boolean);
}

export class DnsVerificationEngine {
  // Allow verification to keep polling for up to 48 hours before giving up.
  private readonly maxVerificationAttempts = 2880;

  async generateVerificationRecords(domain: string): Promise<DnsVerificationChallenge> {
    const normalizedDomain = normalizeDomain(domain);
    const token = `univert-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const expected = buildExpectedDnsConfiguration(normalizedDomain, token);

    const exampleSteps = [
      `Add a CNAME record for ${expected.routingRecord.name} pointing to ${expected.routingRecord.value}.`,
      `Add a TXT record for ${expected.verificationRecord.name} with the value ${expected.verificationRecord.value}.`,
      `If you are connecting the apex/root domain, use ALIAS, ANAME, or CNAME flattening to ${expected.routingRecord.value} when your DNS provider supports it.`,
      "If your DNS provider does not support root-domain flattening, you can use an A record that points to the platform origin as a fallback.",
      "Return to the dashboard and click Refresh verification.",
    ];

    return {
      recordType: "TXT",
      recordName: expected.verificationRecord.name,
      recordValue: expected.verificationRecord.value,
      instructions: [
        `Point ${expected.routingRecord.name} to ${expected.routingRecord.value} with a CNAME-style record.`,
        `Publish ${expected.verificationRecord.name} as a TXT record with the verification token.`,
        "Prefer a hostname target instead of exposing the raw origin IP directly.",
      ].join("\n"),
      exampleSteps,
      records: [expected.routingRecord, expected.verificationRecord],
      verificationRecord: expected.verificationRecord,
      routingRecord: expected.routingRecord,
    };
  }

  async initiateVerification(
    domainId: string,
    websiteId: string | null,
    userId: string,
    domain: string,
  ): Promise<{ verification: DnsVerificationChallenge; dnsVerificationId: string } | { error: string }> {
    try {
      const challenge = await this.generateVerificationRecords(domain);
      const verification = await createDnsVerification(
        domainId,
        challenge.recordName,
        challenge.recordType,
        challenge.recordValue,
      );

      if (!verification) {
        return { error: "Failed to create DNS verification record" };
      }

      await updateDomainStatus(domainId, {
        status: "verifying" as const,
        dns_status: "verifying" as const,
        dns_verification_token: challenge.recordValue,
        dns_records: {
          records: challenge.records,
          verification: challenge.verificationRecord,
          routing: challenge.routingRecord,
          instructions: challenge.exampleSteps,
        },
        error_message: null,
      });

      await logDomainAction(
        domainId,
        websiteId,
        userId,
        "dns_verification_initiated",
        null,
        {
          verificationRecord: challenge.verificationRecord,
          routingRecord: challenge.routingRecord,
        },
        {
          instructions: challenge.instructions,
        },
      );

      return {
        verification: challenge,
        dnsVerificationId: verification.id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "DNS verification initiation failed";
      return { error: message };
    }
  }

  async verifyDnsRecord(
    identifier: string,
    domain: string,
    maxRetries: number = this.maxVerificationAttempts,
  ): Promise<DnsVerificationResult> {
    try {
      const verification = await getDnsVerification(identifier);
      if (!verification) {
        return {
          success: false,
          verified: false,
          retryable: false,
          record: { type: "TXT", name: "", value: "" },
          error: "Verification record not found",
        };
      }

      const domainRecord = await getDomain(verification.domain_id);
      const expected = extractExpectedDnsConfiguration(domain, verification.record_value, domainRecord);

      if (verification.verification_attempts >= maxRetries) {
        return {
          success: false,
          verified: false,
          retryable: false,
          record: expected.verificationRecord,
          error: `Maximum verification attempts (${maxRetries}) exceeded`,
        };
      }

      const [ownershipResult, routingResult] = await Promise.all([
        this.checkTxtRecord(expected.verificationRecord),
        this.checkRouting(domainRecord, expected.routingRecord),
      ]);

      await incrementDnsVerificationAttempt(verification.id);

      if (ownershipResult.verified && routingResult.verified) {
        await markDnsVerified(verification.id);
        return {
          success: true,
          verified: true,
          retryable: false,
          record: expected.verificationRecord,
          foundValue: ownershipResult.foundValue,
          details: {
            ownership: ownershipResult.details,
            routing: routingResult.details,
          },
        };
      }

      const errors = [ownershipResult.error, routingResult.error].filter(Boolean);
      const pending = ownershipResult.pending !== false || routingResult.pending !== false;

      return {
        success: false,
        verified: false,
        pending,
        retryable: pending,
        record: expected.verificationRecord,
        error: errors.join(" | ") || "DNS records not verified yet",
        details: {
          ownership: ownershipResult.details,
          routing: routingResult.details,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "DNS verification failed";
      return {
        success: false,
        verified: false,
        pending: true,
        retryable: true,
        record: { type: "TXT", name: "", value: "" },
        error: message,
      };
    }
  }

  private async checkTxtRecord(record: DnsRecord): Promise<DnsVerificationResult> {
    try {
      const records = await resolveTxt(record.name);
      const flattened = flattenTxtRecords(records);
      const found = flattened.find((value) => value.trim() === record.value);

      if (found) {
        return {
          success: true,
          verified: true,
          retryable: false,
          record,
          foundValue: found,
          details: { recordsFound: flattened.length },
        };
      }

      return {
        success: false,
        verified: false,
        pending: true,
        retryable: true,
        record,
        foundValue: flattened.join("; "),
        error: `TXT record ${record.name} does not contain the expected verification token`,
        details: { recordsFound: flattened.length },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "TXT lookup failed";
      return {
        success: false,
        verified: false,
        pending: isDnsPropagationError(message),
        retryable: true,
        record,
        error: isDnsPropagationError(message)
          ? `TXT lookup still propagating: ${message}`
          : message,
      };
    }
  }

  private async checkRouting(
    domainRecord: DomainRow | null,
    record: DnsRecord,
  ): Promise<DnsVerificationResult> {
    const cnameResult = await this.checkCnameRecord(record);
    if (cnameResult.verified) {
      return cnameResult;
    }

    const aRecordResult = await this.checkARecord(record);
    if (aRecordResult.verified) {
      return aRecordResult;
    }

    const markerPath =
      typeof domainRecord?.metadata?.verificationMarkerPath === "string"
        ? domainRecord.metadata.verificationMarkerPath
        : null;
    const markerToken =
      typeof domainRecord?.metadata?.verificationMarkerToken === "string"
        ? domainRecord.metadata.verificationMarkerToken
        : null;

    if (!markerPath || !markerToken) {
      const routingErrors = hasResolvedAddresses(aRecordResult)
        ? [aRecordResult.error]
        : [cnameResult.error, aRecordResult.error];

      return {
        ...aRecordResult,
        error: routingErrors.filter(Boolean).join(" | "),
        details: {
          cname: cnameResult.details,
          aRecord: aRecordResult.details,
        },
      };
    }

    const probeResult = await this.probeHttpRouting(record.name, markerPath, markerToken, record);
    if (probeResult.verified) {
      return probeResult;
    }

    const routingErrors = hasResolvedAddresses(aRecordResult)
      ? [aRecordResult.error, probeResult.error]
      : [cnameResult.error, aRecordResult.error, probeResult.error];

    return {
      ...probeResult,
      error: routingErrors.filter(Boolean).join(" | "),
      details: {
        cname: cnameResult.details,
        aRecord: aRecordResult.details,
        httpProbe: probeResult.details,
      },
    };
  }

  private async checkCnameRecord(record: DnsRecord): Promise<DnsVerificationResult> {
    try {
      const records = await resolveCname(record.name);
      const expected = record.value.replace(/\.$/, "");
      const found = records.find((value) => value.replace(/\.$/, "") === expected);

      if (found) {
        return {
          success: true,
          verified: true,
          retryable: false,
          record,
          foundValue: found,
          details: { aliases: records },
        };
      }

      return {
        success: false,
        verified: false,
        pending: true,
        retryable: true,
        record,
        foundValue: records.join("; "),
        error: `CNAME for ${record.name} must point to ${record.value}`,
        details: { aliases: records },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "CNAME lookup failed";
      return {
        success: false,
        verified: false,
        pending: isDnsPropagationError(message),
        retryable: true,
        record,
        error: isDnsPropagationError(message)
          ? `CNAME lookup still propagating: ${message}`
          : message,
      };
    }
  }

  private async checkARecord(record: DnsRecord): Promise<DnsVerificationResult> {
    const expectedAddresses = await this.resolveRoutingAddresses(record.value);
    if (expectedAddresses.length === 0) {
      return {
        success: false,
        verified: false,
        pending: true,
        retryable: true,
        record,
        error: `Unable to resolve the target host ${record.value}`,
      };
    }

    try {
      const addresses = await resolve4(record.name);
      const found = addresses.find((address) => expectedAddresses.includes(address));
      if (found) {
        return {
          success: true,
          verified: true,
          retryable: false,
          record,
          foundValue: found,
          details: {
            addresses,
            expectedAddresses,
          },
        };
      }

      return {
        success: false,
        verified: false,
        pending: true,
        retryable: true,
        record,
        foundValue: addresses.join("; "),
        error: `A record for ${record.name} currently resolves to ${addresses.join(", ")}, but it must resolve to ${expectedAddresses.join(", ")}`,
        details: {
          addresses,
          expectedAddresses,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "A lookup failed";
      return {
        success: false,
        verified: false,
        pending: isDnsPropagationError(message),
        retryable: true,
        record,
        error: isDnsPropagationError(message)
          ? `A lookup still propagating: ${message}`
          : message,
      };
    }
  }

  private async resolveRoutingAddresses(targetHost: string) {
    const normalizedTarget = targetHost.replace(/\.$/, "");
    const addresses = new Set<string>();

    if (isIP(normalizedTarget) === 4) {
      addresses.add(normalizedTarget);
    }

    try {
      const resolved = await resolve4(normalizedTarget);
      resolved.forEach((address) => addresses.add(address));
    } catch {
      // Ignore lookup failures here and fall back to any explicit IP we already have.
    }

    return [...addresses];
  }

  private async probeHttpRouting(
    domain: string,
    markerPath: string,
    markerToken: string,
    record: DnsRecord,
  ): Promise<DnsVerificationResult> {
    try {
      const response = await fetch(`http://${domain}${markerPath}`, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "Univert-Domain-Verification/1.0",
        },
      });

      if (!response.ok) {
        return {
          success: false,
          verified: false,
          pending: true,
          retryable: true,
          record,
          error: `HTTP probe returned ${response.status} for ${markerPath}`,
          details: { status: response.status },
        };
      }

      const body = (await response.text()).trim();
      if (body === markerToken) {
        return {
          success: true,
          verified: true,
          retryable: false,
          record,
          foundValue: body,
          details: { markerPath },
        };
      }

      return {
        success: false,
        verified: false,
        pending: true,
        retryable: true,
        record,
        error: `HTTP probe reached ${domain} but the verification marker did not match`,
        details: {
          markerPath,
          bodyPreview: body.slice(0, 120),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "HTTP routing probe failed";
      return {
        success: false,
        verified: false,
        pending: true,
        retryable: true,
        record,
        error: message,
      };
    }
  }

  static validateDomain(domain: string): { valid: boolean; error?: string } {
    const normalized = normalizeDomain(domain);
    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

    if (!domainRegex.test(normalized)) {
      return { valid: false, error: "Invalid domain format" };
    }

    if (normalized.length > 253) {
      return { valid: false, error: "Domain too long" };
    }

    const platformRootDomain = getAapanelConfig().platformRootDomain;
    if (normalized === platformRootDomain || normalized.endsWith(`.${platformRootDomain}`)) {
      return {
        valid: false,
        error: `Use the website launch flow for ${platformRootDomain} subdomains instead of adding them as custom domains`,
      };
    }

    return { valid: true };
  }

  static async checkDomainAvailability(domain: string): Promise<{ available: boolean; websiteId?: string }> {
    const { getDomainByName } = await import("@/lib/db/domains");
    const existing = await getDomainByName(normalizeDomain(domain));
    if (existing) {
      return { available: false, websiteId: existing.website_id };
    }

    return { available: true };
  }
}
