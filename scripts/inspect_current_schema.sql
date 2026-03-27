-- Inspect current database schema
-- Run: SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'ovmon_db';

-- Show all tables
SHOW TABLES;

-- Show structure of each table
DESCRIBE users;
DESCRIBE sessions;
DESCRIBE billing_plans;
DESCRIBE subscriptions;
