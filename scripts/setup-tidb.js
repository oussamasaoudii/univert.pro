import mysql from 'mysql2/promise';

const TARGET_DATABASE = 'ovmon';

const configWithoutDB = {
  host: process.env.MYSQL_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.MYSQL_PORT || '4000', 10),
  user: process.env.MYSQL_USER || '2FzxXgtpJmH4GCG.root',
  password: process.env.MYSQL_PASSWORD,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
};

const config = {
  ...configWithoutDB,
  database: TARGET_DATABASE,
};

// Schema that matches the application code exactly
const TABLES_SQL = `
-- Core Users table (matches lib/mysql/schema.ts)
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
);

-- Platform Settings
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
);

-- User Sessions
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
  INDEX idx_user_sessions_expires (expires_at)
);

-- Auth Rate Limits
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
);

-- Password Reset Tokens
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
  INDEX idx_password_reset_tokens_expires (expires_at)
);

-- Admin MFA Recovery Codes
CREATE TABLE IF NOT EXISTS admin_mfa_recovery_codes (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  code_hash CHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME NULL,
  INDEX idx_admin_mfa_recovery_codes_user (user_id),
  INDEX idx_admin_mfa_recovery_codes_code_hash (code_hash)
);

-- Templates (matches lib/mysql/platform.ts)
CREATE TABLE IF NOT EXISTS templates (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category ENUM('corporate', 'agency', 'portfolio', 'ecommerce', 'restaurant', 'saas', 'marketplace') NOT NULL,
  stack ENUM('Laravel', 'Next.js', 'WordPress') NOT NULL DEFAULT 'Next.js',
  preview_image_url TEXT NULL,
  live_demo_url TEXT NULL,
  starting_price DECIMAL(10,2) NOT NULL DEFAULT 29.00,
  performance_score DECIMAL(3,1) NOT NULL DEFAULT 4.5,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  template_source_path TEXT NULL,
  deployment_profile VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_templates_category (category),
  INDEX idx_templates_stack (stack),
  INDEX idx_templates_featured (featured),
  INDEX idx_templates_active (is_active)
);

-- Websites
CREATE TABLE IF NOT EXISTS websites (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  template_id CHAR(36) NULL,
  project_name VARCHAR(191) NOT NULL,
  status ENUM('pending', 'provisioning', 'ready', 'suspended', 'failed') NOT NULL DEFAULT 'pending',
  subdomain VARCHAR(191) NOT NULL UNIQUE,
  custom_domain VARCHAR(191) NULL,
  live_url TEXT NULL,
  dashboard_url TEXT NULL,
  provisioning_job_id CHAR(36) NULL,
  provisioning_error TEXT NULL,
  renewal_date DATE NULL,
  page_views INT NOT NULL DEFAULT 0,
  visits INT NOT NULL DEFAULT 0,
  avg_session_duration VARCHAR(16) NOT NULL DEFAULT '0:00',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_websites_user_id (user_id),
  INDEX idx_websites_status (status),
  INDEX idx_websites_template_id (template_id)
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  plan_name VARCHAR(32) NOT NULL DEFAULT 'starter',
  status ENUM('trialing', 'active', 'past_due', 'cancelled') NOT NULL DEFAULT 'active',
  billing_cycle ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  renewal_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Activities
CREATE TABLE IF NOT EXISTS user_activities (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  activity_type VARCHAR(64) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activities_user (user_id),
  INDEX idx_activities_created (created_at)
);

-- User Notifications
CREATE TABLE IF NOT EXISTS user_notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read)
);

-- Admin Notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(80) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_notifications_user (user_id),
  INDEX idx_admin_notifications_read (is_read),
  INDEX idx_admin_notifications_category (category)
);

-- Billing Plans (matches lib/mysql/billing.ts)
CREATE TABLE IF NOT EXISTS billing_plans (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  tier ENUM('starter', 'growth', 'pro', 'premium', 'enterprise') NOT NULL UNIQUE,
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  yearly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  website_limit INT NOT NULL DEFAULT 1,
  storage_limit VARCHAR(64) NOT NULL DEFAULT '5 GB',
  bandwidth_limit VARCHAR(64) NOT NULL DEFAULT '50 GB',
  support_level VARCHAR(64) NOT NULL DEFAULT 'email',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  position INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_billing_plans_position (position),
  INDEX idx_billing_plans_active (is_active)
);

-- Billing Plan Features
CREATE TABLE IF NOT EXISTS billing_plan_features (
  id CHAR(36) PRIMARY KEY,
  plan_id CHAR(36) NOT NULL,
  feature_text VARCHAR(255) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_plan_features_plan (plan_id)
);

-- User Invoices
CREATE TABLE IF NOT EXISTS user_invoices (
  id CHAR(36) PRIMARY KEY,
  invoice_number VARCHAR(64) NOT NULL UNIQUE,
  user_id CHAR(36) NOT NULL,
  subscription_id CHAR(36) NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  status ENUM('paid', 'pending', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  description VARCHAR(255) NOT NULL,
  payment_method VARCHAR(120) NULL,
  download_url TEXT NULL,
  issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_invoices_user (user_id),
  INDEX idx_user_invoices_status (status),
  INDEX idx_user_invoices_issued (issued_at)
);

-- User Payment Methods
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  method_type ENUM('card', 'paypal', 'bank') NOT NULL DEFAULT 'card',
  brand VARCHAR(64) NULL,
  last4 VARCHAR(8) NULL,
  expiry_month TINYINT UNSIGNED NULL,
  expiry_year SMALLINT UNSIGNED NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payment_methods_user (user_id)
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id CHAR(36) PRIMARY KEY,
  ticket_number VARCHAR(32) NOT NULL UNIQUE,
  user_id CHAR(36) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL DEFAULT 'general',
  status ENUM('open', 'in_progress', 'waiting', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
  assigned_to CHAR(36) NULL,
  closed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tickets_user (user_id),
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_priority (priority)
);

-- Support Ticket Messages
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id CHAR(36) PRIMARY KEY,
  ticket_id CHAR(36) NOT NULL,
  sender_id CHAR(36) NOT NULL,
  sender_type ENUM('user', 'admin', 'system') NOT NULL DEFAULT 'user',
  message TEXT NOT NULL,
  attachments JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ticket_messages_ticket (ticket_id),
  INDEX idx_ticket_messages_sender (sender_id)
);

-- Servers (for provisioning)
CREATE TABLE IF NOT EXISTS servers (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL DEFAULT 22,
  username VARCHAR(64) NOT NULL DEFAULT 'root',
  status ENUM('online', 'offline', 'maintenance') NOT NULL DEFAULT 'online',
  provider VARCHAR(64) NULL,
  region VARCHAR(64) NULL,
  specs JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_servers_status (status)
);

-- Domains
CREATE TABLE IF NOT EXISTS domains (
  id CHAR(36) PRIMARY KEY,
  website_id CHAR(36) NOT NULL,
  domain_name VARCHAR(255) NOT NULL UNIQUE,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  ssl_status ENUM('pending', 'active', 'expired', 'failed') NOT NULL DEFAULT 'pending',
  ssl_expires_at DATETIME NULL,
  dns_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domains_website (website_id),
  INDEX idx_domains_ssl (ssl_status)
);

-- Backups
CREATE TABLE IF NOT EXISTS backups (
  id CHAR(36) PRIMARY KEY,
  website_id CHAR(36) NOT NULL,
  backup_type ENUM('full', 'database', 'files') NOT NULL DEFAULT 'full',
  status ENUM('pending', 'in_progress', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  size_bytes BIGINT NULL,
  storage_path TEXT NULL,
  error_message TEXT NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_backups_website (website_id),
  INDEX idx_backups_status (status)
);

-- Queue Jobs
CREATE TABLE IF NOT EXISTS queue_jobs (
  id CHAR(36) PRIMARY KEY,
  queue_name VARCHAR(64) NOT NULL DEFAULT 'default',
  job_type VARCHAR(64) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  error_message TEXT NULL,
  scheduled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_queue_jobs_status (status),
  INDEX idx_queue_jobs_scheduled (scheduled_at),
  INDEX idx_queue_jobs_queue (queue_name)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id CHAR(36) NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_logs_user (user_id),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_entity (entity_type, entity_id),
  INDEX idx_audit_logs_created (created_at)
);

-- Insert default platform settings
INSERT INTO platform_settings (id, platform_name, support_email) 
VALUES (1, 'Ovmon', 'support@ovmon.com')
ON DUPLICATE KEY UPDATE id = id;
`;

async function main() {
  console.log('Connecting to TiDB Cloud...');
  console.log('Host:', configWithoutDB.host);
  console.log('Port:', configWithoutDB.port);
  console.log('User:', configWithoutDB.user);
  console.log('Target Database:', TARGET_DATABASE);
  
  if (!configWithoutDB.password) {
    console.error('ERROR: MYSQL_PASSWORD environment variable is not set');
    process.exit(1);
  }

  let connection;
  try {
    // First connect without database to create it
    console.log('\nStep 1: Creating database...');
    connection = await mysql.createConnection(configWithoutDB);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${TARGET_DATABASE}`);
    console.log(`Database '${TARGET_DATABASE}' created or already exists.`);
    
    await connection.end();
    
    // Now connect to the new database
    console.log('\nStep 2: Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');

    console.log('\nStep 3: Dropping existing tables to recreate with correct schema...');
    
    // Drop tables in reverse dependency order
    const tablesToDrop = [
      'audit_logs',
      'queue_jobs', 
      'backups',
      'domains',
      'servers',
      'support_ticket_messages',
      'support_tickets',
      'user_payment_methods',
      'user_invoices',
      'billing_plan_features',
      'billing_plans',
      'admin_notifications',
      'user_notifications',
      'user_activities',
      'user_subscriptions',
      'websites',
      'templates',
      'admin_mfa_recovery_codes',
      'password_reset_tokens',
      'auth_rate_limits',
      'user_sessions',
      'platform_settings',
      'users'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS ${table}`);
        console.log(`  Dropped table: ${table}`);
      } catch (err) {
        console.log(`  Could not drop ${table}: ${err.message}`);
      }
    }

    console.log('\nStep 4: Creating tables with correct schema...');
    
    // Split SQL statements properly (handle multi-line and comments)
    const statements = [];
    let currentStatement = '';
    const lines = TABLES_SQL.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('--')) continue;
      
      currentStatement += ' ' + line;
      
      // Check if line ends with semicolon (end of statement)
      if (trimmedLine.endsWith(';')) {
        const stmt = currentStatement.trim().slice(0, -1); // Remove trailing semicolon
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute.`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await connection.execute(stmt);
        
        // Extract table name for logging
        const match = stmt.match(/(?:CREATE TABLE IF NOT EXISTS|INSERT INTO|DROP TABLE IF EXISTS)\s+(\w+)/i);
        const tableName = match ? match[1] : `Statement ${i + 1}`;
        console.log(`  [${i + 1}/${statements.length}] Created/executed: ${tableName}`);
        successCount++;
      } catch (err) {
        console.error(`  [${i + 1}/${statements.length}] Error: ${err.message}`);
        console.error(`  Statement: ${stmt.substring(0, 100)}...`);
        errorCount++;
      }
    }

    console.log(`\n========================================`);
    console.log(`Setup complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`========================================\n`);

    // Verify tables
    console.log('Verifying tables...');
    const [tables] = await connection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
      [TARGET_DATABASE]
    );
    console.log(`Tables in ${TARGET_DATABASE}:`, tables.map(t => t.TABLE_NAME || t.table_name).join(', '));

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

main();
