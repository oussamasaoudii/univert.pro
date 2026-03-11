import { ensureCoreSchema } from "@/lib/mysql/schema";
import { ensurePlatformDataSchema } from "@/lib/mysql/platform";
import { getMySQLPool } from "@/lib/mysql/pool";

let provisioningSchemaPromise: Promise<void> | null = null;
let queueSchemaPromise: Promise<void> | null = null;
let domainSchemaPromise: Promise<void> | null = null;
let backupSchemaPromise: Promise<void> | null = null;
let monitoringSchemaPromise: Promise<void> | null = null;
let billingCompatSchemaPromise: Promise<void> | null = null;
let auditSchemaPromise: Promise<void> | null = null;

export async function ensureProvisioningSchema() {
  if (!provisioningSchemaPromise) {
    provisioningSchemaPromise = initializeProvisioningSchema();
  }

  await provisioningSchemaPromise;
}

export async function ensureQueueSchema() {
  if (!queueSchemaPromise) {
    queueSchemaPromise = initializeQueueSchema();
  }

  await queueSchemaPromise;
}

export async function ensureDomainAutomationSchema() {
  if (!domainSchemaPromise) {
    domainSchemaPromise = initializeDomainAutomationSchema();
  }

  await domainSchemaPromise;
}

export async function ensureBackupSchema() {
  if (!backupSchemaPromise) {
    backupSchemaPromise = initializeBackupSchema();
  }

  await backupSchemaPromise;
}

export async function ensureMonitoringSchema() {
  if (!monitoringSchemaPromise) {
    monitoringSchemaPromise = initializeMonitoringSchema();
  }

  await monitoringSchemaPromise;
}

export async function ensureBillingCompatSchema() {
  if (!billingCompatSchemaPromise) {
    billingCompatSchemaPromise = initializeBillingCompatSchema();
  }

  await billingCompatSchemaPromise;
}

export async function ensureAuditSchema() {
  if (!auditSchemaPromise) {
    auditSchemaPromise = initializeAuditSchema();
  }

  await auditSchemaPromise;
}

async function initializeProvisioningSchema() {
  await ensureCoreSchema();
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provisioning_jobs (
      id CHAR(36) PRIMARY KEY,
      website_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      status ENUM('pending','queued','running','completed','failed','canceled') NOT NULL DEFAULT 'pending',
      progress INT NOT NULL DEFAULT 0,
      current_step VARCHAR(255) NULL,
      error_message TEXT NULL,
      started_at DATETIME NULL,
      completed_at DATETIME NULL,
      retry_count INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_provisioning_jobs_website (website_id),
      INDEX idx_provisioning_jobs_user (user_id),
      INDEX idx_provisioning_jobs_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provisioning_job_logs (
      id CHAR(36) PRIMARY KEY,
      job_id CHAR(36) NOT NULL,
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      level ENUM('debug','info','warn','error') NOT NULL DEFAULT 'info',
      message TEXT NOT NULL,
      step_name VARCHAR(191) NULL,
      details LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_provisioning_job_logs_job (job_id, timestamp),
      CONSTRAINT fk_provisioning_job_logs_job
        FOREIGN KEY (job_id) REFERENCES provisioning_jobs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function initializeQueueSchema() {
  await ensureProvisioningSchema();
  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS job_queue (
      id CHAR(36) PRIMARY KEY,
      job_type ENUM('provisioning','deployment_retry','status_poll','post_deploy','cleanup','notification') NOT NULL,
      provisioning_job_id CHAR(36) NULL,
      status ENUM('pending','claimed','processing','completed','failed','dead_letter') NOT NULL DEFAULT 'pending',
      priority INT NOT NULL DEFAULT 100,
      scheduled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      claimed_at DATETIME NULL,
      started_at DATETIME NULL,
      completed_at DATETIME NULL,
      worker_id VARCHAR(191) NULL,
      locked_until DATETIME NULL,
      attempt_count INT NOT NULL DEFAULT 0,
      max_attempts INT NOT NULL DEFAULT 3,
      last_error TEXT NULL,
      next_retry_at DATETIME NULL,
      backoff_seconds INT NOT NULL DEFAULT 30,
      timeout_seconds INT NOT NULL DEFAULT 300,
      payload LONGTEXT NOT NULL,
      result LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_job_queue_lookup (status, scheduled_at, priority),
      INDEX idx_job_queue_locked (locked_until),
      INDEX idx_job_queue_worker (worker_id),
      INDEX idx_job_queue_provisioning (provisioning_job_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dead_letter_queue (
      id CHAR(36) PRIMARY KEY,
      original_job_id CHAR(36) NOT NULL,
      job_type VARCHAR(64) NOT NULL,
      provisioning_job_id CHAR(36) NULL,
      failure_reason TEXT NOT NULL,
      attempt_count INT NOT NULL DEFAULT 0,
      last_error TEXT NULL,
      payload LONGTEXT NOT NULL,
      failed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME NULL,
      resolved_by CHAR(36) NULL,
      resolution_notes TEXT NULL,
      INDEX idx_dead_letter_failed_at (failed_at),
      INDEX idx_dead_letter_resolved (resolved_at),
      INDEX idx_dead_letter_original_job (original_job_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS worker_heartbeats (
      worker_id VARCHAR(191) PRIMARY KEY,
      last_heartbeat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      jobs_processed INT NOT NULL DEFAULT 0,
      jobs_failed INT NOT NULL DEFAULT 0,
      status ENUM('active','dead') NOT NULL DEFAULT 'active',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_worker_heartbeats_status (status),
      INDEX idx_worker_heartbeats_last (last_heartbeat)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function initializeDomainAutomationSchema() {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  await pool.query(`
    ALTER TABLE domains
      ADD COLUMN IF NOT EXISTS website_id CHAR(36) NULL,
      ADD COLUMN IF NOT EXISTS domain_type ENUM('pending_subdomain','platform_subdomain','custom_domain') NOT NULL DEFAULT 'custom_domain',
      ADD COLUMN IF NOT EXISTS status ENUM('pending','verifying','verified','ssl_pending','active','failed') NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS dns_status ENUM('pending','verifying','verified','failed') NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS dns_records LONGTEXT NULL,
      ADD COLUMN IF NOT EXISTS dns_verification_token VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS dns_verified_at DATETIME NULL,
      ADD COLUMN IF NOT EXISTS ssl_cert_id CHAR(36) NULL,
      ADD COLUMN IF NOT EXISTS ssl_expires_at DATETIME NULL,
      ADD COLUMN IF NOT EXISTS ssl_auto_renewal TINYINT(1) NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS error_message TEXT NULL,
      ADD COLUMN IF NOT EXISTS metadata LONGTEXT NULL,
      ADD COLUMN IF NOT EXISTS verified_at DATETIME NULL,
      ADD COLUMN IF NOT EXISTS failed_at DATETIME NULL
  `);

  await pool.query(`
    ALTER TABLE domains
      MODIFY COLUMN ssl_status ENUM('pending','requested','verified','issued','failed','active','expired') NOT NULL DEFAULT 'pending'
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS domain_logs (
      id CHAR(36) PRIMARY KEY,
      domain_id CHAR(36) NOT NULL,
      website_id CHAR(36) NULL,
      user_id CHAR(36) NOT NULL,
      action VARCHAR(191) NOT NULL,
      old_state LONGTEXT NULL,
      new_state LONGTEXT NULL,
      details LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_domain_logs_domain (domain_id, created_at),
      INDEX idx_domain_logs_website (website_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dns_verifications (
      id CHAR(36) PRIMARY KEY,
      domain_id CHAR(36) NOT NULL,
      verification_token VARCHAR(191) NOT NULL,
      record_name VARCHAR(255) NOT NULL,
      record_type ENUM('TXT','CNAME','A') NOT NULL,
      record_value TEXT NOT NULL,
      verified TINYINT(1) NOT NULL DEFAULT 0,
      verification_attempts INT NOT NULL DEFAULT 0,
      last_checked_at DATETIME NULL,
      verified_at DATETIME NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_dns_verifications_domain (domain_id),
      INDEX idx_dns_verifications_verified (verified, expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ssl_certificates (
      id CHAR(36) PRIMARY KEY,
      domain_id CHAR(36) NOT NULL,
      website_id CHAR(36) NULL,
      user_id CHAR(36) NOT NULL,
      certificate_id VARCHAR(191) NULL,
      common_name VARCHAR(255) NOT NULL,
      subject_alt_names LONGTEXT NULL,
      status ENUM('pending','provisioning','verified','issued','failed') NOT NULL DEFAULT 'pending',
      issue_date DATETIME NULL,
      expires_at DATETIME NULL,
      auto_renewal TINYINT(1) NOT NULL DEFAULT 1,
      renewal_status ENUM('pending','in_progress','completed','failed') NULL,
      renewal_last_attempted DATETIME NULL,
      error_message TEXT NULL,
      provider VARCHAR(64) NOT NULL DEFAULT 'letsencrypt',
      metadata LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ssl_certificates_domain (domain_id),
      INDEX idx_ssl_certificates_expires (expires_at),
      INDEX idx_ssl_certificates_status (status, renewal_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function initializeBackupSchema() {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS backups (
      id CHAR(36) PRIMARY KEY,
      website_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      backup_type ENUM('automatic_scheduled','manual','pre_deploy','pre_restore','export_package') NOT NULL DEFAULT 'manual',
      status ENUM('pending','running','completed','failed','expired','deleted') NOT NULL DEFAULT 'pending',
      size_bytes BIGINT NULL,
      storage_location TEXT NULL,
      storage_provider VARCHAR(64) NOT NULL DEFAULT 'local',
      retention_days INT NULL,
      expires_at DATETIME NULL,
      metadata LONGTEXT NULL,
      error_message TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_backups_website (website_id, created_at),
      INDEX idx_backups_status (status),
      INDEX idx_backups_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS backup_logs (
      id CHAR(36) PRIMARY KEY,
      backup_id CHAR(36) NOT NULL,
      website_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      action VARCHAR(191) NOT NULL,
      old_status VARCHAR(64) NULL,
      new_status VARCHAR(64) NULL,
      details LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_backup_logs_backup (backup_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS exports (
      id CHAR(36) PRIMARY KEY,
      backup_id CHAR(36) NULL,
      website_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      export_type ENUM('full_website','database_only','files_only','custom') NOT NULL DEFAULT 'full_website',
      status ENUM('pending','preparing','packaging','completed','failed','expired') NOT NULL DEFAULT 'pending',
      format VARCHAR(32) NOT NULL DEFAULT 'zip',
      size_bytes BIGINT NULL,
      download_url TEXT NULL,
      download_expires_at DATETIME NULL,
      download_count INT NOT NULL DEFAULT 0,
      last_downloaded_at DATETIME NULL,
      metadata LONGTEXT NULL,
      error_message TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_exports_website (website_id, created_at),
      INDEX idx_exports_status (status),
      INDEX idx_exports_expires (download_expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS restores (
      id CHAR(36) PRIMARY KEY,
      backup_id CHAR(36) NOT NULL,
      website_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      restore_type ENUM('full_restore','database_only','files_only','point_in_time') NOT NULL DEFAULT 'full_restore',
      status ENUM('pending','preparing','restoring','completed','failed','rolled_back') NOT NULL DEFAULT 'pending',
      restoration_job_id CHAR(36) NULL,
      restore_started_at DATETIME NULL,
      restore_completed_at DATETIME NULL,
      metadata LONGTEXT NULL,
      error_message TEXT NULL,
      rollback_notes TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_restores_website (website_id, created_at),
      INDEX idx_restores_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS restore_logs (
      id CHAR(36) PRIMARY KEY,
      restore_id CHAR(36) NOT NULL,
      website_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      step VARCHAR(191) NOT NULL,
      status VARCHAR(64) NOT NULL,
      duration_ms INT NULL,
      details LONGTEXT NULL,
      error_message TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_restore_logs_restore (restore_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS backup_retention_policies (
      id CHAR(36) PRIMARY KEY,
      plan_id CHAR(36) NOT NULL,
      backup_frequency VARCHAR(64) NOT NULL DEFAULT 'daily',
      max_backups_retained INT NOT NULL DEFAULT 7,
      max_backup_age_days INT NOT NULL DEFAULT 30,
      allow_manual_backups TINYINT(1) NOT NULL DEFAULT 1,
      allow_pre_deploy_backups TINYINT(1) NOT NULL DEFAULT 1,
      allow_exports TINYINT(1) NOT NULL DEFAULT 1,
      export_download_retention_days INT NOT NULL DEFAULT 7,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_backup_retention_plan (plan_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function initializeMonitoringSchema() {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS health_checks (
      id CHAR(36) PRIMARY KEY,
      website_id CHAR(36) NULL,
      check_type ENUM('website_reachability','website_performance','database_connectivity','domain_dns','domain_ssl','provisioning_status','backup_success','restore_success','export_success','server_uptime') NOT NULL,
      status ENUM('passing','warning','critical','unknown') NOT NULL DEFAULT 'unknown',
      response_time_ms INT NULL,
      error_message TEXT NULL,
      details LONGTEXT NULL,
      checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_health_checks_website (website_id, checked_at),
      INDEX idx_health_checks_type (check_type, checked_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incidents (
      id CHAR(36) PRIMARY KEY,
      website_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      incident_type ENUM('provisioning_failed','ssl_issuance_failed','domain_verification_failed','website_unreachable','database_unreachable','backup_failed','restore_failed','export_failed','ssl_expiring_soon') NOT NULL,
      status ENUM('open','investigating','resolved','closed') NOT NULL DEFAULT 'open',
      severity ENUM('info','warning','critical') NOT NULL DEFAULT 'warning',
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      affected_resources LONGTEXT NULL,
      resolution_notes TEXT NULL,
      detected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_incidents_website (website_id, created_at),
      INDEX idx_incidents_status (status, severity)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id CHAR(36) PRIMARY KEY,
      incident_id CHAR(36) NULL,
      website_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      alert_type VARCHAR(191) NOT NULL,
      alert_state ENUM('info','warning','critical','resolved') NOT NULL DEFAULT 'warning',
      title VARCHAR(255) NOT NULL,
      message TEXT NULL,
      action_url TEXT NULL,
      action_label VARCHAR(191) NULL,
      sent_at DATETIME NULL,
      acknowledged_at DATETIME NULL,
      acknowledged_by CHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_alerts_user (user_id, acknowledged_at),
      INDEX idx_alerts_website (website_id, created_at),
      INDEX idx_alerts_incident (incident_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS website_health_summary (
      id CHAR(36) PRIMARY KEY,
      website_id CHAR(36) NOT NULL,
      overall_status ENUM('healthy','degraded','critical','unknown') NOT NULL DEFAULT 'unknown',
      reachability_status VARCHAR(64) NULL,
      ssl_status VARCHAR(64) NULL,
      dns_status VARCHAR(64) NULL,
      last_successful_check DATETIME NULL,
      last_failed_check DATETIME NULL,
      uptime_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00,
      open_incidents_count INT NOT NULL DEFAULT 0,
      critical_incidents_count INT NOT NULL DEFAULT 0,
      last_check_duration_ms INT NULL,
      last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_website_health_summary_website (website_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS server_health (
      id CHAR(36) PRIMARY KEY,
      server_id CHAR(36) NOT NULL,
      status ENUM('healthy','degraded','critical','offline') NOT NULL DEFAULT 'healthy',
      cpu_percentage DECIMAL(5,2) NULL,
      memory_percentage DECIMAL(5,2) NULL,
      disk_percentage DECIMAL(5,2) NULL,
      active_deployments INT NULL,
      error_rate DECIMAL(6,2) NULL,
      last_heartbeat DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_server_health_server (server_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function initializeBillingCompatSchema() {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscription_history (
      id CHAR(36) PRIMARY KEY,
      subscription_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      action ENUM('created','upgraded','downgraded','renewed','canceled','payment_failed') NOT NULL,
      old_plan_id CHAR(36) NULL,
      new_plan_id CHAR(36) NULL,
      old_status VARCHAR(64) NULL,
      new_status VARCHAR(64) NULL,
      amount DECIMAL(10,2) NULL,
      metadata LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_subscription_history_subscription (subscription_id, created_at),
      INDEX idx_subscription_history_user (user_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS feature_usage (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      feature_key VARCHAR(191) NOT NULL,
      usage_count INT NOT NULL DEFAULT 0,
      limit_value INT NULL,
      reset_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_feature_usage_user_feature (user_id, feature_key),
      INDEX idx_feature_usage_reset (reset_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function initializeAuditSchema() {
  await ensureCoreSchema();
  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id CHAR(36) PRIMARY KEY,
      actor_id VARCHAR(191) NOT NULL,
      actor_type ENUM('admin','user','system') NOT NULL,
      action VARCHAR(191) NOT NULL,
      resource_type VARCHAR(191) NOT NULL,
      resource_id VARCHAR(191) NOT NULL,
      changes LONGTEXT NULL,
      status ENUM('success','failure') NOT NULL DEFAULT 'success',
      error_message TEXT NULL,
      ip_address VARCHAR(64) NULL,
      user_agent TEXT NULL,
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      metadata LONGTEXT NULL,
      INDEX idx_audit_logs_resource (resource_id, timestamp),
      INDEX idx_audit_logs_actor (actor_id, timestamp),
      INDEX idx_audit_logs_action (action, timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
