-- Ovmon Database Schema for TiDB Cloud (MySQL compatible)
-- This script creates all necessary tables for the application

-- =====================================================
-- 1. Users and Authentication
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  company_name VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_token (token),
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_password_reset_token (token)
);

-- =====================================================
-- 2. Billing Plans and Subscriptions
-- =====================================================

CREATE TABLE IF NOT EXISTS billing_plans (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  features JSON,
  limits JSON,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plans_slug (slug),
  INDEX idx_plans_active (is_active)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  plan_id VARCHAR(36) NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status ENUM('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'paused') DEFAULT 'active',
  billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP NULL,
  trial_start TIMESTAMP NULL,
  trial_end TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES billing_plans(id),
  INDEX idx_subscriptions_user (user_id),
  INDEX idx_subscriptions_status (status),
  INDEX idx_subscriptions_stripe (stripe_subscription_id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36),
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('draft', 'open', 'paid', 'void', 'uncollectible') DEFAULT 'draft',
  invoice_url TEXT,
  pdf_url TEXT,
  paid_at TIMESTAMP NULL,
  due_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  INDEX idx_invoices_user (user_id),
  INDEX idx_invoices_status (status)
);

-- =====================================================
-- 3. Templates
-- =====================================================

CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
  INDEX idx_templates_category (category),
  INDEX idx_templates_active (is_active)
);

-- =====================================================
-- 4. Websites
-- =====================================================

CREATE TABLE IF NOT EXISTS websites (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
  INDEX idx_websites_user (user_id),
  INDEX idx_websites_subdomain (subdomain),
  INDEX idx_websites_status (status)
);

CREATE TABLE IF NOT EXISTS domains (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
  INDEX idx_domains_website (website_id),
  INDEX idx_domains_domain (domain)
);

-- =====================================================
-- 5. Provisioning and Jobs
-- =====================================================

CREATE TABLE IF NOT EXISTS provisioning_jobs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  website_id VARCHAR(36) NOT NULL,
  job_type ENUM('create', 'update', 'delete', 'ssl_renew', 'backup', 'restore') NOT NULL,
  status ENUM('pending', 'running', 'completed', 'failed', 'canceled') DEFAULT 'pending',
  progress INT DEFAULT 0,
  current_step VARCHAR(255),
  error_message TEXT,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
  INDEX idx_provisioning_website (website_id),
  INDEX idx_provisioning_status (status)
);

CREATE TABLE IF NOT EXISTS job_queue (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  job_type VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'retry') DEFAULT 'pending',
  priority INT DEFAULT 0,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  error_message TEXT,
  scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_job_queue_status (status),
  INDEX idx_job_queue_scheduled (scheduled_for),
  INDEX idx_job_queue_type (job_type)
);

-- =====================================================
-- 6. Support Tickets
-- =====================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL,
  INDEX idx_tickets_user (user_id),
  INDEX idx_tickets_status (status)
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ticket_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket_messages_ticket (ticket_id)
);

-- =====================================================
-- 7. Backups
-- =====================================================

CREATE TABLE IF NOT EXISTS backups (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
  INDEX idx_backups_website (website_id),
  INDEX idx_backups_status (status)
);

-- =====================================================
-- 8. Monitoring and Analytics
-- =====================================================

CREATE TABLE IF NOT EXISTS website_metrics (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  website_id VARCHAR(36) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(20,4) NOT NULL,
  unit VARCHAR(20),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
  INDEX idx_metrics_website (website_id),
  INDEX idx_metrics_type (metric_type),
  INDEX idx_metrics_recorded (recorded_at)
);

CREATE TABLE IF NOT EXISTS health_checks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  website_id VARCHAR(36) NOT NULL,
  status ENUM('healthy', 'degraded', 'down') NOT NULL,
  response_time_ms INT,
  http_status_code INT,
  error_message TEXT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
  INDEX idx_health_website (website_id),
  INDEX idx_health_status (status),
  INDEX idx_health_checked (checked_at)
);

-- =====================================================
-- 9. Notifications
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSON,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (read_at)
);

-- =====================================================
-- 10. Audit Log
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_created (created_at)
);

-- =====================================================
-- 11. Settings
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value JSON NOT NULL,
  description TEXT,
  updated_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_key (`key`)
);

-- =====================================================
-- Insert Default Data
-- =====================================================

-- Default billing plans
INSERT IGNORE INTO billing_plans (id, name, slug, description, price_monthly, price_yearly, features, limits, is_active, sort_order)
VALUES 
  (UUID(), 'Free', 'free', 'Get started with basic features', 0, 0, 
   '["1 Website", "Basic Templates", "Community Support", "5GB Storage"]',
   '{"websites": 1, "storage_gb": 5, "bandwidth_gb": 10}',
   TRUE, 1),
  (UUID(), 'Pro', 'pro', 'For growing businesses', 29, 290, 
   '["5 Websites", "All Templates", "Priority Support", "50GB Storage", "Custom Domains", "SSL Certificates"]',
   '{"websites": 5, "storage_gb": 50, "bandwidth_gb": 100}',
   TRUE, 2),
  (UUID(), 'Enterprise', 'enterprise', 'For large organizations', 99, 990, 
   '["Unlimited Websites", "All Templates", "24/7 Support", "500GB Storage", "Custom Domains", "SSL Certificates", "API Access", "White Label"]',
   '{"websites": -1, "storage_gb": 500, "bandwidth_gb": -1}',
   TRUE, 3);

-- Default admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT IGNORE INTO users (id, email, password_hash, full_name, role, email_verified)
VALUES (
  UUID(),
  'admin@ovmon.com',
  '$2b$10$rQZ7.5Z5Z5Z5Z5Z5Z5Z5ZuQZ7.5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
  'Admin User',
  'admin',
  TRUE
);

-- Done
SELECT 'Schema created successfully!' AS status;
