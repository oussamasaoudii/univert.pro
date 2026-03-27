-- File storage schema for Vercel Blob integration
-- This script adds avatar_url to users and creates uploaded_files tracking table

-- Add avatar_url column to users if not exists
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'avatar_url'
);

SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL',
  'SELECT "avatar_url column already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create uploaded_files table if not exists
CREATE TABLE IF NOT EXISTS uploaded_files (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  blob_url VARCHAR(500) NOT NULL,
  blob_pathname VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  purpose ENUM('avatar', 'website_asset', 'document', 'other') DEFAULT 'other',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_purpose (purpose),
  INDEX idx_blob_pathname (blob_pathname),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
