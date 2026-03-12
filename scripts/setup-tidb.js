import mysql from 'mysql2/promise';

const config = {
  host: process.env.MYSQL_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.MYSQL_PORT || '4000', 10),
  user: process.env.MYSQL_USER || '2FzxXgtpJmH4GCG.root',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'sys',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
};

const TABLES_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_token (token),
  INDEX idx_sessions_expires (expires_at)
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  features JSON,
  limits JSON,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plans_slug (slug),
  INDEX idx_plans_active (is_active)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan_id VARCHAR(36) NOT NULL,
  status ENUM('active', 'canceled', 'past_due', 'trialing', 'paused') DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subscriptions_user (user_id),
  INDEX idx_subscriptions_plan (plan_id),
  INDEX idx_subscriptions_status (status),
  INDEX idx_subscriptions_stripe (stripe_subscription_id)
);

-- Websites table
CREATE TABLE IF NOT EXISTS websites (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  domain VARCHAR(255),
  custom_domain VARCHAR(255),
  status ENUM('pending', 'provisioning', 'active', 'suspended', 'deleted') DEFAULT 'pending',
  template_id VARCHAR(36),
  settings JSON,
  ssl_status ENUM('pending', 'active', 'expired', 'failed') DEFAULT 'pending',
  ssl_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_websites_user (user_id),
  INDEX idx_websites_slug (slug),
  INDEX idx_websites_domain (domain),
  INDEX idx_websites_status (status),
  UNIQUE INDEX idx_websites_user_slug (user_id, slug)
);

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  hostname VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  port INT DEFAULT 22,
  status ENUM('online', 'offline', 'maintenance', 'error') DEFAULT 'offline',
  provider VARCHAR(50),
  region VARCHAR(50),
  specs JSON,
  aapanel_url VARCHAR(500),
  aapanel_api_key VARCHAR(255),
  last_health_check TIMESTAMP NULL,
  health_status JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_servers_status (status),
  INDEX idx_servers_hostname (hostname)
);

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
  id VARCHAR(36) PRIMARY KEY,
  website_id VARCHAR(36) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('primary', 'alias', 'redirect') DEFAULT 'primary',
  dns_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
  ssl_status ENUM('pending', 'active', 'expired', 'failed') DEFAULT 'pending',
  ssl_certificate TEXT,
  ssl_private_key TEXT,
  ssl_expires_at TIMESTAMP NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domains_website (website_id),
  INDEX idx_domains_domain (domain),
  INDEX idx_domains_ssl_expires (ssl_expires_at)
);

-- Backups table
CREATE TABLE IF NOT EXISTS backups (
  id VARCHAR(36) PRIMARY KEY,
  website_id VARCHAR(36) NOT NULL,
  type ENUM('full', 'database', 'files', 'incremental') DEFAULT 'full',
  status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
  size_bytes BIGINT,
  storage_path VARCHAR(500),
  storage_provider VARCHAR(50),
  checksum VARCHAR(64),
  metadata JSON,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_backups_website (website_id),
  INDEX idx_backups_status (status),
  INDEX idx_backups_created (created_at)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(36),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_created (created_at)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSON,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (read_at),
  INDEX idx_notifications_created (created_at)
);

-- Queue jobs table
CREATE TABLE IF NOT EXISTS queue_jobs (
  id VARCHAR(36) PRIMARY KEY,
  queue VARCHAR(100) NOT NULL DEFAULT 'default',
  payload JSON NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  priority INT DEFAULT 0,
  available_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reserved_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_queue_status (queue, status, available_at),
  INDEX idx_queue_priority (priority, available_at)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value JSON,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_key (key_name)
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url VARCHAR(500),
  preview_url VARCHAR(500),
  category VARCHAR(100),
  tags JSON,
  config JSON,
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_templates_slug (slug),
  INDEX idx_templates_category (category),
  INDEX idx_templates_active (is_active)
);

-- Insert default plans
INSERT IGNORE INTO plans (id, name, slug, description, price_monthly, price_yearly, features, limits, sort_order) VALUES
('plan_starter', 'Starter', 'starter', 'Perfect for personal projects', 9.99, 99.00, 
 '["1 Website", "5GB Storage", "10GB Bandwidth", "SSL Certificate", "Email Support"]',
 '{"websites": 1, "storage_gb": 5, "bandwidth_gb": 10}', 1),
('plan_pro', 'Professional', 'pro', 'For growing businesses', 29.99, 299.00,
 '["5 Websites", "25GB Storage", "100GB Bandwidth", "SSL Certificate", "Priority Support", "Custom Domains"]',
 '{"websites": 5, "storage_gb": 25, "bandwidth_gb": 100}', 2),
('plan_business', 'Business', 'business', 'For large organizations', 99.99, 999.00,
 '["Unlimited Websites", "100GB Storage", "Unlimited Bandwidth", "SSL Certificate", "24/7 Support", "Custom Domains", "API Access"]',
 '{"websites": -1, "storage_gb": 100, "bandwidth_gb": -1}', 3);
`;

async function main() {
  console.log('Connecting to TiDB Cloud...');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('User:', config.user);
  console.log('Database:', config.database);
  
  if (!config.password) {
    console.error('ERROR: MYSQL_PASSWORD environment variable is not set');
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');

    // Split and execute each statement
    const statements = TABLES_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await connection.execute(stmt);
        console.log(`[${i + 1}/${statements.length}] OK`);
      } catch (err) {
        console.log(`[${i + 1}/${statements.length}] ${err.message}`);
      }
    }

    // Show created tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nTables in database:');
    tables.forEach((row, i) => {
      const tableName = Object.values(row)[0];
      console.log(`  ${i + 1}. ${tableName}`);
    });

    console.log('\nDatabase setup completed successfully!');
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
