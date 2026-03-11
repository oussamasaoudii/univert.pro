import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureDomainAutomationSchema } from "@/lib/mysql/legacy-schema";
import { toMySqlDateTime } from "@/lib/mysql/datetime";
import { getWebsiteById } from "@/lib/mysql/platform";
import type {
  DomainLogRow,
  DomainRow,
  DnsVerificationRow,
  SslCertificateRow,
} from "./types";

type DomainDbRow = Omit<DomainRow, "is_primary" | "ssl_auto_renewal" | "dns_records" | "metadata"> & {
  is_primary: number | boolean;
  ssl_auto_renewal: number | boolean;
  dns_records: string | null;
  metadata: string | null;
};

type DomainLogDbRow = Omit<DomainLogRow, "old_state" | "new_state" | "details"> & {
  old_state: string | null;
  new_state: string | null;
  details: string | null;
};

type DnsVerificationDbRow = Omit<DnsVerificationRow, "verified" | "verification_attempts"> & {
  verified: number | boolean;
  verification_attempts: number | string;
};

type SslCertificateDbRow = Omit<SslCertificateRow, "auto_renewal" | "subject_alt_names" | "metadata"> & {
  auto_renewal: number | boolean;
  subject_alt_names: string | null;
  metadata: string | null;
};

function parseJsonRecord(value: string | null): Record<string, any> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, any>)
      : {};
  } catch {
    return {};
  }
}

function parseJsonArray(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function normalizeDateTimeForMySql(value: Date | string | null | undefined) {
  return value == null ? null : toMySqlDateTime(value);
}

function mapDomain(row: DomainDbRow | null): DomainRow | null {
  if (!row) {
    return null;
  }

  return {
    ...row,
    is_primary: row.is_primary === 1 || row.is_primary === true,
    dns_records: parseJsonRecord(row.dns_records),
    ssl_auto_renewal: row.ssl_auto_renewal === 1 || row.ssl_auto_renewal === true,
    metadata: parseJsonRecord(row.metadata),
  };
}

function mapDomainLog(row: DomainLogDbRow): DomainLogRow {
  return {
    ...row,
    old_state: row.old_state ? parseJsonRecord(row.old_state) : null,
    new_state: row.new_state ? parseJsonRecord(row.new_state) : null,
    details: row.details ? parseJsonRecord(row.details) : null,
  };
}

function mapDnsVerification(row: DnsVerificationDbRow | null): DnsVerificationRow | null {
  if (!row) {
    return null;
  }

  return {
    ...row,
    verified: row.verified === 1 || row.verified === true,
    verification_attempts: Number(row.verification_attempts || 0),
  };
}

function mapSslCertificate(row: SslCertificateDbRow | null): SslCertificateRow | null {
  if (!row) {
    return null;
  }

  return {
    ...row,
    subject_alt_names: parseJsonArray(row.subject_alt_names),
    auto_renewal: row.auto_renewal === 1 || row.auto_renewal === true,
    metadata: parseJsonRecord(row.metadata),
  };
}

export async function getWebsiteDomains(websiteId: string): Promise<DomainRow[]> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM domains
        WHERE website_id = ?
        ORDER BY is_primary DESC, created_at DESC
      `,
      [websiteId],
    );

    return (rows as DomainDbRow[])
      .map((row) => mapDomain(row))
      .filter(Boolean) as DomainRow[];
  } catch (error) {
    console.error("[db] Error fetching website domains:", error);
    return [];
  }
}

export async function getUserDomains(userId: string): Promise<DomainRow[]> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM domains
        WHERE user_id = ?
        ORDER BY is_primary DESC, created_at DESC
      `,
      [userId],
    );

    return (rows as DomainDbRow[])
      .map((row) => mapDomain(row))
      .filter(Boolean) as DomainRow[];
  } catch (error) {
    console.error("[db] Error fetching user domains:", error);
    return [];
  }
}

export async function getDomain(identifier: string): Promise<DomainRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM domains
        WHERE id = ?
           OR domain = ?
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [identifier, identifier],
    );

    return mapDomain(((rows as DomainDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error fetching domain:", error);
    return null;
  }
}

export async function getDomainByName(domain: string): Promise<DomainRow | null> {
  return getDomain(domain);
}

export async function createDomain(
  userId: string,
  websiteId: string | null,
  domain: string,
  domainType: DomainRow["domain_type"] = "custom_domain",
): Promise<DomainRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    const normalizedDomain = domain.trim().toLowerCase();
    const website = websiteId ? await getWebsiteById(websiteId) : null;

    await pool.query(
      `
        INSERT INTO domains (
          id, user_id, website_id, website_name, domain, is_primary,
          domain_type, status, dns_status, ssl_status, dns_records,
          dns_verification_token, ssl_auto_renewal, metadata,
          verification_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', 'pending', ?, NULL, 1, ?, 'pending')
      `,
      [
        id,
        userId,
        websiteId,
        website?.projectName || null,
        normalizedDomain,
        domainType === "platform_subdomain" ? 1 : 0,
        domainType,
        JSON.stringify({}),
        JSON.stringify({
          source: "mysql_compat",
          websiteName: website?.projectName || null,
        }),
      ],
    );

    return getDomain(id);
  } catch (error) {
    console.error("[db] Error creating domain:", error);
    return null;
  }
}

export async function updateDomainStatus(
  domainId: string,
  updates: Partial<DomainRow>,
): Promise<DomainRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const fields: string[] = [];
    const values: Array<string | number | null> = [];

    if (updates.domain) {
      fields.push("domain = ?");
      values.push(updates.domain);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "website_id")) {
      fields.push("website_id = ?");
      values.push(updates.website_id ?? null);
    }
    if (typeof updates.is_primary === "boolean") {
      fields.push("is_primary = ?");
      values.push(updates.is_primary ? 1 : 0);
    }
    if (updates.domain_type) {
      fields.push("domain_type = ?");
      values.push(updates.domain_type);
    }
    if (updates.status) {
      fields.push("status = ?");
      values.push(updates.status);
      fields.push("verification_status = ?");
      values.push(updates.status === "active" ? "verified" : updates.status === "failed" ? "failed" : "pending");
    }
    if (updates.dns_status) {
      fields.push("dns_status = ?");
      values.push(updates.dns_status);
    }
    if (updates.ssl_status) {
      fields.push("ssl_status = ?");
      values.push(updates.ssl_status);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "dns_records")) {
      fields.push("dns_records = ?");
      values.push(JSON.stringify(updates.dns_records || {}));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "dns_verification_token")) {
      fields.push("dns_verification_token = ?");
      values.push(updates.dns_verification_token ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "dns_verified_at")) {
      fields.push("dns_verified_at = ?");
      values.push(normalizeDateTimeForMySql(updates.dns_verified_at));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "ssl_cert_id")) {
      fields.push("ssl_cert_id = ?");
      values.push(updates.ssl_cert_id ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "ssl_expires_at")) {
      fields.push("ssl_expires_at = ?");
      values.push(normalizeDateTimeForMySql(updates.ssl_expires_at));
    }
    if (typeof updates.ssl_auto_renewal === "boolean") {
      fields.push("ssl_auto_renewal = ?");
      values.push(updates.ssl_auto_renewal ? 1 : 0);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "error_message")) {
      fields.push("error_message = ?");
      values.push(updates.error_message ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "metadata")) {
      fields.push("metadata = ?");
      values.push(JSON.stringify(updates.metadata || {}));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "verified_at")) {
      fields.push("verified_at = ?");
      values.push(normalizeDateTimeForMySql(updates.verified_at));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "failed_at")) {
      fields.push("failed_at = ?");
      values.push(normalizeDateTimeForMySql(updates.failed_at));
    }

    if (fields.length === 0) {
      return getDomain(domainId);
    }

    values.push(domainId);
    await pool.query(
      `
        UPDATE domains
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
      values,
    );

    return getDomain(domainId);
  } catch (error) {
    console.error("[db] Error updating domain status:", error);
    return null;
  }
}

export async function setPrimaryDomain(
  websiteId: string | null,
  domainId: string,
): Promise<boolean> {
  try {
    if (!websiteId) {
      return false;
    }

    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    await pool.query("UPDATE domains SET is_primary = 0 WHERE website_id = ?", [websiteId]);
    await pool.query("UPDATE domains SET is_primary = 1 WHERE id = ? AND website_id = ?", [
      domainId,
      websiteId,
    ]);
    return true;
  } catch (error) {
    console.error("[db] Error setting primary domain:", error);
    return false;
  }
}

export async function removeDomain(domainId: string): Promise<boolean> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query("DELETE FROM domains WHERE id = ?", [domainId]);
    return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
  } catch (error) {
    console.error("[db] Error removing domain:", error);
    return false;
  }
}

export async function removeDomainCascade(domainId: string): Promise<boolean> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    await pool.query("DELETE FROM domain_logs WHERE domain_id = ?", [domainId]);
    await pool.query("DELETE FROM dns_verifications WHERE domain_id = ?", [domainId]);
    await pool.query("DELETE FROM ssl_certificates WHERE domain_id = ?", [domainId]);
    const [result] = await pool.query("DELETE FROM domains WHERE id = ?", [domainId]);
    return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
  } catch (error) {
    console.error("[db] Error removing domain cascade:", error);
    return false;
  }
}

export async function logDomainAction(
  domainId: string,
  websiteId: string | null,
  userId: string,
  action: string,
  oldState: any = null,
  newState: any = null,
  details: any = null,
): Promise<DomainLogRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO domain_logs (
          id, domain_id, website_id, user_id, action, old_state, new_state, details
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        domainId,
        websiteId,
        userId,
        action,
        oldState == null ? null : JSON.stringify(oldState),
        newState == null ? null : JSON.stringify(newState),
        details == null ? null : JSON.stringify(details),
      ],
    );

    return {
      id,
      domain_id: domainId,
      website_id: websiteId,
      user_id: userId,
      action,
      old_state: oldState,
      new_state: newState,
      details,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[db] Error logging domain action:", error);
    return null;
  }
}

export async function getDomainLogs(domainId: string, limit: number = 100): Promise<DomainLogRow[]> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM domain_logs
        WHERE domain_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [domainId, limit],
    );

    return (rows as DomainLogDbRow[]).map(mapDomainLog);
  } catch (error) {
    console.error("[db] Error fetching domain logs:", error);
    return [];
  }
}

export async function createDnsVerification(
  domainId: string,
  recordName: string,
  recordType: string,
  recordValue: string,
): Promise<DnsVerificationRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const expiresAt = toMySqlDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000));

    await pool.query(
      `
        INSERT INTO dns_verifications (
          id, domain_id, verification_token, record_name, record_type, record_value, expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [id, domainId, verificationToken, recordName, recordType, recordValue, expiresAt],
    );

    return getDnsVerification(id);
  } catch (error) {
    console.error("[db] Error creating DNS verification:", error);
    return null;
  }
}

export async function getDnsVerification(identifier: string): Promise<DnsVerificationRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT dv.*
        FROM dns_verifications dv
        LEFT JOIN domains d ON d.id = dv.domain_id
        WHERE dv.id = ?
           OR dv.domain_id = ?
           OR d.domain = ?
        ORDER BY dv.created_at DESC
        LIMIT 1
      `,
      [identifier, identifier, identifier],
    );

    return mapDnsVerification(((rows as DnsVerificationDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error fetching DNS verification:", error);
    return null;
  }
}

export async function markDnsVerified(dnsVerificationId: string): Promise<DnsVerificationRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE dns_verifications
        SET verified = 1,
            verified_at = NOW(),
            last_checked_at = NOW()
        WHERE id = ?
      `,
      [dnsVerificationId],
    );

    return getDnsVerification(dnsVerificationId);
  } catch (error) {
    console.error("[db] Error marking DNS verified:", error);
    return null;
  }
}

export async function incrementDnsVerificationAttempt(dnsVerificationId: string): Promise<boolean> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE dns_verifications
        SET verification_attempts = verification_attempts + 1,
            last_checked_at = NOW()
        WHERE id = ?
      `,
      [dnsVerificationId],
    );
    return true;
  } catch (error) {
    console.error("[db] Error incrementing DNS verification attempts:", error);
    return false;
  }
}

export async function resetDnsVerificationAttempts(domainId: string): Promise<boolean> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE dns_verifications
        SET verification_attempts = 0,
            last_checked_at = NULL
        WHERE domain_id = ?
          AND verified = 0
      `,
      [domainId],
    );

    return true;
  } catch (error) {
    console.error("[db] Error resetting DNS verification attempts:", error);
    return false;
  }
}

export async function createSslCertificate(
  domainId: string,
  websiteId: string,
  userId: string,
  commonName: string,
  subjectAltNames: string[] = [],
): Promise<SslCertificateRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO ssl_certificates (
          id, domain_id, website_id, user_id, common_name, subject_alt_names,
          status, provider, auto_renewal
        )
        VALUES (?, ?, ?, ?, ?, ?, 'pending', 'letsencrypt', 1)
      `,
      [id, domainId, websiteId, userId, commonName, JSON.stringify(subjectAltNames)],
    );

    const certificate = await getSslCertificate(domainId);
    return certificate?.id === id ? certificate : getSslCertificate(id);
  } catch (error) {
    console.error("[db] Error creating SSL certificate:", error);
    return null;
  }
}

export async function getSslCertificate(identifier: string): Promise<SslCertificateRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT sc.*
        FROM ssl_certificates sc
        LEFT JOIN domains d ON d.id = sc.domain_id
        WHERE sc.id = ?
           OR sc.domain_id = ?
           OR d.domain = ?
        ORDER BY sc.created_at DESC
        LIMIT 1
      `,
      [identifier, identifier, identifier],
    );

    return mapSslCertificate(((rows as SslCertificateDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error fetching SSL certificate:", error);
    return null;
  }
}

export async function updateSslCertificate(
  certificateId: string,
  updates: Partial<SslCertificateRow>,
): Promise<SslCertificateRow | null> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const fields: string[] = [];
    const values: Array<string | number | null> = [];

    if (Object.prototype.hasOwnProperty.call(updates, "certificate_id")) {
      fields.push("certificate_id = ?");
      values.push(updates.certificate_id ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "common_name")) {
      fields.push("common_name = ?");
      values.push(updates.common_name ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "subject_alt_names")) {
      fields.push("subject_alt_names = ?");
      values.push(JSON.stringify(updates.subject_alt_names || []));
    }
    if (updates.status) {
      fields.push("status = ?");
      values.push(updates.status);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "issue_date")) {
      fields.push("issue_date = ?");
      values.push(normalizeDateTimeForMySql(updates.issue_date));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "expires_at")) {
      fields.push("expires_at = ?");
      values.push(normalizeDateTimeForMySql(updates.expires_at));
    }
    if (typeof updates.auto_renewal === "boolean") {
      fields.push("auto_renewal = ?");
      values.push(updates.auto_renewal ? 1 : 0);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "renewal_status")) {
      fields.push("renewal_status = ?");
      values.push(updates.renewal_status ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "renewal_last_attempted")) {
      fields.push("renewal_last_attempted = ?");
      values.push(normalizeDateTimeForMySql(updates.renewal_last_attempted));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "error_message")) {
      fields.push("error_message = ?");
      values.push(updates.error_message ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "provider")) {
      fields.push("provider = ?");
      values.push(updates.provider ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "metadata")) {
      fields.push("metadata = ?");
      values.push(JSON.stringify(updates.metadata || {}));
    }

    if (fields.length === 0) {
      return getSslCertificate(certificateId);
    }

    values.push(certificateId);
    await pool.query(
      `
        UPDATE ssl_certificates
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
      values,
    );

    return getSslCertificate(certificateId);
  } catch (error) {
    console.error("[db] Error updating SSL certificate:", error);
    return null;
  }
}

export async function getCertificatesExpiringSoon(daysUntilExpiry: number = 30): Promise<SslCertificateRow[]> {
  try {
    await ensureDomainAutomationSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM ssl_certificates
        WHERE status = 'issued'
          AND auto_renewal = 1
          AND expires_at < DATE_ADD(NOW(), INTERVAL ? DAY)
        ORDER BY expires_at ASC
      `,
      [daysUntilExpiry],
    );

    return (rows as SslCertificateDbRow[])
      .map((row) => mapSslCertificate(row))
      .filter(Boolean) as SslCertificateRow[];
  } catch (error) {
    console.error("[db] Error fetching expiring certificates:", error);
    return [];
  }
}
