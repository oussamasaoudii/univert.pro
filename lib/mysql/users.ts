import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { hashPassword, verifyPassword } from "@/lib/mysql/password";
import { ensureCoreSchema } from "@/lib/mysql/schema";
import { revokeAllUserSessionRecords } from "@/lib/mysql/security";
import { getPlatformSettings } from "@/lib/mysql/settings";
import { validatePasswordStrength } from "@/lib/security/password-policy";

export type UserRole = "user" | "admin";
export type UserStatus = "pending" | "active" | "suspended";

export type AppUser = {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  plan: string;
  totalRevenue: number;
  websitesCount: number;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  sessionVersion: number;
  adminMfaEnabled: boolean;
  adminMfaEnrolledAt: string | null;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
};

export type AdminUserResponse = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  plan: string;
  totalRevenue: number;
  websitesCount: number;
  lastLoginAt: string | null;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  company_name: string | null;
  role: UserRole;
  status: UserStatus;
  email_verified: number | boolean;
  plan: string;
  total_revenue: string | number;
  websites_count: number;
  last_login_at: string | null;
  password_changed_at: string | null;
  session_version: number;
  admin_mfa_enabled: number | boolean;
  admin_mfa_enrolled_at: string | null;
  created_at: string;
  updated_at: string;
  activated_at: string | null;
};

function normalizeUser(row: UserRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    companyName: row.company_name,
    role: row.role,
    status: row.status,
    emailVerified: row.email_verified === 1 || row.email_verified === true,
    plan: row.plan || "starter",
    totalRevenue: Number(row.total_revenue || 0),
    websitesCount: Number(row.websites_count || 0),
    lastLoginAt: row.last_login_at,
    passwordChangedAt: row.password_changed_at,
    sessionVersion: Number(row.session_version || 1),
    adminMfaEnabled: row.admin_mfa_enabled === 1 || row.admin_mfa_enabled === true,
    adminMfaEnrolledAt: row.admin_mfa_enrolled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    activatedAt: row.activated_at,
  };
}

export function sanitizeAdminUserForClient(user: AppUser): AdminUserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    plan: user.plan,
    totalRevenue: user.totalRevenue,
    websitesCount: user.websitesCount,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function findUserById(userId: string): Promise<AppUser | null> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<UserRow[]>(
    `
      SELECT
        id,
        email,
        password_hash,
        full_name,
        company_name,
        role,
        status,
        email_verified,
        plan,
        total_revenue,
        websites_count,
        last_login_at,
        password_changed_at,
        session_version,
        admin_mfa_enabled,
        admin_mfa_enrolled_at,
        created_at,
        updated_at,
        activated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] ? normalizeUser(rows[0]) : null;
}

export async function findUserByEmail(email: string): Promise<(AppUser & { passwordHash: string }) | null> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const normalizedEmail = email.trim().toLowerCase();

  const [rows] = await pool.query<UserRow[]>(
    `
      SELECT
        id,
        email,
        password_hash,
        full_name,
        company_name,
        role,
        status,
        email_verified,
        plan,
        total_revenue,
        websites_count,
        last_login_at,
        password_changed_at,
        session_version,
        admin_mfa_enabled,
        admin_mfa_enrolled_at,
        created_at,
        updated_at,
        activated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [normalizedEmail],
  );

  if (!rows[0]) {
    return null;
  }

  return {
    ...normalizeUser(rows[0]),
    passwordHash: rows[0].password_hash,
  };
}

export async function createPendingUser(input: {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
}): Promise<{ user?: AppUser; error?: "already_exists" | "invalid_email" | "weak_password" }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { error: "invalid_email" };
  }

  if (!validatePasswordStrength(input.password).valid) {
    return { error: "weak_password" };
  }

  await ensureCoreSchema();
  const pool = getMySQLPool();

  const [existingRows] = await pool.query<Array<{ id: string }>>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail],
  );

  if (existingRows[0]) {
    return { error: "already_exists" };
  }

  const passwordHash = await hashPassword(input.password);
  const id = randomUUID();

  await pool.query(
    `
      INSERT INTO users (
        id,
        email,
        password_hash,
        full_name,
        company_name,
        role,
        status,
        email_verified,
        plan
      )
      VALUES (?, ?, ?, ?, ?, 'user', 'pending', 0, 'starter')
    `,
    [id, normalizedEmail, passwordHash, input.fullName || null, input.companyName || null],
  );

  const user = await findUserById(id);
  return { user: user || undefined };
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}): Promise<
  | { user: AppUser }
  | { error: "invalid_credentials" | "pending_activation" | "account_suspended" | "email_not_verified" }
> {
  const candidate = await findUserByEmail(input.email);
  if (!candidate) {
    return { error: "invalid_credentials" };
  }

  const passwordMatches = await verifyPassword(input.password, candidate.passwordHash);
  if (!passwordMatches) {
    return { error: "invalid_credentials" };
  }

  if (candidate.status === "pending") {
    return { error: "pending_activation" };
  }

  if (candidate.status === "suspended") {
    return { error: "account_suspended" };
  }

  const settings = await getPlatformSettings();
  if (candidate.role !== "admin" && settings.requireEmailVerification && !candidate.emailVerified) {
    return { error: "email_not_verified" };
  }

  await touchUserLogin(candidate.id);
  const refreshed = await findUserById(candidate.id);

  if (!refreshed) {
    return { error: "invalid_credentials" };
  }

  return { user: refreshed };
}

async function touchUserLogin(userId: string) {
  const pool = getMySQLPool();
  await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [userId]);
}

export async function updateUserPasswordHash(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  await pool.query(
    `
      UPDATE users
      SET password_hash = ?,
          password_changed_at = NOW(),
          session_version = session_version + 1
      WHERE id = ?
    `,
    [passwordHash, userId],
  );

  await revokeAllUserSessionRecords(userId, "password_changed");
}

export async function listUsersForAdmin(searchQuery?: string): Promise<AppUser[]> {
  await ensureCoreSchema();
  const pool = getMySQLPool();

  if (searchQuery && searchQuery.trim().length > 0) {
    const search = `%${searchQuery.trim().toLowerCase()}%`;
    const [rows] = await pool.query<UserRow[]>(
      `
        SELECT
          id,
          email,
          password_hash,
          full_name,
          company_name,
          role,
          status,
          email_verified,
          plan,
          total_revenue,
          websites_count,
          last_login_at,
          password_changed_at,
          session_version,
          admin_mfa_enabled,
          admin_mfa_enrolled_at,
          created_at,
          updated_at,
          activated_at
        FROM users
        WHERE LOWER(email) LIKE ? OR LOWER(COALESCE(full_name, '')) LIKE ?
        ORDER BY created_at DESC
      `,
      [search, search],
    );

    return rows.map(normalizeUser);
  }

  const [rows] = await pool.query<UserRow[]>(
    `
      SELECT
        id,
        email,
        password_hash,
        full_name,
        company_name,
        role,
        status,
        email_verified,
        plan,
        total_revenue,
        websites_count,
        last_login_at,
        password_changed_at,
        session_version,
        admin_mfa_enabled,
        admin_mfa_enrolled_at,
        created_at,
        updated_at,
        activated_at
      FROM users
      ORDER BY created_at DESC
    `,
  );

  return rows.map(normalizeUser);
}

export async function updateUserAdminFields(
  userId: string,
  updates: {
    role?: UserRole;
    status?: UserStatus;
    emailVerified?: boolean;
  },
  adminUserId: string | null,
): Promise<AppUser | null> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const currentUser = await findUserById(userId);
  if (!currentUser) {
    return null;
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (updates.role) {
    fields.push("role = ?");
    values.push(updates.role);
  }

  if (updates.status) {
    fields.push("status = ?");
    values.push(updates.status);

    if (updates.status === "active") {
      fields.push("activated_at = COALESCE(activated_at, NOW())");
      fields.push("activated_by = COALESCE(activated_by, ?)");
      values.push(adminUserId);
    }
  }

  if (typeof updates.emailVerified === "boolean") {
    fields.push("email_verified = ?");
    values.push(updates.emailVerified ? 1 : 0);
  }

  if (fields.length === 0) {
    return findUserById(userId);
  }

  values.push(userId);

  await pool.query(
    `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = ?
    `,
    values,
  );

  const shouldInvalidateSessions =
    (updates.status && updates.status !== currentUser.status) ||
    (updates.role && updates.role !== currentUser.role);
  if (shouldInvalidateSessions) {
    await pool.query(
      "UPDATE users SET session_version = session_version + 1 WHERE id = ?",
      [userId],
    );
    await revokeAllUserSessionRecords(userId, "admin_role_or_status_changed");
  }

  return findUserById(userId);
}

export async function countActiveAdmins(): Promise<number> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<Array<{ total: number }>>(
    `
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'admin'
        AND status = 'active'
    `,
  );

  return Number(rows[0]?.total || 0);
}
