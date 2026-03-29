import { getMySQLPool } from '@/lib/mysql/pool';
import { NextResponse } from 'next/server';

// Expected schema based on codebase analysis
const EXPECTED_SCHEMA: Record<string, {
  columns: Record<string, { type: string; nullable: boolean; default?: string | null }>;
  indexes: string[];
}> = {
  users: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      email: { type: 'VARCHAR(255)', nullable: false },
      password_hash: { type: 'VARCHAR(255)', nullable: false },
      role: { type: "ENUM('user','admin')", nullable: false, default: 'user' },
      status: { type: "ENUM('active','inactive','suspended','pending')", nullable: false, default: 'pending' },
      mfa_enabled: { type: 'TINYINT(1)', nullable: false, default: '0' },
      mfa_secret: { type: 'VARCHAR(255)', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false },
      last_login: { type: 'TIMESTAMP', nullable: true },
      email_verified: { type: 'TINYINT(1)', nullable: false, default: '0' },
      verification_token: { type: 'VARCHAR(255)', nullable: true },
      verification_token_expires: { type: 'TIMESTAMP', nullable: true }
    },
    indexes: ['PRIMARY', 'idx_users_email', 'idx_users_role', 'idx_users_status']
  },
  user_sessions: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      user_id: { type: 'VARCHAR(36)', nullable: false },
      token: { type: 'VARCHAR(255)', nullable: false },
      expires_at: { type: 'TIMESTAMP', nullable: false },
      created_at: { type: 'TIMESTAMP', nullable: false },
      ip_address: { type: 'VARCHAR(45)', nullable: true },
      user_agent: { type: 'TEXT', nullable: true },
      mfa_verified: { type: 'TINYINT(1)', nullable: false, default: '0' }
    },
    indexes: ['PRIMARY', 'idx_sessions_token', 'idx_sessions_user_id', 'idx_sessions_expires']
  },
  password_reset_tokens: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      user_id: { type: 'VARCHAR(36)', nullable: false },
      token: { type: 'VARCHAR(255)', nullable: false },
      expires_at: { type: 'TIMESTAMP', nullable: false },
      created_at: { type: 'TIMESTAMP', nullable: false },
      used: { type: 'TINYINT(1)', nullable: false, default: '0' }
    },
    indexes: ['PRIMARY', 'idx_password_reset_token', 'idx_password_reset_user_id']
  },
  admin_mfa_recovery_codes: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      user_id: { type: 'VARCHAR(36)', nullable: false },
      code_hash: { type: 'VARCHAR(255)', nullable: false },
      used: { type: 'TINYINT(1)', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false },
      used_at: { type: 'TIMESTAMP', nullable: true }
    },
    indexes: ['PRIMARY', 'idx_mfa_recovery_user_id']
  },
  auth_rate_limits: {
    columns: {
      key_hash: { type: 'CHAR(64)', nullable: false },
      scope: { type: 'VARCHAR(64)', nullable: false },
      attempts: { type: 'INT', nullable: false, default: '0' },
      window_started_at: { type: 'DATETIME', nullable: false },
      blocked_until: { type: 'DATETIME', nullable: true },
      created_at: { type: 'DATETIME', nullable: false },
      updated_at: { type: 'DATETIME', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_auth_rate_limits_scope', 'idx_auth_rate_limits_blocked_until']
  },
  platform_settings: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      setting_key: { type: 'VARCHAR(100)', nullable: false },
      setting_value: { type: 'TEXT', nullable: true },
      setting_type: { type: "ENUM('string','number','boolean','json')", nullable: false, default: 'string' },
      description: { type: 'TEXT', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_settings_key']
  },
  templates: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      name: { type: 'VARCHAR(255)', nullable: false },
      slug: { type: 'VARCHAR(255)', nullable: false },
      description: { type: 'TEXT', nullable: true },
      thumbnail_url: { type: 'VARCHAR(500)', nullable: true },
      preview_url: { type: 'VARCHAR(500)', nullable: true },
      category: { type: 'VARCHAR(100)', nullable: true },
      is_active: { type: 'TINYINT(1)', nullable: false, default: '1' },
      is_default: { type: 'TINYINT(1)', nullable: false, default: '0' },
      config: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_templates_slug', 'idx_templates_category', 'idx_templates_is_active']
  },
  template_features: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      template_id: { type: 'VARCHAR(36)', nullable: false },
      feature_name: { type: 'VARCHAR(255)', nullable: false },
      feature_value: { type: 'TEXT', nullable: true },
      display_order: { type: 'INT', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_template_features_template_id']
  },
  sites: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      user_id: { type: 'VARCHAR(36)', nullable: false },
      template_id: { type: 'VARCHAR(36)', nullable: true },
      name: { type: 'VARCHAR(255)', nullable: false },
      slug: { type: 'VARCHAR(255)', nullable: false },
      status: { type: "ENUM('draft','active','suspended','archived')", nullable: false, default: 'draft' },
      domain: { type: 'VARCHAR(255)', nullable: true },
      custom_domain: { type: 'VARCHAR(255)', nullable: true },
      ssl_status: { type: "ENUM('none','pending','active','expired','failed')", nullable: false, default: 'none' },
      config: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false },
      published_at: { type: 'TIMESTAMP', nullable: true },
      expires_at: { type: 'TIMESTAMP', nullable: true }
    },
    indexes: ['PRIMARY', 'idx_sites_user_id', 'idx_sites_slug', 'idx_sites_status', 'idx_sites_domain']
  },
  site_content: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      content_type: { type: 'VARCHAR(100)', nullable: false },
      content_key: { type: 'VARCHAR(255)', nullable: false },
      content_value: { type: 'LONGTEXT', nullable: true },
      locale: { type: 'VARCHAR(10)', nullable: false, default: 'en' },
      version: { type: 'INT', nullable: false, default: '1' },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_site_content_site_id', 'idx_site_content_type_key']
  },
  site_pages: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      title: { type: 'VARCHAR(255)', nullable: false },
      slug: { type: 'VARCHAR(255)', nullable: false },
      content: { type: 'LONGTEXT', nullable: true },
      meta_title: { type: 'VARCHAR(255)', nullable: true },
      meta_description: { type: 'TEXT', nullable: true },
      is_published: { type: 'TINYINT(1)', nullable: false, default: '0' },
      display_order: { type: 'INT', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_site_pages_site_id', 'idx_site_pages_slug']
  },
  site_media: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      filename: { type: 'VARCHAR(255)', nullable: false },
      original_filename: { type: 'VARCHAR(255)', nullable: false },
      mime_type: { type: 'VARCHAR(100)', nullable: false },
      size: { type: 'BIGINT', nullable: false },
      url: { type: 'VARCHAR(500)', nullable: false },
      s3_key: { type: 'VARCHAR(500)', nullable: true },
      alt_text: { type: 'VARCHAR(255)', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_site_media_site_id']
  },
  faqs: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      question_en: { type: 'VARCHAR(500)', nullable: false },
      question_ar: { type: 'VARCHAR(500)', nullable: false },
      answer_en: { type: 'TEXT', nullable: false },
      answer_ar: { type: 'TEXT', nullable: false },
      category: { type: 'VARCHAR(100)', nullable: true },
      display_order: { type: 'INT', nullable: false, default: '0' },
      is_active: { type: 'TINYINT(1)', nullable: false, default: '1' },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_faqs_category', 'idx_faqs_is_active']
  },
  domains: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      domain: { type: 'VARCHAR(255)', nullable: false },
      is_primary: { type: 'TINYINT(1)', nullable: false, default: '0' },
      dns_status: { type: "ENUM('pending','verified','failed')", nullable: false, default: 'pending' },
      ssl_status: { type: "ENUM('none','pending','active','expired','failed')", nullable: false, default: 'none' },
      dns_records: { type: 'JSON', nullable: true },
      verified_at: { type: 'TIMESTAMP', nullable: true },
      ssl_expires_at: { type: 'TIMESTAMP', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_domains_site_id', 'idx_domains_domain', 'idx_domains_dns_status']
  },
  domain_logs: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      domain_id: { type: 'VARCHAR(36)', nullable: false },
      action: { type: 'VARCHAR(100)', nullable: false },
      status: { type: 'VARCHAR(50)', nullable: false },
      message: { type: 'TEXT', nullable: true },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_domain_logs_domain_id']
  },
  dns_verifications: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      domain_id: { type: 'VARCHAR(36)', nullable: false },
      record_type: { type: 'VARCHAR(20)', nullable: false },
      record_name: { type: 'VARCHAR(255)', nullable: false },
      record_value: { type: 'VARCHAR(500)', nullable: false },
      is_verified: { type: 'TINYINT(1)', nullable: false, default: '0' },
      last_checked_at: { type: 'TIMESTAMP', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_dns_verifications_domain_id']
  },
  ssl_certificates: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      domain_id: { type: 'VARCHAR(36)', nullable: false },
      certificate: { type: 'TEXT', nullable: false },
      private_key: { type: 'TEXT', nullable: false },
      chain: { type: 'TEXT', nullable: true },
      issuer: { type: 'VARCHAR(255)', nullable: true },
      issued_at: { type: 'TIMESTAMP', nullable: false },
      expires_at: { type: 'TIMESTAMP', nullable: false },
      is_active: { type: 'TINYINT(1)', nullable: false, default: '1' },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_ssl_certificates_domain_id', 'idx_ssl_certificates_expires']
  },
  provisioning_jobs: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      job_type: { type: 'VARCHAR(50)', nullable: false },
      status: { type: "ENUM('pending','running','completed','failed')", nullable: false, default: 'pending' },
      progress: { type: 'INT', nullable: false, default: '0' },
      message: { type: 'TEXT', nullable: true },
      metadata: { type: 'JSON', nullable: true },
      started_at: { type: 'TIMESTAMP', nullable: true },
      completed_at: { type: 'TIMESTAMP', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_provisioning_jobs_site_id', 'idx_provisioning_jobs_status']
  },
  provisioning_job_logs: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      job_id: { type: 'VARCHAR(36)', nullable: false },
      level: { type: "ENUM('info','warn','error')", nullable: false, default: 'info' },
      message: { type: 'TEXT', nullable: false },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_provisioning_job_logs_job_id']
  },
  job_queue: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      job_type: { type: 'VARCHAR(100)', nullable: false },
      payload: { type: 'JSON', nullable: false },
      status: { type: "ENUM('pending','processing','completed','failed')", nullable: false, default: 'pending' },
      priority: { type: 'INT', nullable: false, default: '0' },
      attempts: { type: 'INT', nullable: false, default: '0' },
      max_attempts: { type: 'INT', nullable: false, default: '3' },
      scheduled_at: { type: 'TIMESTAMP', nullable: true },
      started_at: { type: 'TIMESTAMP', nullable: true },
      completed_at: { type: 'TIMESTAMP', nullable: true },
      failed_at: { type: 'TIMESTAMP', nullable: true },
      error_message: { type: 'TEXT', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_job_queue_status', 'idx_job_queue_scheduled', 'idx_job_queue_type_status']
  },
  dead_letter_queue: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      original_job_id: { type: 'VARCHAR(36)', nullable: false },
      job_type: { type: 'VARCHAR(100)', nullable: false },
      payload: { type: 'JSON', nullable: false },
      error_message: { type: 'TEXT', nullable: true },
      failed_at: { type: 'TIMESTAMP', nullable: false },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_dead_letter_queue_job_type']
  },
  worker_heartbeats: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      worker_id: { type: 'VARCHAR(100)', nullable: false },
      worker_type: { type: 'VARCHAR(50)', nullable: false },
      status: { type: "ENUM('active','idle','stopped')", nullable: false, default: 'active' },
      last_heartbeat: { type: 'TIMESTAMP', nullable: false },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_worker_heartbeats_worker_id', 'idx_worker_heartbeats_type']
  },
  backups: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      backup_type: { type: "ENUM('full','incremental','manual')", nullable: false, default: 'full' },
      status: { type: "ENUM('pending','running','completed','failed')", nullable: false, default: 'pending' },
      size: { type: 'BIGINT', nullable: true },
      s3_key: { type: 'VARCHAR(500)', nullable: true },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      completed_at: { type: 'TIMESTAMP', nullable: true },
      expires_at: { type: 'TIMESTAMP', nullable: true }
    },
    indexes: ['PRIMARY', 'idx_backups_site_id', 'idx_backups_status', 'idx_backups_expires']
  },
  backup_logs: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      backup_id: { type: 'VARCHAR(36)', nullable: false },
      level: { type: "ENUM('info','warn','error')", nullable: false, default: 'info' },
      message: { type: 'TEXT', nullable: false },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_backup_logs_backup_id']
  },
  backup_retention_policies: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      policy_type: { type: 'VARCHAR(50)', nullable: false },
      retention_days: { type: 'INT', nullable: false, default: '30' },
      max_backups: { type: 'INT', nullable: false, default: '10' },
      is_active: { type: 'TINYINT(1)', nullable: false, default: '1' },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_backup_retention_site_id']
  },
  restores: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      backup_id: { type: 'VARCHAR(36)', nullable: false },
      status: { type: "ENUM('pending','running','completed','failed')", nullable: false, default: 'pending' },
      message: { type: 'TEXT', nullable: true },
      metadata: { type: 'JSON', nullable: true },
      started_at: { type: 'TIMESTAMP', nullable: true },
      completed_at: { type: 'TIMESTAMP', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_restores_site_id', 'idx_restores_backup_id']
  },
  restore_logs: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      restore_id: { type: 'VARCHAR(36)', nullable: false },
      level: { type: "ENUM('info','warn','error')", nullable: false, default: 'info' },
      message: { type: 'TEXT', nullable: false },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_restore_logs_restore_id']
  },
  exports: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      export_type: { type: 'VARCHAR(50)', nullable: false },
      status: { type: "ENUM('pending','running','completed','failed')", nullable: false, default: 'pending' },
      format: { type: 'VARCHAR(20)', nullable: false, default: 'zip' },
      s3_key: { type: 'VARCHAR(500)', nullable: true },
      download_url: { type: 'VARCHAR(500)', nullable: true },
      expires_at: { type: 'TIMESTAMP', nullable: true },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      completed_at: { type: 'TIMESTAMP', nullable: true }
    },
    indexes: ['PRIMARY', 'idx_exports_site_id', 'idx_exports_status']
  },
  health_checks: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      check_type: { type: 'VARCHAR(50)', nullable: false },
      status: { type: "ENUM('healthy','degraded','unhealthy')", nullable: false },
      response_time: { type: 'INT', nullable: true },
      status_code: { type: 'INT', nullable: true },
      message: { type: 'TEXT', nullable: true },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_health_checks_site_id', 'idx_health_checks_type', 'idx_health_checks_status']
  },
  website_health_summary: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      overall_status: { type: "ENUM('healthy','degraded','unhealthy')", nullable: false },
      uptime_percentage: { type: 'DECIMAL(5,2)', nullable: false, default: '100.00' },
      avg_response_time: { type: 'INT', nullable: true },
      last_check_at: { type: 'TIMESTAMP', nullable: true },
      issues_count: { type: 'INT', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_health_summary_site_id']
  },
  incidents: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      incident_type: { type: 'VARCHAR(50)', nullable: false },
      severity: { type: "ENUM('low','medium','high','critical')", nullable: false },
      status: { type: "ENUM('open','investigating','resolved','closed')", nullable: false, default: 'open' },
      title: { type: 'VARCHAR(255)', nullable: false },
      description: { type: 'TEXT', nullable: true },
      started_at: { type: 'TIMESTAMP', nullable: false },
      resolved_at: { type: 'TIMESTAMP', nullable: true },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_incidents_site_id', 'idx_incidents_status', 'idx_incidents_severity']
  },
  alerts: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      site_id: { type: 'VARCHAR(36)', nullable: false },
      alert_type: { type: 'VARCHAR(50)', nullable: false },
      severity: { type: "ENUM('low','medium','high','critical')", nullable: false },
      status: { type: "ENUM('active','acknowledged','resolved')", nullable: false, default: 'active' },
      title: { type: 'VARCHAR(255)', nullable: false },
      message: { type: 'TEXT', nullable: true },
      acknowledged_at: { type: 'TIMESTAMP', nullable: true },
      acknowledged_by: { type: 'VARCHAR(36)', nullable: true },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_alerts_site_id', 'idx_alerts_status', 'idx_alerts_severity']
  },
  server_health: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      server_id: { type: 'VARCHAR(100)', nullable: false },
      server_name: { type: 'VARCHAR(255)', nullable: false },
      cpu_usage: { type: 'DECIMAL(5,2)', nullable: true },
      memory_usage: { type: 'DECIMAL(5,2)', nullable: true },
      disk_usage: { type: 'DECIMAL(5,2)', nullable: true },
      network_in: { type: 'BIGINT', nullable: true },
      network_out: { type: 'BIGINT', nullable: true },
      status: { type: "ENUM('healthy','degraded','unhealthy','offline')", nullable: false },
      metadata: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_server_health_server_id', 'idx_server_health_status']
  },
  audit_logs: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      user_id: { type: 'VARCHAR(36)', nullable: true },
      action: { type: 'VARCHAR(100)', nullable: false },
      resource_type: { type: 'VARCHAR(50)', nullable: false },
      resource_id: { type: 'VARCHAR(36)', nullable: true },
      old_values: { type: 'JSON', nullable: true },
      new_values: { type: 'JSON', nullable: true },
      ip_address: { type: 'VARCHAR(45)', nullable: true },
      user_agent: { type: 'TEXT', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_audit_logs_user_id', 'idx_audit_logs_resource', 'idx_audit_logs_action']
  },
  notifications: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      user_id: { type: 'VARCHAR(36)', nullable: false },
      type: { type: 'VARCHAR(50)', nullable: false },
      title: { type: 'VARCHAR(255)', nullable: false },
      message: { type: 'TEXT', nullable: true },
      data: { type: 'JSON', nullable: true },
      read_at: { type: 'TIMESTAMP', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_notifications_user_id', 'idx_notifications_read']
  },
  api_keys: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      user_id: { type: 'VARCHAR(36)', nullable: false },
      name: { type: 'VARCHAR(100)', nullable: false },
      key_hash: { type: 'VARCHAR(255)', nullable: false },
      key_prefix: { type: 'VARCHAR(12)', nullable: false },
      scopes: { type: 'JSON', nullable: true },
      last_used_at: { type: 'TIMESTAMP', nullable: true },
      expires_at: { type: 'TIMESTAMP', nullable: true },
      is_active: { type: 'TINYINT(1)', nullable: false, default: '1' },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_api_keys_user_id', 'idx_api_keys_prefix']
  },
  webhooks: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      user_id: { type: 'VARCHAR(36)', nullable: false },
      name: { type: 'VARCHAR(100)', nullable: false },
      url: { type: 'VARCHAR(500)', nullable: false },
      secret: { type: 'VARCHAR(255)', nullable: false },
      events: { type: 'JSON', nullable: false },
      is_active: { type: 'TINYINT(1)', nullable: false, default: '1' },
      last_triggered_at: { type: 'TIMESTAMP', nullable: true },
      failure_count: { type: 'INT', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false },
      updated_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_webhooks_user_id', 'idx_webhooks_is_active']
  },
  webhook_logs: {
    columns: {
      id: { type: 'VARCHAR(36)', nullable: false },
      webhook_id: { type: 'VARCHAR(36)', nullable: false },
      event: { type: 'VARCHAR(100)', nullable: false },
      payload: { type: 'JSON', nullable: false },
      response_status: { type: 'INT', nullable: true },
      response_body: { type: 'TEXT', nullable: true },
      duration_ms: { type: 'INT', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false }
    },
    indexes: ['PRIMARY', 'idx_webhook_logs_webhook_id']
  }
};

async function getLiveSchema(pool: any) {
  // Get all tables
  const [tables] = await pool.query('SHOW TABLES') as any;
  if (!tables || tables.length === 0) return {};

  const tableKey = Object.keys(tables[0])[0];
  const schema: Record<string, { columns: Record<string, any>; indexes: string[] }> = {};

  for (const table of tables) {
    const tableName = table[tableKey];
    
    // Get columns
    const [columns] = await pool.query(`DESCRIBE \`${tableName}\``) as any;
    const columnMap: Record<string, any> = {};
    for (const col of columns) {
      columnMap[col.Field] = {
        type: col.Type.toUpperCase(),
        nullable: col.Null === 'YES',
        default: col.Default,
        key: col.Key
      };
    }
    
    // Get indexes
    const [indexes] = await pool.query(`SHOW INDEX FROM \`${tableName}\``) as any;
    const indexNames = [...new Set(indexes.map((idx: any) => idx.Key_name))];
    
    schema[tableName] = {
      columns: columnMap,
      indexes: indexNames as string[]
    };
  }
  
  return schema;
}

function compareSchemas(liveSchema: any, expectedSchema: any) {
  const missingTables: string[] = [];
  const missingColumns: Record<string, string[]> = {};
  const missingIndexes: Record<string, string[]> = {};

  for (const [tableName, expected] of Object.entries(expectedSchema)) {
    const exp = expected as any;
    
    if (!liveSchema[tableName]) {
      missingTables.push(tableName);
    } else {
      const live = liveSchema[tableName];
      
      // Check columns
      const missingCols: string[] = [];
      for (const colName of Object.keys(exp.columns)) {
        if (!live.columns[colName]) {
          missingCols.push(colName);
        }
      }
      if (missingCols.length > 0) {
        missingColumns[tableName] = missingCols;
      }
      
      // Check indexes
      const missingIdx: string[] = [];
      for (const idxName of exp.indexes) {
        if (!live.indexes.includes(idxName)) {
          missingIdx.push(idxName);
        }
      }
      if (missingIdx.length > 0) {
        missingIndexes[tableName] = missingIdx;
      }
    }
  }

  return { missingTables, missingColumns, missingIndexes };
}

function generateMigrationSQL(missingTables: string[], missingColumns: Record<string, string[]>, missingIndexes: Record<string, string[]>) {
  const statements: string[] = [];
  
  // Generate CREATE TABLE statements for missing tables
  for (const tableName of missingTables) {
    const tableSpec = EXPECTED_SCHEMA[tableName];
    if (!tableSpec) continue;
    
    const cols: string[] = [];
    for (const [colName, colSpec] of Object.entries(tableSpec.columns)) {
      let colDef = `\`${colName}\` ${colSpec.type}`;
      colDef += colSpec.nullable ? ' NULL' : ' NOT NULL';
      if (colSpec.default !== undefined) {
        if (colSpec.default === null) {
          colDef += ' DEFAULT NULL';
        } else if (colSpec.type.includes('TIMESTAMP')) {
          colDef += ` DEFAULT ${colSpec.default === 'CURRENT_TIMESTAMP' ? 'CURRENT_TIMESTAMP' : `'${colSpec.default}'`}`;
        } else {
          colDef += ` DEFAULT '${colSpec.default}'`;
        }
      } else if (colSpec.type.includes('TIMESTAMP') && !colSpec.nullable) {
        colDef += ' DEFAULT CURRENT_TIMESTAMP';
      }
      cols.push(colDef);
    }
    
    cols.push(`PRIMARY KEY (\`id\`)`);
    
    // Add other indexes
    for (const idxName of tableSpec.indexes) {
      if (idxName === 'PRIMARY') continue;
      // Determine index columns based on naming convention
      const idxCols = getIndexColumns(tableName, idxName);
      if (idxCols) {
        const isUnique = idxName.includes('email') || idxName.includes('token') || idxName.includes('slug') || idxName.includes('key') || idxName.includes('domain');
        cols.push(`${isUnique ? 'UNIQUE ' : ''}KEY \`${idxName}\` (${idxCols})`);
      }
    }
    
    statements.push(`-- Create table: ${tableName}
CREATE TABLE IF NOT EXISTS \`${tableName}\` (
  ${cols.join(',\n  ')}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  }
  
  // Generate ALTER TABLE ADD COLUMN for missing columns
  for (const [tableName, columns] of Object.entries(missingColumns)) {
    const tableSpec = EXPECTED_SCHEMA[tableName];
    if (!tableSpec) continue;
    
    for (const colName of columns) {
      const colSpec = tableSpec.columns[colName];
      if (!colSpec) continue;
      
      let colDef = `\`${colName}\` ${colSpec.type}`;
      colDef += colSpec.nullable ? ' NULL' : ' NOT NULL';
      if (colSpec.default !== undefined) {
        if (colSpec.default === null) {
          colDef += ' DEFAULT NULL';
        } else if (colSpec.type.includes('TIMESTAMP')) {
          colDef += ` DEFAULT ${colSpec.default === 'CURRENT_TIMESTAMP' ? 'CURRENT_TIMESTAMP' : `'${colSpec.default}'`}`;
        } else {
          colDef += ` DEFAULT '${colSpec.default}'`;
        }
      }
      
      statements.push(`-- Add missing column: ${tableName}.${colName}
ALTER TABLE \`${tableName}\` ADD COLUMN IF NOT EXISTS ${colDef};`);
    }
  }
  
  // Generate CREATE INDEX for missing indexes
  for (const [tableName, indexes] of Object.entries(missingIndexes)) {
    for (const idxName of indexes) {
      if (idxName === 'PRIMARY') continue;
      
      const idxCols = getIndexColumns(tableName, idxName);
      if (!idxCols) continue;
      
      const isUnique = idxName.includes('email') || idxName.includes('token') || idxName.includes('slug') || idxName.includes('key');
      
      statements.push(`-- Add missing index: ${tableName}.${idxName}
CREATE ${isUnique ? 'UNIQUE ' : ''}INDEX \`${idxName}\` ON \`${tableName}\` (${idxCols});`);
    }
  }
  
  return statements;
}

function getIndexColumns(tableName: string, indexName: string): string | null {
  // Map index names to their columns
  const indexMap: Record<string, Record<string, string>> = {
    users: {
      'idx_users_email': '`email`',
      'idx_users_role': '`role`',
      'idx_users_status': '`status`'
    },
    user_sessions: {
      'idx_sessions_token': '`token`',
      'idx_sessions_user_id': '`user_id`',
      'idx_sessions_expires': '`expires_at`'
    },
    password_reset_tokens: {
      'idx_password_reset_token': '`token`',
      'idx_password_reset_user_id': '`user_id`'
    },
    admin_mfa_recovery_codes: {
      'idx_mfa_recovery_user_id': '`user_id`'
    },
    auth_rate_limits: {
      'idx_rate_limits_identifier_action': '`identifier`, `action`',
      'idx_rate_limits_blocked_until': '`blocked_until`'
    },
    platform_settings: {
      'idx_settings_key': '`setting_key`'
    },
    templates: {
      'idx_templates_slug': '`slug`',
      'idx_templates_category': '`category`',
      'idx_templates_is_active': '`is_active`'
    },
    template_features: {
      'idx_template_features_template_id': '`template_id`'
    },
    sites: {
      'idx_sites_user_id': '`user_id`',
      'idx_sites_slug': '`slug`',
      'idx_sites_status': '`status`',
      'idx_sites_domain': '`domain`'
    },
    site_content: {
      'idx_site_content_site_id': '`site_id`',
      'idx_site_content_type_key': '`content_type`, `content_key`'
    },
    site_pages: {
      'idx_site_pages_site_id': '`site_id`',
      'idx_site_pages_slug': '`site_id`, `slug`'
    },
    site_media: {
      'idx_site_media_site_id': '`site_id`'
    },
    faqs: {
      'idx_faqs_category': '`category`',
      'idx_faqs_is_active': '`is_active`'
    },
    domains: {
      'idx_domains_site_id': '`site_id`',
      'idx_domains_domain': '`domain`',
      'idx_domains_dns_status': '`dns_status`'
    },
    domain_logs: {
      'idx_domain_logs_domain_id': '`domain_id`'
    },
    dns_verifications: {
      'idx_dns_verifications_domain_id': '`domain_id`'
    },
    ssl_certificates: {
      'idx_ssl_certificates_domain_id': '`domain_id`',
      'idx_ssl_certificates_expires': '`expires_at`'
    },
    provisioning_jobs: {
      'idx_provisioning_jobs_site_id': '`site_id`',
      'idx_provisioning_jobs_status': '`status`'
    },
    provisioning_job_logs: {
      'idx_provisioning_job_logs_job_id': '`job_id`'
    },
    job_queue: {
      'idx_job_queue_status': '`status`',
      'idx_job_queue_scheduled': '`scheduled_at`',
      'idx_job_queue_type_status': '`job_type`, `status`'
    },
    dead_letter_queue: {
      'idx_dead_letter_queue_job_type': '`job_type`'
    },
    worker_heartbeats: {
      'idx_worker_heartbeats_worker_id': '`worker_id`',
      'idx_worker_heartbeats_type': '`worker_type`'
    },
    backups: {
      'idx_backups_site_id': '`site_id`',
      'idx_backups_status': '`status`',
      'idx_backups_expires': '`expires_at`'
    },
    backup_logs: {
      'idx_backup_logs_backup_id': '`backup_id`'
    },
    backup_retention_policies: {
      'idx_backup_retention_site_id': '`site_id`'
    },
    restores: {
      'idx_restores_site_id': '`site_id`',
      'idx_restores_backup_id': '`backup_id`'
    },
    restore_logs: {
      'idx_restore_logs_restore_id': '`restore_id`'
    },
    exports: {
      'idx_exports_site_id': '`site_id`',
      'idx_exports_status': '`status`'
    },
    health_checks: {
      'idx_health_checks_site_id': '`site_id`',
      'idx_health_checks_type': '`check_type`',
      'idx_health_checks_status': '`status`'
    },
    website_health_summary: {
      'idx_health_summary_site_id': '`site_id`'
    },
    incidents: {
      'idx_incidents_site_id': '`site_id`',
      'idx_incidents_status': '`status`',
      'idx_incidents_severity': '`severity`'
    },
    alerts: {
      'idx_alerts_site_id': '`site_id`',
      'idx_alerts_status': '`status`',
      'idx_alerts_severity': '`severity`'
    },
    server_health: {
      'idx_server_health_server_id': '`server_id`',
      'idx_server_health_status': '`status`'
    },
    audit_logs: {
      'idx_audit_logs_user_id': '`user_id`',
      'idx_audit_logs_resource': '`resource_type`, `resource_id`',
      'idx_audit_logs_action': '`action`'
    },
    notifications: {
      'idx_notifications_user_id': '`user_id`',
      'idx_notifications_read': '`read_at`'
    },
    api_keys: {
      'idx_api_keys_user_id': '`user_id`',
      'idx_api_keys_prefix': '`key_prefix`'
    },
    webhooks: {
      'idx_webhooks_user_id': '`user_id`',
      'idx_webhooks_is_active': '`is_active`'
    },
    webhook_logs: {
      'idx_webhook_logs_webhook_id': '`webhook_id`'
    }
  };
  
  return indexMap[tableName]?.[indexName] || null;
}

export async function GET() {
  try {
    const pool = getMySQLPool();
    
    if (!pool) {
      return NextResponse.json({ error: 'MySQL not configured' }, { status: 500 });
    }

    console.log('[v0] Fetching live schema...');
    const liveSchema = await getLiveSchema(pool);
    
    console.log('[v0] Comparing schemas...');
    const { missingTables, missingColumns, missingIndexes } = compareSchemas(liveSchema, EXPECTED_SCHEMA);
    
    console.log('[v0] Generating migration SQL...');
    const migrationSQL = generateMigrationSQL(missingTables, missingColumns, missingIndexes);
    
    const hasChanges = missingTables.length > 0 || 
                       Object.keys(missingColumns).length > 0 || 
                       Object.keys(missingIndexes).length > 0;

    return NextResponse.json({
      database: process.env.MYSQL_DATABASE || 'ovmon_db',
      liveTablesCount: Object.keys(liveSchema).length,
      expectedTablesCount: Object.keys(EXPECTED_SCHEMA).length,
      liveTables: Object.keys(liveSchema).sort(),
      comparison: {
        hasChanges,
        missingTables,
        missingColumns,
        missingIndexes
      },
      migrationSQL: hasChanges ? migrationSQL.join('\n\n') : null,
      migrationStatementCount: migrationSQL.length
    });
  } catch (error: any) {
    console.error('[v0] Database inspection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
