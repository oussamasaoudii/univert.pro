import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { verifyPassword } from "@/lib/mysql/password";
import { ensureCoreSchema } from "@/lib/mysql/schema";
import { decryptSecret, encryptSecret } from "@/lib/security/crypto";
import {
  buildOtpAuthUri,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  isRecoveryCodeFormat,
  normalizeRecoveryCodeForDisplay,
  verifyTotpCode,
} from "@/lib/security/totp";
import { logger } from "@/lib/utils/errors";

const PENDING_ENROLLMENT_TTL_MS = 15 * 60 * 1000;

type AdminMfaRow = {
  id: string;
  email: string;
  role: "user" | "admin";
  status: "pending" | "active" | "suspended";
  admin_mfa_enabled: number | boolean;
  admin_mfa_secret_ciphertext: string | null;
  admin_mfa_pending_secret_ciphertext: string | null;
  admin_mfa_pending_created_at: string | null;
  admin_mfa_enrolled_at: string | null;
  password_hash: string | null;
};

type RecoveryCodeCountRow = {
  remaining: number;
};

type RecoveryCodeRow = {
  id: string;
  code_hash: string;
};

function recoveryCodePepper() {
  const pepper = process.env.ENCRYPTION_KEY;
  if (!pepper || pepper.trim().length < 32) {
    throw new Error("ENCRYPTION_KEY must be configured with at least 32 characters");
  }

  return pepper;
}

async function getAdminMfaRow(userId: string) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<AdminMfaRow[]>(
    `
      SELECT
        id,
        email,
        role,
        status,
        admin_mfa_enabled,
        admin_mfa_secret_ciphertext,
        admin_mfa_pending_secret_ciphertext,
        admin_mfa_pending_created_at,
        admin_mfa_enrolled_at,
        password_hash
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] || null;
}

async function countRemainingRecoveryCodes(userId: string) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<RecoveryCodeCountRow[]>(
    `
      SELECT COUNT(*) AS remaining
      FROM admin_mfa_recovery_codes
      WHERE user_id = ?
        AND used_at IS NULL
    `,
    [userId],
  );

  return Number(rows[0]?.remaining || 0);
}

async function replaceRecoveryCodes(userId: string, codes: string[]) {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM admin_mfa_recovery_codes WHERE user_id = ?", [userId]);

    for (const code of codes) {
      await connection.query(
        `
          INSERT INTO admin_mfa_recovery_codes (id, user_id, code_hash, created_at)
          VALUES (?, ?, ?, NOW())
        `,
        [randomUUID(), userId, hashRecoveryCode(code, recoveryCodePepper())],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getAdminMfaSummary(userId: string) {
  const row = await getAdminMfaRow(userId);
  if (!row || row.role !== "admin") {
    return null;
  }

  return {
    enabled: row.admin_mfa_enabled === 1 || row.admin_mfa_enabled === true,
    enrolledAt: row.admin_mfa_enrolled_at,
    pendingEnrollment:
      Boolean(row.admin_mfa_pending_secret_ciphertext) &&
      Boolean(row.admin_mfa_pending_created_at),
    recoveryCodesRemaining: await countRemainingRecoveryCodes(userId),
  };
}

export async function beginAdminMfaEnrollment(userId: string) {
  const row = await getAdminMfaRow(userId);
  if (!row || row.role !== "admin" || row.status !== "active") {
    throw new Error("admin_account_required");
  }

  let secret = "";
  const pendingAge = row.admin_mfa_pending_created_at
    ? Date.now() - new Date(row.admin_mfa_pending_created_at).getTime()
    : Number.POSITIVE_INFINITY;

  if (
    row.admin_mfa_pending_secret_ciphertext &&
    Number.isFinite(pendingAge) &&
    pendingAge < PENDING_ENROLLMENT_TTL_MS
  ) {
    secret = decryptSecret(row.admin_mfa_pending_secret_ciphertext);
  } else {
    secret = generateTotpSecret();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE users
        SET admin_mfa_pending_secret_ciphertext = ?,
            admin_mfa_pending_created_at = NOW()
        WHERE id = ?
      `,
      [encryptSecret(secret), userId],
    );
  }

  return {
    manualEntryKey: secret,
    otpAuthUri: buildOtpAuthUri({
      secret,
      issuer: "Univert Admin",
      accountName: row.email,
    }),
  };
}

export async function completeAdminMfaEnrollment(userId: string, code: string) {
  const row = await getAdminMfaRow(userId);
  if (
    !row ||
    row.role !== "admin" ||
    row.status !== "active" ||
    !row.admin_mfa_pending_secret_ciphertext
  ) {
    return { ok: false as const, error: "mfa_enrollment_not_started" };
  }

  const secret = decryptSecret(row.admin_mfa_pending_secret_ciphertext);
  if (!verifyTotpCode(secret, code)) {
    return { ok: false as const, error: "invalid_mfa_code" };
  }

  const recoveryCodes = generateRecoveryCodes(10);
  const pool = getMySQLPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query(
      `
        UPDATE users
        SET admin_mfa_enabled = 1,
            admin_mfa_secret_ciphertext = ?,
            admin_mfa_pending_secret_ciphertext = NULL,
            admin_mfa_pending_created_at = NULL,
            admin_mfa_enrolled_at = NOW()
        WHERE id = ?
      `,
      [encryptSecret(secret), userId],
    );

    await connection.query("DELETE FROM admin_mfa_recovery_codes WHERE user_id = ?", [userId]);
    for (const recoveryCode of recoveryCodes) {
      await connection.query(
        `
          INSERT INTO admin_mfa_recovery_codes (id, user_id, code_hash, created_at)
          VALUES (?, ?, ?, NOW())
        `,
        [randomUUID(), userId, hashRecoveryCode(recoveryCode, recoveryCodePepper())],
      );
    }

    await connection.commit();
    return { ok: true as const, recoveryCodes };
  } catch (error) {
    await connection.rollback();
    logger.error("Failed to complete admin MFA enrollment", error, { userId });
    throw error;
  } finally {
    connection.release();
  }
}

export async function verifyAdminMfaAssertion(userId: string, inputCode: string) {
  const row = await getAdminMfaRow(userId);
  if (
    !row ||
    row.role !== "admin" ||
    row.status !== "active" ||
    !(row.admin_mfa_enabled === 1 || row.admin_mfa_enabled === true) ||
    !row.admin_mfa_secret_ciphertext
  ) {
    return { ok: false as const, error: "mfa_not_enabled" };
  }

  const normalizedCode = inputCode.trim();
  const secret = decryptSecret(row.admin_mfa_secret_ciphertext);

  if (/^\d{6}$/.test(normalizedCode) && verifyTotpCode(secret, normalizedCode)) {
    return { ok: true as const, method: "totp" as const };
  }

  if (isRecoveryCodeFormat(normalizedCode)) {
    const hashedCode = hashRecoveryCode(normalizeRecoveryCodeForDisplay(normalizedCode), recoveryCodePepper());
    const pool = getMySQLPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const [rows] = await connection.query<RecoveryCodeRow[]>(
        `
          SELECT id, code_hash
          FROM admin_mfa_recovery_codes
          WHERE user_id = ?
            AND used_at IS NULL
            AND code_hash = ?
          LIMIT 1
          FOR UPDATE
        `,
        [userId, hashedCode],
      );

      const match = rows[0];
      if (!match) {
        await connection.rollback();
        return { ok: false as const, error: "invalid_mfa_code" };
      }

      await connection.query(
        `
          UPDATE admin_mfa_recovery_codes
          SET used_at = NOW()
          WHERE id = ?
        `,
        [match.id],
      );
      await connection.commit();

      return {
        ok: true as const,
        method: "recovery_code" as const,
        recoveryCodesRemaining: await countRemainingRecoveryCodes(userId),
      };
    } catch (error) {
      await connection.rollback();
      logger.error("Failed to consume admin MFA recovery code", error, { userId });
      throw error;
    } finally {
      connection.release();
    }
  }

  return { ok: false as const, error: "invalid_mfa_code" };
}

export async function regenerateAdminRecoveryCodes(userId: string) {
  const row = await getAdminMfaRow(userId);
  if (
    !row ||
    row.role !== "admin" ||
    row.status !== "active" ||
    !(row.admin_mfa_enabled === 1 || row.admin_mfa_enabled === true)
  ) {
    return null;
  }

  const codes = generateRecoveryCodes(10);
  await replaceRecoveryCodes(userId, codes);
  return codes;
}

export async function disableAdminMfa(userId: string) {
  const row = await getAdminMfaRow(userId);
  if (!row || row.role !== "admin") {
    return false;
  }

  const pool = getMySQLPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `
        UPDATE users
        SET admin_mfa_enabled = 0,
            admin_mfa_secret_ciphertext = NULL,
            admin_mfa_pending_secret_ciphertext = NULL,
            admin_mfa_pending_created_at = NULL
        WHERE id = ?
      `,
      [userId],
    );
    await connection.query("DELETE FROM admin_mfa_recovery_codes WHERE user_id = ?", [userId]);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    logger.error("Failed to disable admin MFA", error, { userId });
    throw error;
  } finally {
    connection.release();
  }
}

export async function verifyAdminPassword(userId: string, password: string) {
  const row = await getAdminMfaRow(userId);
  if (!row?.password_hash) {
    return false;
  }

  return verifyPassword(password, row.password_hash);
}
