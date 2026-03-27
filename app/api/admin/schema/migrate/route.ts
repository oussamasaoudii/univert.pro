import { getMySQLPool, isMySQLConfigured } from '@/lib/mysql/pool';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Skip origin check for admin routes in development/preview
const isPreviewMode = () => {
  return process.env.NODE_ENV !== 'production' || 
         process.env.VERCEL_ENV === 'preview' ||
         process.env.VERCEL_URL?.includes('vusercontent.net');
};

// Safe CREATE TABLE IF NOT EXISTS statements
const SAFE_MIGRATIONS = [
  // ========== Core Authentication ==========
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    company_name VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    stripe_customer_id VARCHAR(255) UNIQUE DEFAULT NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sessions_token (token),
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_expires (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_password_reset_token (token)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS oauth_accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    provider ENUM('google', 'github') NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(254) DEFAULT NULL,
    access_token_hash VARCHAR(255) DEFAULT NULL,
    refresh_token_hash VARCHAR(255) DEFAULT NULL,
    token_expires_at DATETIME DEFAULT NULL,
    profile_data JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_provider_account (provider, provider_user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_provider_email (provider, provider_email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Billing ==========
  `CREATE TABLE IF NOT EXISTS billing_plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    stripe_product_id VARCHAR(255) DEFAULT NULL,
    stripe_price_id_monthly VARCHAR(255) DEFAULT NULL,
    stripe_price_id_yearly VARCHAR(255) DEFAULT NULL,
    features JSON,
    limits JSON,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plans_slug (slug),
    INDEX idx_plans_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(36) NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status ENUM('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'paused') DEFAULT 'active',
    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    current_period_start TIMESTAMP NULL,
    current_period_end TIMESTAMP NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP NULL,
    trial_start TIMESTAMP NULL,
    trial_end TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subscriptions_user (user_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_stripe (stripe_subscription_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS stripe_events (
    id VARCHAR(36) PRIMARY KEY,
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    payload JSON,
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_stripe_event_id (stripe_event_id),
    INDEX idx_event_type (event_type),
    INDEX idx_processed (processed)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Countries & Pricing ==========
  `CREATE TABLE IF NOT EXISTS countries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    iso_code CHAR(2) NOT NULL,
    slug VARCHAR(32) NOT NULL,
    name VARCHAR(120) NOT NULL,
    name_native VARCHAR(120) NULL,
    currency_code CHAR(3) NOT NULL,
    currency_symbol VARCHAR(8) NOT NULL DEFAULT '$',
    locale VARCHAR(16) NOT NULL DEFAULT 'en-US',
    text_direction ENUM('ltr', 'rtl') NOT NULL DEFAULT 'ltr',
    flag_emoji VARCHAR(8) NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    position INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_countries_iso_code (iso_code),
    UNIQUE KEY uk_countries_slug (slug),
    INDEX idx_countries_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS country_plan_prices (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    country_id BIGINT UNSIGNED NOT NULL,
    plan_id VARCHAR(36) NOT NULL,
    billing_period ENUM('monthly', 'yearly') NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    compare_price DECIMAL(12, 2) NULL,
    stripe_price_id VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_country_plan_price (country_id, plan_id, billing_period),
    INDEX idx_cpp_country (country_id),
    INDEX idx_cpp_plan (plan_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Templates & Websites ==========
  `CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    preview_url TEXT,
    thumbnail_url TEXT,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_templates_slug (slug),
    INDEX idx_templates_category (category)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS websites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    status ENUM('pending', 'provisioning', 'active', 'suspended', 'deleted') DEFAULT 'pending',
    ssl_status ENUM('pending', 'active', 'expired', 'failed') DEFAULT 'pending',
    ssl_expires_at TIMESTAMP NULL,
    settings JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_websites_user (user_id),
    INDEX idx_websites_subdomain (subdomain),
    INDEX idx_websites_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS domains (
    id VARCHAR(36) PRIMARY KEY,
    website_id VARCHAR(36) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT FALSE,
    dns_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
    ssl_status ENUM('pending', 'active', 'expired', 'failed') DEFAULT 'pending',
    ssl_certificate TEXT,
    ssl_private_key TEXT,
    ssl_expires_at TIMESTAMP NULL,
    dns_records JSON,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domains_website (website_id),
    INDEX idx_domains_domain (domain)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Support ==========
  `CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    website_id VARCHAR(36),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'waiting', 'resolved', 'closed') DEFAULT 'open',
    assigned_to VARCHAR(36),
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tickets_user (user_id),
    INDEX idx_tickets_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS ticket_messages (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ticket_messages_ticket (ticket_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Notifications ==========
  `CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (read_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== System Settings ==========
  `CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY,
    \`key\` VARCHAR(100) NOT NULL UNIQUE,
    value JSON NOT NULL,
    description TEXT,
    updated_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_settings_key (\`key\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Audit Logs ==========
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Rate Limits ==========
  `CREATE TABLE IF NOT EXISTS rate_limits (
    id VARCHAR(36) PRIMARY KEY,
    \`key\` VARCHAR(255) NOT NULL,
    hits INT NOT NULL DEFAULT 1,
    reset_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_rate_limit_key (\`key\`),
    INDEX idx_rate_limits_reset (reset_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Backups ==========
  `CREATE TABLE IF NOT EXISTS backups (
    id VARCHAR(36) PRIMARY KEY,
    website_id VARCHAR(36) NOT NULL,
    type ENUM('manual', 'automatic', 'pre_update') DEFAULT 'automatic',
    status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
    size_bytes BIGINT,
    storage_path TEXT,
    storage_provider VARCHAR(50),
    metadata JSON,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_backups_website (website_id),
    INDEX idx_backups_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Provisioning ==========
  `CREATE TABLE IF NOT EXISTS provisioning_jobs (
    id VARCHAR(36) PRIMARY KEY,
    website_id VARCHAR(36) NOT NULL,
    job_type ENUM('create', 'update', 'delete', 'ssl_renew', 'backup', 'restore') NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed', 'canceled') DEFAULT 'pending',
    progress INT DEFAULT 0,
    current_step VARCHAR(255),
    error_message TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_provisioning_website (website_id),
    INDEX idx_provisioning_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Servers ==========
  `CREATE TABLE IF NOT EXISTS servers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    provider VARCHAR(100),
    region VARCHAR(100),
    specs JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_servers_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ========== Provisioning Profiles ==========
  `CREATE TABLE IF NOT EXISTS provisioning_profiles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSON,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_profiles_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

// Seed data
const SEED_DATA = [
  // Default countries
  `INSERT IGNORE INTO countries (iso_code, slug, name, name_native, currency_code, currency_symbol, locale, text_direction, flag_emoji, is_default, is_active, position)
   VALUES
     ('US', 'usa', 'United States', 'United States', 'USD', '$', 'en-US', 'ltr', '🇺🇸', 1, 1, 1),
     ('MA', 'morocco', 'Morocco', 'المغرب', 'MAD', 'DH', 'ar-MA', 'rtl', '🇲🇦', 0, 1, 2),
     ('FR', 'france', 'France', 'France', 'EUR', '€', 'fr-FR', 'ltr', '🇫🇷', 0, 1, 3),
     ('SA', 'saudi-arabia', 'Saudi Arabia', 'السعودية', 'SAR', 'ر.س', 'ar-SA', 'rtl', '🇸🇦', 0, 1, 4)`,

  // Default billing plans
  `INSERT IGNORE INTO billing_plans (id, name, slug, description, price_monthly, price_yearly, features, limits, is_active, sort_order)
   VALUES 
     (UUID(), 'Free', 'free', 'Get started with basic features', 0, 0, 
      '["1 Website", "Basic Templates", "Community Support", "5GB Storage"]',
      '{"websites": 1, "storage_gb": 5, "bandwidth_gb": 10}', TRUE, 1),
     (UUID(), 'Pro', 'pro', 'For growing businesses', 29, 290, 
      '["5 Websites", "All Templates", "Priority Support", "50GB Storage"]',
      '{"websites": 5, "storage_gb": 50, "bandwidth_gb": 100}', TRUE, 2),
     (UUID(), 'Enterprise', 'enterprise', 'For large organizations', 99, 990, 
      '["Unlimited Websites", "All Templates", "24/7 Support", "500GB Storage"]',
      '{"websites": -1, "storage_gb": 500, "bandwidth_gb": -1}', TRUE, 3)`,
];

export async function GET() {
  if (!isMySQLConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const pool = getMySQLPool();
    
    // Get existing tables
    const [tables] = await pool.query<any[]>(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_DATABASE]
    );
    const existingTables = tables.map((t: any) => t.TABLE_NAME);

    // Parse required tables from migrations
    const requiredTables: string[] = [];
    for (const sql of SAFE_MIGRATIONS) {
      const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      if (match) requiredTables.push(match[1]);
    }

    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    return NextResponse.json({
      status: 'preview',
      database: process.env.DB_DATABASE,
      existingTables,
      requiredTables,
      missingTables,
      migrationsToRun: missingTables.length,
      message: missingTables.length > 0 
        ? `${missingTables.length} tables need to be created. POST to run migration.`
        : 'All required tables exist. No migration needed.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  if (!isMySQLConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const pool = getMySQLPool();
    const results: { table: string; status: string; error?: string }[] = [];

    // Run migrations
    for (const sql of SAFE_MIGRATIONS) {
      const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      const tableName = match ? match[1] : 'unknown';
      
      try {
        await pool.query(sql);
        results.push({ table: tableName, status: 'created_or_exists' });
      } catch (error: any) {
        results.push({ table: tableName, status: 'error', error: error.message });
      }
    }

    // Run seed data
    for (const sql of SEED_DATA) {
      try {
        await pool.query(sql);
      } catch (error: any) {
        // Ignore duplicate key errors for seed data
        if (!error.message.includes('Duplicate')) {
          console.error('Seed error:', error.message);
        }
      }
    }

    // Get final table list
    const [tables] = await pool.query<any[]>(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_DATABASE]
    );

    return NextResponse.json({
      status: 'completed',
      results,
      tablesCreated: results.filter(r => r.status === 'created_or_exists').length,
      errors: results.filter(r => r.status === 'error'),
      finalTableCount: tables.length,
      finalTables: tables.map((t: any) => t.TABLE_NAME),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
