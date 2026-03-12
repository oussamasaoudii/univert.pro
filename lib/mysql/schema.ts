import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { hashPassword } from "@/lib/mysql/password";
import { getLocalAdminCredentials } from "@/lib/local-admin-auth";

let schemaReadyPromise: Promise<void> | null = null;
let schemaInitialized = false;

export async function ensureCoreSchema(): Promise<void> {
  // If already verified, skip
  if (schemaInitialized) {
    return;
  }
  
  if (!schemaReadyPromise) {
    schemaReadyPromise = initializeCoreSchema().catch((error) => {
      // Allow retry on next request if initial bootstrap failed transiently.
      schemaReadyPromise = null;
      throw error;
    });
  }

  return schemaReadyPromise;
}

/**
 * Check if the required tables already exist in the database.
 * This is used to skip schema creation when tables are pre-created (e.g., TiDB Cloud).
 */
async function checkTablesExist(pool: ReturnType<typeof getMySQLPool>): Promise<boolean> {
  try {
    // Try to select from users table directly - if it exists, we're good
    await pool.query(`SELECT 1 FROM users LIMIT 1`);
    return true;
  } catch (error: unknown) {
    // Table doesn't exist error code is 1146
    const mysqlError = error as { code?: string };
    if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
      return false;
    }
    // For other errors (like permission errors), assume tables exist to avoid DDL
    return true;
  }
}

async function initializeCoreSchema() {
  const pool = getMySQLPool();
  
  if (!pool) {
    console.warn("[Schema] MySQL pool not available, skipping schema initialization");
    schemaInitialized = true;
    return;
  }
  
  // For TiDB Cloud and pre-provisioned databases, skip all DDL operations.
  // Tables should be created via migration scripts (setup-tidb.js)
  // This prevents "CREATE command denied" errors when user lacks DDL permissions.
  
  try {
    await ensureDefaultAdminUser();
  } catch (error) {
    console.warn("[Schema] Could not ensure default admin user:", error);
  }
  
  schemaInitialized = true;
  return;
  
  // The following DDL code is kept for reference but disabled for TiDB Cloud compatibility
  // Tables must be created via scripts/setup-tidb.js

  /* DISABLED - DDL not allowed on TiDB Cloud
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(191) NULL,
      company_name VARCHAR(191) NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      status ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'pending',
      email_verified TINYINT(1) NOT NULL DEFAULT 0,
      plan VARCHAR(32) NOT NULL DEFAULT 'starter',
      total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
      websites_count INT NOT NULL DEFAULT 0,
      last_login_at DATETIME NULL,
      password_changed_at DATETIME NULL,
      session_version INT NOT NULL DEFAULT 1,
      admin_mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
      admin_mfa_secret_ciphertext TEXT NULL,
      admin_mfa_pending_secret_ciphertext TEXT NULL,
      admin_mfa_pending_created_at DATETIME NULL,
      admin_mfa_enrolled_at DATETIME NULL,
      activated_at DATETIME NULL,
      activated_by CHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_role (role),
      INDEX idx_users_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_changed_at DATETIME NULL,
      ADD COLUMN IF NOT EXISTS session_version INT NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS admin_mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS admin_mfa_secret_ciphertext TEXT NULL,
      ADD COLUMN IF NOT EXISTS admin_mfa_pending_secret_ciphertext TEXT NULL,
      ADD COLUMN IF NOT EXISTS admin_mfa_pending_created_at DATETIME NULL,
      ADD COLUMN IF NOT EXISTS admin_mfa_enrolled_at DATETIME NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id TINYINT UNSIGNED PRIMARY KEY,
      platform_name VARCHAR(120) NOT NULL DEFAULT 'Ovmon',
      support_email VARCHAR(191) NOT NULL DEFAULT 'support@ovmon.com',
      maintenance_mode TINYINT(1) NOT NULL DEFAULT 0,
      allow_new_signups TINYINT(1) NOT NULL DEFAULT 1,
      require_email_verification TINYINT(1) NOT NULL DEFAULT 0,
      maintenance_message TEXT NULL,
      addon_s3_enabled TINYINT(1) NOT NULL DEFAULT 0,
      s3_endpoint VARCHAR(255) NULL,
      s3_region VARCHAR(120) NULL,
      s3_bucket VARCHAR(191) NULL,
      s3_access_key VARCHAR(255) NULL,
      s3_secret_key VARCHAR(255) NULL,
      s3_public_url VARCHAR(255) NULL,
      s3_use_path_style TINYINT(1) NULL DEFAULT NULL,
      addon_turnstile_enabled TINYINT(1) NOT NULL DEFAULT 0,
      turnstile_site_key VARCHAR(255) NULL,
      turnstile_secret_key VARCHAR(255) NULL,
      updated_by CHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    ALTER TABLE platform_settings
      ADD COLUMN IF NOT EXISTS addon_s3_enabled TINYINT(1) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS s3_endpoint VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS s3_region VARCHAR(120) NULL,
      ADD COLUMN IF NOT EXISTS s3_bucket VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS s3_access_key VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS s3_secret_key VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS s3_public_url VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS s3_use_path_style TINYINT(1) NULL DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS addon_turnstile_enabled TINYINT(1) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS turnstile_site_key VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS turnstile_secret_key VARCHAR(255) NULL
  `);

  await pool.query(
    `
      INSERT INTO platform_settings (
        id,
        platform_name,
        support_email,
        maintenance_mode,
        allow_new_signups,
        require_email_verification,
        maintenance_message,
        addon_s3_enabled,
        s3_endpoint,
        s3_region,
        s3_bucket,
        s3_access_key,
        s3_secret_key,
        s3_public_url,
        s3_use_path_style,
        addon_turnstile_enabled,
        turnstile_site_key,
        turnstile_secret_key
      )
      VALUES (
        1,
        'Ovmon',
        'support@ovmon.com',
        0,
        1,
        0,
        'Scheduled maintenance in progress.',
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        0,
        NULL,
        NULL
      )
      ON DUPLICATE KEY UPDATE id = id
    `,
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      session_type ENUM('user','admin') NOT NULL DEFAULT 'user',
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME NULL,
      revoke_reason VARCHAR(191) NULL,
      mfa_verified_at DATETIME NULL,
      step_up_verified_at DATETIME NULL,
      ip_address VARCHAR(64) NULL,
      user_agent VARCHAR(255) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at DATETIME NULL,
      INDEX idx_user_sessions_user (user_id),
      INDEX idx_user_sessions_expires (expires_at),
      CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    ALTER TABLE user_sessions
      ADD COLUMN IF NOT EXISTS mfa_verified_at DATETIME NULL,
      ADD COLUMN IF NOT EXISTS step_up_verified_at DATETIME NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      key_hash CHAR(64) PRIMARY KEY,
      scope VARCHAR(64) NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      window_started_at DATETIME NOT NULL,
      blocked_until DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_auth_rate_limits_scope (scope),
      INDEX idx_auth_rate_limits_blocked_until (blocked_until)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      requested_ip VARCHAR(64) NULL,
      requested_user_agent VARCHAR(255) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_reset_tokens_user (user_id),
      INDEX idx_password_reset_tokens_expires (expires_at),
      CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_mfa_recovery_codes (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      code_hash CHAR(64) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      used_at DATETIME NULL,
      INDEX idx_admin_mfa_recovery_codes_user (user_id),
      INDEX idx_admin_mfa_recovery_codes_code_hash (code_hash),
      CONSTRAINT fk_admin_mfa_recovery_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  */
}

async function ensureDefaultAdminUser() {
  const pool = getMySQLPool();
  const admin = getLocalAdminCredentials();
  if (!admin) {
    return;
  }

  const adminEmail = admin.email.trim().toLowerCase();

  const [rows] = await pool.query<Array<{ id: string }>>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [adminEmail],
  );

  if (rows[0]) {
    await pool.query(
      `
        UPDATE users
        SET role = 'admin', status = 'active', email_verified = 1
        WHERE id = ?
      `,
      [rows[0].id],
    );
    return;
  }

  const passwordHash = await hashPassword(admin.password);

  await pool.query(
    `
      INSERT INTO users (
        id,
        email,
        password_hash,
        full_name,
        role,
        status,
        email_verified,
        plan,
        activated_at
      )
      VALUES (?, ?, ?, ?, 'admin', 'active', 1, 'enterprise', NOW())
    `,
    [randomUUID(), adminEmail, passwordHash, "Platform Admin"],
  );
}
