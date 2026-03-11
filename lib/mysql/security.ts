import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureCoreSchema } from "@/lib/mysql/schema";
import { toMySqlDateTime } from "@/lib/mysql/datetime";
import { hashPassword } from "@/lib/mysql/password";
import { logger } from "@/lib/utils/errors";

type RateLimitRow = {
  key_hash: string;
  scope: string;
  attempts: number;
  window_started_at: string;
  blocked_until: string | null;
};

export type UserSessionRow = {
  id: string;
  user_id: string;
  session_type: "user" | "admin";
  expires_at: string;
  revoked_at: string | null;
  mfa_verified_at: string | null;
  step_up_verified_at: string | null;
};

type PasswordResetTokenRow = {
  id: string;
  user_id: string;
  expires_at: string;
  used_at: string | null;
};

function hashRateLimitKey(scope: string, key: string) {
  return createHash("sha256").update(`${scope}:${key}`).digest("hex");
}

function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function consumeRateLimit(input: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
  blockDurationMs: number;
}): Promise<{
  allowed: boolean;
  attempts: number;
  remaining: number;
  retryAfterSeconds: number;
}> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const connection = await pool.getConnection();
  const now = new Date();
  const keyHash = hashRateLimitKey(input.scope, input.key);

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<RateLimitRow[]>(
      `
        SELECT key_hash, scope, attempts, window_started_at, blocked_until
        FROM auth_rate_limits
        WHERE key_hash = ?
        FOR UPDATE
      `,
      [keyHash],
    );

    const row = rows[0];
    const windowStartedAt = row ? new Date(row.window_started_at) : now;
    const blockedUntil = row?.blocked_until ? new Date(row.blocked_until) : null;
    const windowExpired = now.getTime() - windowStartedAt.getTime() >= input.windowMs;

    if (blockedUntil && blockedUntil.getTime() > now.getTime()) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000),
      );
      await connection.commit();
      return {
        allowed: false,
        attempts: row.attempts,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    const nextAttempts = !row || windowExpired ? 1 : row.attempts + 1;
    const nextWindowStartedAt = !row || windowExpired ? now : windowStartedAt;
    const isBlocked = nextAttempts > input.limit;
    const nextBlockedUntil = isBlocked
      ? new Date(now.getTime() + input.blockDurationMs)
      : null;

    await connection.query(
      `
        INSERT INTO auth_rate_limits (
          key_hash,
          scope,
          attempts,
          window_started_at,
          blocked_until,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          scope = VALUES(scope),
          attempts = VALUES(attempts),
          window_started_at = VALUES(window_started_at),
          blocked_until = VALUES(blocked_until),
          updated_at = NOW()
      `,
      [
        keyHash,
        input.scope,
        nextAttempts,
        toMySqlDateTime(nextWindowStartedAt),
        toMySqlDateTime(nextBlockedUntil),
      ],
    );

    await connection.commit();

    return {
      allowed: !isBlocked,
      attempts: nextAttempts,
      remaining: Math.max(0, input.limit - nextAttempts),
      retryAfterSeconds: nextBlockedUntil
        ? Math.max(1, Math.ceil((nextBlockedUntil.getTime() - now.getTime()) / 1000))
        : 0,
    };
  } catch (error) {
    await connection.rollback();
    logger.error("Failed to apply rate limit", error, {
      scope: input.scope,
    });
    throw error;
  } finally {
    connection.release();
  }
}

export async function clearRateLimit(scope: string, key: string) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  await pool.query("DELETE FROM auth_rate_limits WHERE key_hash = ?", [
    hashRateLimitKey(scope, key),
  ]);
}

export async function createUserSessionRecord(input: {
  userId: string;
  sessionType?: "user" | "admin";
  ttlSeconds: number;
  mfaVerifiedAt?: Date | null;
  stepUpVerifiedAt?: Date | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ sessionId: string; expiresAt: Date }> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + input.ttlSeconds * 1000);

  await pool.query(
    `
      INSERT INTO user_sessions (
        id,
        user_id,
        session_type,
        expires_at,
        mfa_verified_at,
        step_up_verified_at,
        ip_address,
        user_agent,
        created_at,
        last_seen_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [
      sessionId,
      input.userId,
      input.sessionType || "user",
      toMySqlDateTime(expiresAt),
      toMySqlDateTime(input.mfaVerifiedAt || null),
      toMySqlDateTime(input.stepUpVerifiedAt || null),
      input.ipAddress || null,
      input.userAgent || null,
    ],
  );

  return { sessionId, expiresAt };
}

export async function getActiveUserSessionRecord(
  sessionId: string,
  userId: string,
): Promise<UserSessionRow | null> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<UserSessionRow[]>(
    `
      SELECT id, user_id, session_type, expires_at, revoked_at, mfa_verified_at, step_up_verified_at
      FROM user_sessions
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [sessionId, userId],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  if (row.revoked_at) {
    return null;
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return null;
  }

  return row;
}

export async function touchUserSessionRecord(sessionId: string) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  await pool.query(
    `
      UPDATE user_sessions
      SET last_seen_at = NOW()
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [sessionId],
  );
}

export async function markUserSessionMfaVerified(
  sessionId: string,
  verifiedAt: Date = new Date(),
) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  await pool.query(
    `
      UPDATE user_sessions
      SET mfa_verified_at = ?, last_seen_at = NOW()
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [toMySqlDateTime(verifiedAt), sessionId],
  );
}

export async function markUserSessionStepUpVerified(
  sessionId: string,
  verifiedAt: Date = new Date(),
) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  await pool.query(
    `
      UPDATE user_sessions
      SET step_up_verified_at = ?, last_seen_at = NOW()
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [toMySqlDateTime(verifiedAt), sessionId],
  );
}

export async function revokeUserSessionRecord(
  sessionId: string,
  reason: string = "logout",
) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  await pool.query(
    `
      UPDATE user_sessions
      SET revoked_at = NOW(), revoke_reason = ?
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [reason, sessionId],
  );
}

export async function revokeAllUserSessionRecords(
  userId: string,
  reason: string = "security_event",
) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  await pool.query(
    `
      UPDATE user_sessions
      SET revoked_at = NOW(), revoke_reason = ?
      WHERE user_id = ?
        AND revoked_at IS NULL
    `,
    [reason, userId],
  );
}

export async function createPasswordResetToken(input: {
  userId: string;
  ttlMinutes?: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ token: string; expiresAt: Date }> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (input.ttlMinutes || 30) * 60 * 1000);

  await pool.query(
    `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ?
        AND used_at IS NULL
        AND expires_at > NOW()
    `,
    [input.userId],
  );

  await pool.query(
    `
      INSERT INTO password_reset_tokens (
        id,
        user_id,
        token_hash,
        expires_at,
        requested_ip,
        requested_user_agent,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      randomUUID(),
      input.userId,
      hashPasswordResetToken(token),
      toMySqlDateTime(expiresAt),
      input.ipAddress || null,
      input.userAgent || null,
    ],
  );

  return { token, expiresAt };
}

export async function resetPasswordUsingToken(input: {
  token: string;
  newPassword: string;
}): Promise<{ success: boolean; userId?: string; error?: "invalid_token" | "expired_token" }> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<PasswordResetTokenRow[]>(
      `
        SELECT id, user_id, expires_at, used_at
        FROM password_reset_tokens
        WHERE token_hash = ?
        LIMIT 1
        FOR UPDATE
      `,
      [hashPasswordResetToken(input.token)],
    );

    const tokenRow = rows[0];
    if (!tokenRow || tokenRow.used_at) {
      await connection.rollback();
      return { success: false, error: "invalid_token" };
    }

    if (new Date(tokenRow.expires_at).getTime() <= Date.now()) {
      await connection.rollback();
      return { success: false, error: "expired_token" };
    }

    const passwordHash = await hashPassword(input.newPassword);

    await connection.query(
      `
        UPDATE users
        SET password_hash = ?,
            password_changed_at = NOW(),
            session_version = session_version + 1
        WHERE id = ?
      `,
      [passwordHash, tokenRow.user_id],
    );

    await connection.query(
      `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE id = ?
      `,
      [tokenRow.id],
    );

    await connection.query(
      `
        UPDATE user_sessions
        SET revoked_at = NOW(), revoke_reason = 'password_reset'
        WHERE user_id = ?
          AND revoked_at IS NULL
      `,
      [tokenRow.user_id],
    );

    await connection.commit();
    return { success: true, userId: tokenRow.user_id };
  } catch (error) {
    await connection.rollback();
    logger.error("Failed to reset password using token", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteExpiredSecurityArtifacts() {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  await Promise.all([
    pool.query(
      "DELETE FROM auth_rate_limits WHERE blocked_until IS NOT NULL AND blocked_until < NOW()",
    ),
    pool.query("DELETE FROM password_reset_tokens WHERE expires_at < NOW()"),
    pool.query("DELETE FROM user_sessions WHERE expires_at < NOW()"),
  ]);
}
