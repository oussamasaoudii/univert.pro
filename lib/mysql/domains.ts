import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureCoreSchema } from "@/lib/mysql/schema";

export type DomainVerificationStatus = "pending" | "verified" | "failed";
export type DomainSslStatus = "pending" | "active" | "expired";

export type AdminDomainRecord = {
  id: string;
  domain: string;
  userId: string | null;
  ownerEmail: string | null;
  websiteName: string | null;
  isPrimary: boolean;
  verificationStatus: DomainVerificationStatus;
  sslStatus: DomainSslStatus;
  createdAt: string;
  updatedAt: string;
};

type DomainRow = {
  id: string;
  domain: string;
  user_id: string | null;
  owner_email: string | null;
  website_name: string | null;
  is_primary: number | boolean;
  verification_status: DomainVerificationStatus;
  ssl_status: DomainSslStatus;
  created_at: string;
  updated_at: string;
};

let schemaReadyPromise: Promise<void> | null = null;

async function ensureDomainsSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = initializeDomainsSchema();
  }

  await schemaReadyPromise;
}

async function initializeDomainsSchema() {
  await ensureCoreSchema();
  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS domains (
      id CHAR(36) PRIMARY KEY,
      domain VARCHAR(191) NOT NULL UNIQUE,
      user_id CHAR(36) NULL,
      website_name VARCHAR(191) NULL,
      is_primary TINYINT(1) NOT NULL DEFAULT 0,
      verification_status ENUM('pending', 'verified', 'failed') NOT NULL DEFAULT 'pending',
      ssl_status ENUM('pending', 'active', 'expired') NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_domains_user_id (user_id),
      INDEX idx_domains_status (verification_status, ssl_status),
      CONSTRAINT fk_domains_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

function normalizeDomainInput(input: string): string {
  const value = input.trim().toLowerCase();
  const withoutProtocol = value.replace(/^https?:\/\//, "");
  return withoutProtocol.split("/")[0].replace(/\.$/, "");
}

function isValidDomain(domain: string): boolean {
  return /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(domain);
}

function mapRow(row: DomainRow): AdminDomainRecord {
  return {
    id: row.id,
    domain: row.domain,
    userId: row.user_id,
    ownerEmail: row.owner_email,
    websiteName: row.website_name,
    isPrimary: row.is_primary === 1 || row.is_primary === true,
    verificationStatus: row.verification_status,
    sslStatus: row.ssl_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function resolveUserIdByEmail(email: string): Promise<string | null> {
  await ensureDomainsSchema();
  const pool = getMySQLPool();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const [rows] = await pool.query<Array<{ id: string }>>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail],
  );

  return rows[0]?.id || null;
}

export async function listDomains(search?: string): Promise<AdminDomainRecord[]> {
  await ensureDomainsSchema();
  const pool = getMySQLPool();

  if (search && search.trim()) {
    const query = `%${search.trim().toLowerCase()}%`;
    const [rows] = await pool.query<DomainRow[]>(
      `
        SELECT
          d.id,
          d.domain,
          d.user_id,
          u.email AS owner_email,
          d.website_name,
          d.is_primary,
          d.verification_status,
          d.ssl_status,
          d.created_at,
          d.updated_at
        FROM domains d
        LEFT JOIN users u ON u.id = d.user_id
        WHERE LOWER(d.domain) LIKE ?
          OR LOWER(COALESCE(d.website_name, '')) LIKE ?
          OR LOWER(COALESCE(u.email, '')) LIKE ?
        ORDER BY d.created_at DESC
      `,
      [query, query, query],
    );

    return rows.map(mapRow);
  }

  const [rows] = await pool.query<DomainRow[]>(
    `
      SELECT
        d.id,
        d.domain,
        d.user_id,
        u.email AS owner_email,
        d.website_name,
        d.is_primary,
        d.verification_status,
        d.ssl_status,
        d.created_at,
        d.updated_at
      FROM domains d
      LEFT JOIN users u ON u.id = d.user_id
      ORDER BY d.created_at DESC
    `,
  );

  return rows.map(mapRow);
}

export async function listDomainsByUser(userId: string): Promise<AdminDomainRecord[]> {
  await ensureDomainsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<DomainRow[]>(
    `
      SELECT
        d.id,
        d.domain,
        d.user_id,
        u.email AS owner_email,
        d.website_name,
        d.is_primary,
        d.verification_status,
        d.ssl_status,
        d.created_at,
        d.updated_at
      FROM domains d
      LEFT JOIN users u ON u.id = d.user_id
      WHERE d.user_id = ?
      ORDER BY d.created_at DESC
    `,
    [userId],
  );

  return rows.map(mapRow);
}

export async function createDomain(input: {
  domain: string;
  userId?: string | null;
  websiteName?: string | null;
  verificationStatus?: DomainVerificationStatus;
  sslStatus?: DomainSslStatus;
  isPrimary?: boolean;
}): Promise<{ domain?: AdminDomainRecord; error?: "invalid_domain" | "already_exists" }> {
  await ensureDomainsSchema();
  const pool = getMySQLPool();
  const normalizedDomain = normalizeDomainInput(input.domain);

  if (!isValidDomain(normalizedDomain)) {
    return { error: "invalid_domain" };
  }

  const [existingRows] = await pool.query<Array<{ id: string }>>(
    "SELECT id FROM domains WHERE domain = ? LIMIT 1",
    [normalizedDomain],
  );

  if (existingRows[0]) {
    return { error: "already_exists" };
  }

  const domainId = randomUUID();

  await pool.query(
    `
      INSERT INTO domains (
        id,
        domain,
        user_id,
        website_name,
        is_primary,
        verification_status,
        ssl_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      domainId,
      normalizedDomain,
      input.userId || null,
      input.websiteName || null,
      input.isPrimary ? 1 : 0,
      input.verificationStatus || "pending",
      input.sslStatus || "pending",
    ],
  );

  const record = await getDomainById(domainId);
  if (!record) {
    return { error: "invalid_domain" };
  }

  if (record.isPrimary) {
    await setDomainPrimary(record.id);
    const primaryRecord = await getDomainById(record.id);
    return { domain: primaryRecord || record };
  }

  return { domain: record };
}

export async function getDomainById(domainId: string): Promise<AdminDomainRecord | null> {
  await ensureDomainsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<DomainRow[]>(
    `
      SELECT
        d.id,
        d.domain,
        d.user_id,
        u.email AS owner_email,
        d.website_name,
        d.is_primary,
        d.verification_status,
        d.ssl_status,
        d.created_at,
        d.updated_at
      FROM domains d
      LEFT JOIN users u ON u.id = d.user_id
      WHERE d.id = ?
      LIMIT 1
    `,
    [domainId],
  );

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function updateDomain(
  domainId: string,
  updates: {
    domain?: string;
    userId?: string | null;
    websiteName?: string | null;
    verificationStatus?: DomainVerificationStatus;
    sslStatus?: DomainSslStatus;
    isPrimary?: boolean;
  },
): Promise<{ domain?: AdminDomainRecord; error?: "not_found" | "invalid_domain" | "already_exists" }> {
  await ensureDomainsSchema();
  const pool = getMySQLPool();

  const existing = await getDomainById(domainId);
  if (!existing) {
    return { error: "not_found" };
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (typeof updates.domain === "string") {
    const normalizedDomain = normalizeDomainInput(updates.domain);
    if (!isValidDomain(normalizedDomain)) {
      return { error: "invalid_domain" };
    }

    const [existsRows] = await pool.query<Array<{ id: string }>>(
      "SELECT id FROM domains WHERE domain = ? AND id <> ? LIMIT 1",
      [normalizedDomain, domainId],
    );
    if (existsRows[0]) {
      return { error: "already_exists" };
    }

    fields.push("domain = ?");
    values.push(normalizedDomain);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "userId")) {
    fields.push("user_id = ?");
    values.push(updates.userId || null);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "websiteName")) {
    fields.push("website_name = ?");
    values.push(updates.websiteName || null);
  }

  if (updates.verificationStatus) {
    fields.push("verification_status = ?");
    values.push(updates.verificationStatus);
  }

  if (updates.sslStatus) {
    fields.push("ssl_status = ?");
    values.push(updates.sslStatus);
  }

  if (typeof updates.isPrimary === "boolean") {
    fields.push("is_primary = ?");
    values.push(updates.isPrimary ? 1 : 0);
  }

  if (fields.length > 0) {
    values.push(domainId);
    await pool.query(
      `
        UPDATE domains
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
      values,
    );
  }

  if (updates.isPrimary) {
    await setDomainPrimary(domainId);
  }

  const updated = await getDomainById(domainId);
  return updated ? { domain: updated } : { error: "not_found" };
}

export async function setDomainPrimary(domainId: string): Promise<AdminDomainRecord | null> {
  await ensureDomainsSchema();
  const pool = getMySQLPool();
  const record = await getDomainById(domainId);
  if (!record) {
    return null;
  }

  if (record.userId || record.websiteName) {
    await pool.query(
      `
        UPDATE domains
        SET is_primary = 0
        WHERE id <> ?
          AND user_id <=> ?
          AND website_name <=> ?
      `,
      [domainId, record.userId, record.websiteName],
    );
  }

  await pool.query("UPDATE domains SET is_primary = 1 WHERE id = ?", [domainId]);
  return getDomainById(domainId);
}

export async function deleteDomain(domainId: string): Promise<boolean> {
  await ensureDomainsSchema();
  const pool = getMySQLPool();
  const [result] = await pool.query("DELETE FROM domains WHERE id = ?", [domainId]);
  return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
}
