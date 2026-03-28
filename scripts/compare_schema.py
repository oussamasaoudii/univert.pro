#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["mysql-connector-python"]
# ///
"""
Compare live MySQL database schema against expected codebase schema.
This script is read-only and will NOT modify any data.
"""

import mysql.connector as pymysql
import json

# Database connection config (hardcoded for this inspection only)
DB_CONFIG = {
    'host': '72.60.90.147',
    'port': 3306,
    'user': 'univert_v0_temp',
    'password': 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b',
    'database': 'ovmon_db',
    'charset': 'utf8mb4'
}

# Expected schema based on codebase analysis
EXPECTED_TABLES = {
    'users': {
        'columns': ['id', 'email', 'password_hash', 'role', 'status', 'mfa_enabled', 'mfa_secret', 'created_at', 'updated_at', 'last_login', 'email_verified', 'verification_token', 'verification_token_expires'],
        'indexes': ['PRIMARY', 'idx_users_email', 'idx_users_role', 'idx_users_status']
    },
    'user_sessions': {
        'columns': ['id', 'user_id', 'token', 'expires_at', 'created_at', 'ip_address', 'user_agent', 'mfa_verified'],
        'indexes': ['PRIMARY', 'idx_sessions_token', 'idx_sessions_user_id', 'idx_sessions_expires']
    },
    'password_reset_tokens': {
        'columns': ['id', 'user_id', 'token', 'expires_at', 'created_at', 'used'],
        'indexes': ['PRIMARY', 'idx_password_reset_token', 'idx_password_reset_user_id']
    },
    'admin_mfa_recovery_codes': {
        'columns': ['id', 'user_id', 'code_hash', 'used', 'created_at', 'used_at'],
        'indexes': ['PRIMARY', 'idx_mfa_recovery_user_id']
    },
    'auth_rate_limits': {
        'columns': ['id', 'identifier', 'action', 'attempts', 'first_attempt_at', 'blocked_until', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_rate_limits_identifier_action', 'idx_rate_limits_blocked_until']
    },
    'platform_settings': {
        'columns': ['id', 'setting_key', 'setting_value', 'setting_type', 'description', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_settings_key']
    },
    'templates': {
        'columns': ['id', 'name', 'slug', 'description', 'thumbnail_url', 'preview_url', 'category', 'is_active', 'is_default', 'config', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_templates_slug', 'idx_templates_category', 'idx_templates_is_active']
    },
    'template_features': {
        'columns': ['id', 'template_id', 'feature_name', 'feature_value', 'display_order', 'created_at'],
        'indexes': ['PRIMARY', 'idx_template_features_template_id']
    },
    'sites': {
        'columns': ['id', 'user_id', 'template_id', 'name', 'slug', 'status', 'domain', 'custom_domain', 'ssl_status', 'config', 'created_at', 'updated_at', 'published_at', 'expires_at'],
        'indexes': ['PRIMARY', 'idx_sites_user_id', 'idx_sites_slug', 'idx_sites_status', 'idx_sites_domain']
    },
    'site_content': {
        'columns': ['id', 'site_id', 'content_type', 'content_key', 'content_value', 'locale', 'version', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_site_content_site_id', 'idx_site_content_type_key']
    },
    'site_pages': {
        'columns': ['id', 'site_id', 'title', 'slug', 'content', 'meta_title', 'meta_description', 'is_published', 'display_order', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_site_pages_site_id', 'idx_site_pages_slug']
    },
    'site_media': {
        'columns': ['id', 'site_id', 'filename', 'original_filename', 'mime_type', 'size', 'url', 's3_key', 'alt_text', 'created_at'],
        'indexes': ['PRIMARY', 'idx_site_media_site_id']
    },
    'domains': {
        'columns': ['id', 'site_id', 'domain', 'is_primary', 'dns_status', 'ssl_status', 'dns_records', 'verified_at', 'ssl_expires_at', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_domains_site_id', 'idx_domains_domain', 'idx_domains_dns_status']
    },
    'domain_logs': {
        'columns': ['id', 'domain_id', 'action', 'status', 'message', 'metadata', 'created_at'],
        'indexes': ['PRIMARY', 'idx_domain_logs_domain_id']
    },
    'dns_verifications': {
        'columns': ['id', 'domain_id', 'record_type', 'record_name', 'record_value', 'is_verified', 'last_checked_at', 'created_at'],
        'indexes': ['PRIMARY', 'idx_dns_verifications_domain_id']
    },
    'ssl_certificates': {
        'columns': ['id', 'domain_id', 'certificate', 'private_key', 'chain', 'issuer', 'issued_at', 'expires_at', 'is_active', 'created_at'],
        'indexes': ['PRIMARY', 'idx_ssl_certificates_domain_id', 'idx_ssl_certificates_expires']
    },
    'provisioning_jobs': {
        'columns': ['id', 'site_id', 'job_type', 'status', 'progress', 'message', 'metadata', 'started_at', 'completed_at', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_provisioning_jobs_site_id', 'idx_provisioning_jobs_status']
    },
    'provisioning_job_logs': {
        'columns': ['id', 'job_id', 'level', 'message', 'metadata', 'created_at'],
        'indexes': ['PRIMARY', 'idx_provisioning_job_logs_job_id']
    },
    'job_queue': {
        'columns': ['id', 'job_type', 'payload', 'status', 'priority', 'attempts', 'max_attempts', 'scheduled_at', 'started_at', 'completed_at', 'failed_at', 'error_message', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_job_queue_status', 'idx_job_queue_scheduled', 'idx_job_queue_type_status']
    },
    'dead_letter_queue': {
        'columns': ['id', 'original_job_id', 'job_type', 'payload', 'error_message', 'failed_at', 'created_at'],
        'indexes': ['PRIMARY', 'idx_dead_letter_queue_job_type']
    },
    'worker_heartbeats': {
        'columns': ['id', 'worker_id', 'worker_type', 'status', 'last_heartbeat', 'metadata', 'created_at'],
        'indexes': ['PRIMARY', 'idx_worker_heartbeats_worker_id', 'idx_worker_heartbeats_type']
    },
    'backups': {
        'columns': ['id', 'site_id', 'backup_type', 'status', 'size', 's3_key', 'metadata', 'created_at', 'completed_at', 'expires_at'],
        'indexes': ['PRIMARY', 'idx_backups_site_id', 'idx_backups_status', 'idx_backups_expires']
    },
    'backup_logs': {
        'columns': ['id', 'backup_id', 'level', 'message', 'metadata', 'created_at'],
        'indexes': ['PRIMARY', 'idx_backup_logs_backup_id']
    },
    'backup_retention_policies': {
        'columns': ['id', 'site_id', 'policy_type', 'retention_days', 'max_backups', 'is_active', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_backup_retention_site_id']
    },
    'restores': {
        'columns': ['id', 'site_id', 'backup_id', 'status', 'message', 'metadata', 'started_at', 'completed_at', 'created_at'],
        'indexes': ['PRIMARY', 'idx_restores_site_id', 'idx_restores_backup_id']
    },
    'restore_logs': {
        'columns': ['id', 'restore_id', 'level', 'message', 'metadata', 'created_at'],
        'indexes': ['PRIMARY', 'idx_restore_logs_restore_id']
    },
    'exports': {
        'columns': ['id', 'site_id', 'export_type', 'status', 'format', 's3_key', 'download_url', 'expires_at', 'metadata', 'created_at', 'completed_at'],
        'indexes': ['PRIMARY', 'idx_exports_site_id', 'idx_exports_status']
    },
    'health_checks': {
        'columns': ['id', 'site_id', 'check_type', 'status', 'response_time', 'status_code', 'message', 'metadata', 'created_at'],
        'indexes': ['PRIMARY', 'idx_health_checks_site_id', 'idx_health_checks_type', 'idx_health_checks_status']
    },
    'website_health_summary': {
        'columns': ['id', 'site_id', 'overall_status', 'uptime_percentage', 'avg_response_time', 'last_check_at', 'issues_count', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_health_summary_site_id']
    },
    'incidents': {
        'columns': ['id', 'site_id', 'incident_type', 'severity', 'status', 'title', 'description', 'started_at', 'resolved_at', 'metadata', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_incidents_site_id', 'idx_incidents_status', 'idx_incidents_severity']
    },
    'alerts': {
        'columns': ['id', 'site_id', 'alert_type', 'severity', 'status', 'title', 'message', 'acknowledged_at', 'acknowledged_by', 'metadata', 'created_at'],
        'indexes': ['PRIMARY', 'idx_alerts_site_id', 'idx_alerts_status', 'idx_alerts_severity']
    },
    'server_health': {
        'columns': ['id', 'server_id', 'server_name', 'cpu_usage', 'memory_usage', 'disk_usage', 'network_in', 'network_out', 'status', 'metadata', 'created_at'],
        'indexes': ['PRIMARY', 'idx_server_health_server_id', 'idx_server_health_status']
    },
    'audit_logs': {
        'columns': ['id', 'user_id', 'action', 'resource_type', 'resource_id', 'old_values', 'new_values', 'ip_address', 'user_agent', 'created_at'],
        'indexes': ['PRIMARY', 'idx_audit_logs_user_id', 'idx_audit_logs_resource', 'idx_audit_logs_action']
    },
    'notifications': {
        'columns': ['id', 'user_id', 'type', 'title', 'message', 'data', 'read_at', 'created_at'],
        'indexes': ['PRIMARY', 'idx_notifications_user_id', 'idx_notifications_read']
    },
    'api_keys': {
        'columns': ['id', 'user_id', 'name', 'key_hash', 'key_prefix', 'scopes', 'last_used_at', 'expires_at', 'is_active', 'created_at'],
        'indexes': ['PRIMARY', 'idx_api_keys_user_id', 'idx_api_keys_prefix']
    },
    'webhooks': {
        'columns': ['id', 'user_id', 'name', 'url', 'secret', 'events', 'is_active', 'last_triggered_at', 'failure_count', 'created_at', 'updated_at'],
        'indexes': ['PRIMARY', 'idx_webhooks_user_id', 'idx_webhooks_is_active']
    },
    'webhook_logs': {
        'columns': ['id', 'webhook_id', 'event', 'payload', 'response_status', 'response_body', 'duration_ms', 'created_at'],
        'indexes': ['PRIMARY', 'idx_webhook_logs_webhook_id']
    }
}

def get_live_schema(cursor):
    """Get the current database schema"""
    # Get all tables
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]
    
    schema = {}
    for table in tables:
        # Get columns
        cursor.execute(f"SHOW COLUMNS FROM `{table}`")
        columns = [row[0] for row in cursor.fetchall()]
        
        # Get indexes
        cursor.execute(f"SHOW INDEX FROM `{table}`")
        indexes = list(set([row[2] for row in cursor.fetchall()]))
        
        schema[table] = {
            'columns': columns,
            'indexes': indexes
        }
    
    return schema

def compare_schemas(live_schema, expected_schema):
    """Compare live schema against expected schema"""
    missing_tables = []
    missing_columns = {}
    missing_indexes = {}
    
    for table_name, expected in expected_schema.items():
        if table_name not in live_schema:
            missing_tables.append(table_name)
        else:
            live = live_schema[table_name]
            
            # Check columns
            missing_cols = [col for col in expected['columns'] if col not in live['columns']]
            if missing_cols:
                missing_columns[table_name] = missing_cols
            
            # Check indexes
            missing_idx = [idx for idx in expected['indexes'] if idx not in live['indexes']]
            if missing_idx:
                missing_indexes[table_name] = missing_idx
    
    return missing_tables, missing_columns, missing_indexes

def generate_migration_sql(missing_tables, missing_columns, missing_indexes):
    """Generate safe, non-destructive migration SQL"""
    sql_statements = []
    
    # Table definitions for missing tables
    table_definitions = {
        'users': '''
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'suspended', 'pending') NOT NULL DEFAULT 'pending',
  `mfa_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `mfa_secret` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL,
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `verification_token` VARCHAR(255) NULL,
  `verification_token_expires` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'user_sessions': '''
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `mfa_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sessions_token` (`token`),
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'password_reset_tokens': '''
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_password_reset_token` (`token`),
  KEY `idx_password_reset_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'admin_mfa_recovery_codes': '''
CREATE TABLE IF NOT EXISTS `admin_mfa_recovery_codes` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `code_hash` VARCHAR(255) NOT NULL,
  `used` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mfa_recovery_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'auth_rate_limits': '''
CREATE TABLE IF NOT EXISTS `auth_rate_limits` (
  `id` VARCHAR(36) NOT NULL,
  `identifier` VARCHAR(255) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `first_attempt_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `blocked_until` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_rate_limits_identifier_action` (`identifier`, `action`),
  KEY `idx_rate_limits_blocked_until` (`blocked_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'platform_settings': '''
CREATE TABLE IF NOT EXISTS `platform_settings` (
  `id` VARCHAR(36) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NULL,
  `setting_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'templates': '''
CREATE TABLE IF NOT EXISTS `templates` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `thumbnail_url` VARCHAR(500) NULL,
  `preview_url` VARCHAR(500) NULL,
  `category` VARCHAR(100) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `config` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_templates_slug` (`slug`),
  KEY `idx_templates_category` (`category`),
  KEY `idx_templates_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'template_features': '''
CREATE TABLE IF NOT EXISTS `template_features` (
  `id` VARCHAR(36) NOT NULL,
  `template_id` VARCHAR(36) NOT NULL,
  `feature_name` VARCHAR(255) NOT NULL,
  `feature_value` TEXT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_template_features_template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'sites': '''
CREATE TABLE IF NOT EXISTS `sites` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `template_id` VARCHAR(36) NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `status` ENUM('draft', 'active', 'suspended', 'archived') NOT NULL DEFAULT 'draft',
  `domain` VARCHAR(255) NULL,
  `custom_domain` VARCHAR(255) NULL,
  `ssl_status` ENUM('none', 'pending', 'active', 'expired', 'failed') NOT NULL DEFAULT 'none',
  `config` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` TIMESTAMP NULL,
  `expires_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sites_user_id` (`user_id`),
  UNIQUE KEY `idx_sites_slug` (`slug`),
  KEY `idx_sites_status` (`status`),
  KEY `idx_sites_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'site_content': '''
CREATE TABLE IF NOT EXISTS `site_content` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `content_type` VARCHAR(100) NOT NULL,
  `content_key` VARCHAR(255) NOT NULL,
  `content_value` LONGTEXT NULL,
  `locale` VARCHAR(10) NOT NULL DEFAULT 'en',
  `version` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site_content_site_id` (`site_id`),
  KEY `idx_site_content_type_key` (`content_type`, `content_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'site_pages': '''
CREATE TABLE IF NOT EXISTS `site_pages` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NULL,
  `meta_title` VARCHAR(255) NULL,
  `meta_description` TEXT NULL,
  `is_published` BOOLEAN NOT NULL DEFAULT FALSE,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site_pages_site_id` (`site_id`),
  UNIQUE KEY `idx_site_pages_slug` (`site_id`, `slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'site_media': '''
CREATE TABLE IF NOT EXISTS `site_media` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `size` BIGINT NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `s3_key` VARCHAR(500) NULL,
  `alt_text` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site_media_site_id` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'domains': '''
CREATE TABLE IF NOT EXISTS `domains` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `domain` VARCHAR(255) NOT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
  `dns_status` ENUM('pending', 'verified', 'failed') NOT NULL DEFAULT 'pending',
  `ssl_status` ENUM('none', 'pending', 'active', 'expired', 'failed') NOT NULL DEFAULT 'none',
  `dns_records` JSON NULL,
  `verified_at` TIMESTAMP NULL,
  `ssl_expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_domains_site_id` (`site_id`),
  UNIQUE KEY `idx_domains_domain` (`domain`),
  KEY `idx_domains_dns_status` (`dns_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'domain_logs': '''
CREATE TABLE IF NOT EXISTS `domain_logs` (
  `id` VARCHAR(36) NOT NULL,
  `domain_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `message` TEXT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_domain_logs_domain_id` (`domain_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'dns_verifications': '''
CREATE TABLE IF NOT EXISTS `dns_verifications` (
  `id` VARCHAR(36) NOT NULL,
  `domain_id` VARCHAR(36) NOT NULL,
  `record_type` VARCHAR(20) NOT NULL,
  `record_name` VARCHAR(255) NOT NULL,
  `record_value` TEXT NOT NULL,
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `last_checked_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dns_verifications_domain_id` (`domain_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'ssl_certificates': '''
CREATE TABLE IF NOT EXISTS `ssl_certificates` (
  `id` VARCHAR(36) NOT NULL,
  `domain_id` VARCHAR(36) NOT NULL,
  `certificate` TEXT NOT NULL,
  `private_key` TEXT NOT NULL,
  `chain` TEXT NULL,
  `issuer` VARCHAR(255) NULL,
  `issued_at` TIMESTAMP NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ssl_certificates_domain_id` (`domain_id`),
  KEY `idx_ssl_certificates_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'provisioning_jobs': '''
CREATE TABLE IF NOT EXISTS `provisioning_jobs` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `job_type` VARCHAR(100) NOT NULL,
  `status` ENUM('pending', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `progress` INT NOT NULL DEFAULT 0,
  `message` TEXT NULL,
  `metadata` JSON NULL,
  `started_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_provisioning_jobs_site_id` (`site_id`),
  KEY `idx_provisioning_jobs_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'provisioning_job_logs': '''
CREATE TABLE IF NOT EXISTS `provisioning_job_logs` (
  `id` VARCHAR(36) NOT NULL,
  `job_id` VARCHAR(36) NOT NULL,
  `level` ENUM('info', 'warning', 'error', 'debug') NOT NULL DEFAULT 'info',
  `message` TEXT NOT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_provisioning_job_logs_job_id` (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'job_queue': '''
CREATE TABLE IF NOT EXISTS `job_queue` (
  `id` VARCHAR(36) NOT NULL,
  `job_type` VARCHAR(100) NOT NULL,
  `payload` JSON NOT NULL,
  `status` ENUM('pending', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `priority` INT NOT NULL DEFAULT 0,
  `attempts` INT NOT NULL DEFAULT 0,
  `max_attempts` INT NOT NULL DEFAULT 3,
  `scheduled_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `failed_at` TIMESTAMP NULL,
  `error_message` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_queue_status` (`status`),
  KEY `idx_job_queue_scheduled` (`scheduled_at`),
  KEY `idx_job_queue_type_status` (`job_type`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'dead_letter_queue': '''
CREATE TABLE IF NOT EXISTS `dead_letter_queue` (
  `id` VARCHAR(36) NOT NULL,
  `original_job_id` VARCHAR(36) NOT NULL,
  `job_type` VARCHAR(100) NOT NULL,
  `payload` JSON NOT NULL,
  `error_message` TEXT NULL,
  `failed_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dead_letter_queue_job_type` (`job_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'worker_heartbeats': '''
CREATE TABLE IF NOT EXISTS `worker_heartbeats` (
  `id` VARCHAR(36) NOT NULL,
  `worker_id` VARCHAR(100) NOT NULL,
  `worker_type` VARCHAR(100) NOT NULL,
  `status` ENUM('active', 'idle', 'offline') NOT NULL DEFAULT 'active',
  `last_heartbeat` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_worker_heartbeats_worker_id` (`worker_id`),
  KEY `idx_worker_heartbeats_type` (`worker_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'backups': '''
CREATE TABLE IF NOT EXISTS `backups` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `backup_type` ENUM('manual', 'scheduled', 'pre_update') NOT NULL DEFAULT 'manual',
  `status` ENUM('pending', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `size` BIGINT NULL,
  `s3_key` VARCHAR(500) NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  `expires_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `idx_backups_site_id` (`site_id`),
  KEY `idx_backups_status` (`status`),
  KEY `idx_backups_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'backup_logs': '''
CREATE TABLE IF NOT EXISTS `backup_logs` (
  `id` VARCHAR(36) NOT NULL,
  `backup_id` VARCHAR(36) NOT NULL,
  `level` ENUM('info', 'warning', 'error', 'debug') NOT NULL DEFAULT 'info',
  `message` TEXT NOT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_backup_logs_backup_id` (`backup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'backup_retention_policies': '''
CREATE TABLE IF NOT EXISTS `backup_retention_policies` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NULL,
  `policy_type` ENUM('global', 'site') NOT NULL DEFAULT 'global',
  `retention_days` INT NOT NULL DEFAULT 30,
  `max_backups` INT NOT NULL DEFAULT 10,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_backup_retention_site_id` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'restores': '''
CREATE TABLE IF NOT EXISTS `restores` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `backup_id` VARCHAR(36) NOT NULL,
  `status` ENUM('pending', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `message` TEXT NULL,
  `metadata` JSON NULL,
  `started_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_restores_site_id` (`site_id`),
  KEY `idx_restores_backup_id` (`backup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'restore_logs': '''
CREATE TABLE IF NOT EXISTS `restore_logs` (
  `id` VARCHAR(36) NOT NULL,
  `restore_id` VARCHAR(36) NOT NULL,
  `level` ENUM('info', 'warning', 'error', 'debug') NOT NULL DEFAULT 'info',
  `message` TEXT NOT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_restore_logs_restore_id` (`restore_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'exports': '''
CREATE TABLE IF NOT EXISTS `exports` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `export_type` VARCHAR(100) NOT NULL,
  `status` ENUM('pending', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `format` VARCHAR(50) NOT NULL DEFAULT 'zip',
  `s3_key` VARCHAR(500) NULL,
  `download_url` VARCHAR(500) NULL,
  `expires_at` TIMESTAMP NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `idx_exports_site_id` (`site_id`),
  KEY `idx_exports_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'health_checks': '''
CREATE TABLE IF NOT EXISTS `health_checks` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `check_type` VARCHAR(100) NOT NULL,
  `status` ENUM('healthy', 'degraded', 'unhealthy', 'unknown') NOT NULL DEFAULT 'unknown',
  `response_time` INT NULL,
  `status_code` INT NULL,
  `message` TEXT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_health_checks_site_id` (`site_id`),
  KEY `idx_health_checks_type` (`check_type`),
  KEY `idx_health_checks_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'website_health_summary': '''
CREATE TABLE IF NOT EXISTS `website_health_summary` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `overall_status` ENUM('healthy', 'degraded', 'unhealthy', 'unknown') NOT NULL DEFAULT 'unknown',
  `uptime_percentage` DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  `avg_response_time` INT NULL,
  `last_check_at` TIMESTAMP NULL,
  `issues_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_health_summary_site_id` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'incidents': '''
CREATE TABLE IF NOT EXISTS `incidents` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `incident_type` VARCHAR(100) NOT NULL,
  `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  `status` ENUM('open', 'investigating', 'identified', 'monitoring', 'resolved') NOT NULL DEFAULT 'open',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_incidents_site_id` (`site_id`),
  KEY `idx_incidents_status` (`status`),
  KEY `idx_incidents_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'alerts': '''
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` VARCHAR(36) NOT NULL,
  `site_id` VARCHAR(36) NOT NULL,
  `alert_type` VARCHAR(100) NOT NULL,
  `severity` ENUM('info', 'warning', 'error', 'critical') NOT NULL DEFAULT 'info',
  `status` ENUM('active', 'acknowledged', 'resolved', 'dismissed') NOT NULL DEFAULT 'active',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NULL,
  `acknowledged_at` TIMESTAMP NULL,
  `acknowledged_by` VARCHAR(36) NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_alerts_site_id` (`site_id`),
  KEY `idx_alerts_status` (`status`),
  KEY `idx_alerts_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'server_health': '''
CREATE TABLE IF NOT EXISTS `server_health` (
  `id` VARCHAR(36) NOT NULL,
  `server_id` VARCHAR(100) NOT NULL,
  `server_name` VARCHAR(255) NOT NULL,
  `cpu_usage` DECIMAL(5,2) NULL,
  `memory_usage` DECIMAL(5,2) NULL,
  `disk_usage` DECIMAL(5,2) NULL,
  `network_in` BIGINT NULL,
  `network_out` BIGINT NULL,
  `status` ENUM('healthy', 'degraded', 'unhealthy', 'offline') NOT NULL DEFAULT 'healthy',
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_server_health_server_id` (`server_id`),
  KEY `idx_server_health_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'audit_logs': '''
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource_type` VARCHAR(100) NOT NULL,
  `resource_id` VARCHAR(36) NULL,
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user_id` (`user_id`),
  KEY `idx_audit_logs_resource` (`resource_type`, `resource_id`),
  KEY `idx_audit_logs_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'notifications': '''
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NULL,
  `data` JSON NULL,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_read` (`read_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'api_keys': '''
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `key_hash` VARCHAR(255) NOT NULL,
  `key_prefix` VARCHAR(20) NOT NULL,
  `scopes` JSON NULL,
  `last_used_at` TIMESTAMP NULL,
  `expires_at` TIMESTAMP NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_api_keys_user_id` (`user_id`),
  KEY `idx_api_keys_prefix` (`key_prefix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'webhooks': '''
CREATE TABLE IF NOT EXISTS `webhooks` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `secret` VARCHAR(255) NOT NULL,
  `events` JSON NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_triggered_at` TIMESTAMP NULL,
  `failure_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_webhooks_user_id` (`user_id`),
  KEY `idx_webhooks_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''',

        'webhook_logs': '''
CREATE TABLE IF NOT EXISTS `webhook_logs` (
  `id` VARCHAR(36) NOT NULL,
  `webhook_id` VARCHAR(36) NOT NULL,
  `event` VARCHAR(100) NOT NULL,
  `payload` JSON NOT NULL,
  `response_status` INT NULL,
  `response_body` TEXT NULL,
  `duration_ms` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_webhook_logs_webhook_id` (`webhook_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'''
    }
    
    # Generate CREATE TABLE statements for missing tables
    for table in missing_tables:
        if table in table_definitions:
            sql_statements.append(f"-- Create missing table: {table}")
            sql_statements.append(table_definitions[table])
            sql_statements.append("")
    
    # Generate ALTER TABLE statements for missing columns
    column_types = {
        'mfa_verified': 'BOOLEAN NOT NULL DEFAULT FALSE',
        'email_verified': 'BOOLEAN NOT NULL DEFAULT FALSE',
        'verification_token': 'VARCHAR(255) NULL',
        'verification_token_expires': 'TIMESTAMP NULL',
        'locale': "VARCHAR(10) NOT NULL DEFAULT 'en'",
        'version': 'INT NOT NULL DEFAULT 1',
        'published_at': 'TIMESTAMP NULL',
        'expires_at': 'TIMESTAMP NULL',
        'ssl_expires_at': 'TIMESTAMP NULL',
        'is_primary': 'BOOLEAN NOT NULL DEFAULT FALSE',
        'is_default': 'BOOLEAN NOT NULL DEFAULT FALSE',
        'is_active': 'BOOLEAN NOT NULL DEFAULT TRUE',
        'display_order': 'INT NOT NULL DEFAULT 0',
        'priority': 'INT NOT NULL DEFAULT 0',
        'attempts': 'INT NOT NULL DEFAULT 0',
        'max_attempts': 'INT NOT NULL DEFAULT 3',
        'failure_count': 'INT NOT NULL DEFAULT 0',
        'issues_count': 'INT NOT NULL DEFAULT 0',
        'uptime_percentage': 'DECIMAL(5,2) NOT NULL DEFAULT 100.00'
    }
    
    for table, columns in missing_columns.items():
        sql_statements.append(f"-- Add missing columns to table: {table}")
        for col in columns:
            col_type = column_types.get(col, 'VARCHAR(255) NULL')
            # Use a procedure to check if column exists before adding
            sql_statements.append(f'''
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = '{table}' AND column_name = '{col}');
SET @sql := IF(@exist = 0, 'ALTER TABLE `{table}` ADD COLUMN `{col}` {col_type}', 'SELECT "Column {col} already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;''')
        sql_statements.append("")
    
    # Generate CREATE INDEX statements for missing indexes
    for table, indexes in missing_indexes.items():
        sql_statements.append(f"-- Add missing indexes to table: {table}")
        for idx in indexes:
            if idx != 'PRIMARY':
                # Infer column from index name
                col_name = idx.replace(f'idx_{table}_', '').replace('idx_', '')
                sql_statements.append(f"CREATE INDEX IF NOT EXISTS `{idx}` ON `{table}` (`{col_name}`);")
        sql_statements.append("")
    
    return sql_statements

def main():
    print("=" * 60)
    print("DATABASE SCHEMA COMPARISON REPORT")
    print("=" * 60)
    print()
    
    try:
        # Connect to database
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("Connected to database successfully!")
        print()
        
        # Get live schema
        print("Fetching live schema...")
        live_schema = get_live_schema(cursor)
        print(f"Found {len(live_schema)} tables in live database:")
        for table in sorted(live_schema.keys()):
            print(f"  - {table} ({len(live_schema[table]['columns'])} columns, {len(live_schema[table]['indexes'])} indexes)")
        print()
        
        # Compare schemas
        print("Comparing against expected schema...")
        missing_tables, missing_columns, missing_indexes = compare_schemas(live_schema, EXPECTED_TABLES)
        
        # Print results
        print()
        print("=" * 60)
        print("MISSING SCHEMA ITEMS")
        print("=" * 60)
        print()
        
        if missing_tables:
            print(f"MISSING TABLES ({len(missing_tables)}):")
            for table in missing_tables:
                print(f"  - {table}")
            print()
        else:
            print("No missing tables.")
            print()
        
        if missing_columns:
            print(f"MISSING COLUMNS ({sum(len(cols) for cols in missing_columns.values())}):")
            for table, columns in missing_columns.items():
                print(f"  {table}:")
                for col in columns:
                    print(f"    - {col}")
            print()
        else:
            print("No missing columns.")
            print()
        
        if missing_indexes:
            print(f"MISSING INDEXES ({sum(len(idx) for idx in missing_indexes.values())}):")
            for table, indexes in missing_indexes.items():
                print(f"  {table}:")
                for idx in indexes:
                    print(f"    - {idx}")
            print()
        else:
            print("No missing indexes.")
            print()
        
        # Generate migration SQL
        if missing_tables or missing_columns or missing_indexes:
            print("=" * 60)
            print("SAFE MIGRATION SQL")
            print("=" * 60)
            print()
            sql_statements = generate_migration_sql(missing_tables, missing_columns, missing_indexes)
            for stmt in sql_statements:
                print(stmt)
        else:
            print("=" * 60)
            print("DATABASE SCHEMA IS UP TO DATE!")
            print("=" * 60)
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
