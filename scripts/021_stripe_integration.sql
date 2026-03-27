-- Stripe Integration Schema Migration
-- Run this on your MySQL database

-- Add stripe_customer_id to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE DEFAULT NULL;

-- Add stripe fields to billing plans
ALTER TABLE billing_plans
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_price_id_monthly VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly VARCHAR(255) DEFAULT NULL;

-- Create stripe_events table for idempotent webhook handling
CREATE TABLE IF NOT EXISTS stripe_events (
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
);

-- Create stripe_customers table for additional customer metadata
CREATE TABLE IF NOT EXISTS stripe_customers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
  default_payment_method_id VARCHAR(255) DEFAULT NULL,
  invoice_settings JSON DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_stripe_customer_id (stripe_customer_id)
);

-- Add stripe_subscription_id to user_subscriptions if not exists
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255) DEFAULT NULL;
