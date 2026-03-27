-- OAuth Accounts Schema Migration
-- Run this on your MySQL database

CREATE TABLE IF NOT EXISTS oauth_accounts (
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
  KEY idx_user_id (user_id),
  KEY idx_provider_email (provider, provider_email),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for looking up accounts by provider email
CREATE INDEX IF NOT EXISTS idx_oauth_provider_email ON oauth_accounts(provider, provider_email);
