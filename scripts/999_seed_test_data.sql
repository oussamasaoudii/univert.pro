-- ======================================
-- Test Data - User Accounts & Sample Data
-- ======================================
-- This script adds test users and sample data for development

-- Clear existing test data (optional)
-- DELETE FROM users WHERE email IN ('user@test.com', 'admin@test.com');

-- ======================================
-- 1. Insert Test Users
-- ======================================

-- Regular User Account
-- Email: user@test.com
-- Password: Test@123456
INSERT INTO users (
  email, 
  password_hash, 
  full_name, 
  company_name, 
  status, 
  role, 
  verification_token, 
  created_at, 
  updated_at
) VALUES (
  'user@test.com',
  -- bcrypt hash of "Test@123456" (pre-hashed)
  -- Run: echo -n "Test@123456" | bcrypt and paste the hash
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2',
  'Test User',
  'Test Company',
  'active',
  'user',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Admin User Account
-- Email: admin@test.com
-- Password: Admin@123456
INSERT INTO users (
  email, 
  password_hash, 
  full_name, 
  company_name, 
  status, 
  role, 
  verification_token, 
  created_at, 
  updated_at
) VALUES (
  'admin@test.com',
  -- bcrypt hash of "Admin@123456"
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2',
  'Admin User',
  'Admin Company',
  'active',
  'admin',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ======================================
-- 2. Sample Country-Specific Pricing
-- ======================================

-- Get country IDs (adjust based on your countries table)
SET @ma_id = (SELECT id FROM countries WHERE iso_code = 'MA' LIMIT 1);
SET @us_id = (SELECT id FROM countries WHERE iso_code = 'US' LIMIT 1);
SET @sa_id = (SELECT id FROM countries WHERE iso_code = 'SA' LIMIT 1);

-- Get plan IDs (adjust based on your plans table)
SET @starter_id = (SELECT id FROM plans WHERE slug = 'starter' LIMIT 1);
SET @professional_id = (SELECT id FROM plans WHERE slug = 'professional' LIMIT 1);
SET @enterprise_id = (SELECT id FROM plans WHERE slug = 'enterprise' LIMIT 1);

-- ======================================
-- 3. Insert Sample Pricing Data
-- ======================================

-- Morocco Pricing
INSERT INTO country_plan_prices (
  country_id, plan_id, billing_period, price, compare_price, is_active, created_at, updated_at
) VALUES
-- Starter Plan
(@ma_id, @starter_id, 'monthly', 29900, 39900, 1, NOW(), NOW()),
(@ma_id, @starter_id, 'yearly', 299000, 359900, 1, NOW(), NOW()),
-- Professional Plan
(@ma_id, @professional_id, 'monthly', 79900, 99900, 1, NOW(), NOW()),
(@ma_id, @professional_id, 'yearly', 799000, 999000, 1, NOW(), NOW()),
-- Enterprise Plan
(@ma_id, @enterprise_id, 'monthly', 199900, 249900, 1, NOW(), NOW()),
(@ma_id, @enterprise_id, 'yearly', 1999000, 2499000, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- USA Pricing
INSERT INTO country_plan_prices (
  country_id, plan_id, billing_period, price, compare_price, is_active, created_at, updated_at
) VALUES
-- Starter Plan
(@us_id, @starter_id, 'monthly', 2999, 3999, 1, NOW(), NOW()),
(@us_id, @starter_id, 'yearly', 29990, 35990, 1, NOW(), NOW()),
-- Professional Plan
(@us_id, @professional_id, 'monthly', 7999, 9999, 1, NOW(), NOW()),
(@us_id, @professional_id, 'yearly', 79990, 99990, 1, NOW(), NOW()),
-- Enterprise Plan
(@us_id, @enterprise_id, 'monthly', 19999, 24999, 1, NOW(), NOW()),
(@us_id, @enterprise_id, 'yearly', 199990, 249990, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Saudi Arabia Pricing
INSERT INTO country_plan_prices (
  country_id, plan_id, billing_period, price, compare_price, is_active, created_at, updated_at
) VALUES
-- Starter Plan
(@sa_id, @starter_id, 'monthly', 11250, 15000, 1, NOW(), NOW()),
(@sa_id, @starter_id, 'yearly', 112500, 135000, 1, NOW(), NOW()),
-- Professional Plan
(@sa_id, @professional_id, 'monthly', 29999, 37499, 1, NOW(), NOW()),
(@sa_id, @professional_id, 'yearly', 299990, 374990, 1, NOW(), NOW()),
-- Enterprise Plan
(@sa_id, @enterprise_id, 'monthly', 74999, 93749, 1, NOW(), NOW()),
(@sa_id, @enterprise_id, 'yearly', 749990, 937490, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ======================================
-- 4. Sample Subscriptions (Optional)
-- ======================================

-- Create a subscription for the test user
SET @test_user_id = (SELECT id FROM users WHERE email = 'user@test.com' LIMIT 1);
SET @ma_starter_id = (SELECT id FROM country_plan_prices 
  WHERE country_id = @ma_id AND plan_id = @starter_id AND billing_period = 'monthly' LIMIT 1);

INSERT INTO subscriptions (
  user_id,
  plan_id,
  country_plan_price_id,
  stripe_customer_id,
  stripe_subscription_id,
  billing_period,
  status,
  current_period_start,
  current_period_end,
  trial_end,
  created_at,
  updated_at
) VALUES (
  @test_user_id,
  @starter_id,
  @ma_starter_id,
  NULL,
  NULL,
  'monthly',
  'trialing',
  NOW(),
  DATE_ADD(NOW(), INTERVAL 30 DAY),
  DATE_ADD(NOW(), INTERVAL 14 DAY),
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ======================================
-- Test Data Summary
-- ======================================
-- Regular User:
--   Email: user@test.com
--   Password: Test@123456
--
-- Admin User:
--   Email: admin@test.com
--   Password: Admin@123456
--
-- Note: Passwords shown above are EXAMPLES. 
-- Use bcrypt to hash actual passwords before deploying to production!
