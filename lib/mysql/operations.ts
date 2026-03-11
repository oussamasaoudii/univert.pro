import { randomUUID, randomBytes } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureCoreSchema } from "@/lib/mysql/schema";
import { ensurePlatformDataSchema, listTemplates } from "@/lib/mysql/platform";
import { findUserById } from "@/lib/mysql/users";

export type ServerStatus = "healthy" | "degraded" | "offline" | "maintenance";
export type ProfileStatus = "active" | "disabled";
export type RuleStatus = "enabled" | "disabled";
export type JobStatus = "pending" | "running" | "completed" | "failed";
export type AlertSeverity = "info" | "warning" | "critical";
export type IncidentStatus = "open" | "resolved";
export type BackupStatus = "completed" | "pending" | "failed";
export type BackupType = "full" | "incremental";
export type QueueStatus = "running" | "pending" | "failed" | "completed";

export type ServerRecord = {
  id: string;
  name: string;
  region: string;
  provider: string;
  ipAddress: string;
  operatingSystem: string;
  stackSupport: string[];
  status: ServerStatus;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  websitesCount: number;
  lastSyncAt: string | null;
  provisioningEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProvisioningProfileRecord = {
  id: string;
  name: string;
  stack: string;
  method: string;
  server: string;
  database: string;
  domain: string;
  ssl: string;
  status: ProfileStatus;
  websites: number;
  created: string;
  updatedAt: string;
};

export type DeploymentRuleRecord = {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

export type ScheduledJobRecord = {
  id: string;
  name: string;
  schedule: string;
  type: string;
  lastRun: string | null;
  nextRun: string | null;
  status: JobStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WebhookConfigRecord = {
  url: string | null;
  events: string[];
  enabled: boolean;
  updatedAt: string;
};

export type BackupRecord = {
  id: string;
  website: string;
  server: string;
  sizeMb: number;
  sizeLabel: string;
  status: BackupStatus;
  created: string;
  expiry: string | null;
  type: BackupType;
};

export type MonitoringAlertRecord = {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  website: string | null;
  server: string | null;
  active: boolean;
};

export type MonitoringIncidentRecord = {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  count: number;
  since: string;
};

export type QueueJobRecord = {
  id: string;
  website: string;
  status: QueueStatus;
  progress: number;
  step: string;
  server: string;
  created: string;
  eta: string | null;
  error: string | null;
  retries: number;
};

export type TemplateMappingRecord = {
  id: string;
  templateName: string;
  category: string;
  stack: string;
  profile: string;
  serverPool: string;
  pricing: string;
  featured: boolean;
  websites: number;
};

type ServerRow = {
  id: string;
  name: string;
  region: string;
  provider: string;
  ip_address: string;
  operating_system: string;
  stack_support: string;
  status: ServerStatus;
  cpu_usage: number;
  ram_usage: number;
  disk_usage: number;
  websites_count: number;
  last_sync_at: string | null;
  provisioning_enabled: number | boolean;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  name: string;
  stack_type: string;
  deployment_method: string;
  target_server_name: string;
  database_strategy: string;
  domain_strategy: string;
  ssl_strategy: string;
  status: ProfileStatus;
  websites_count: number;
  created_at: string | Date;
  updated_at: string | Date;
};

type RuleRow = {
  id: string;
  name: string;
  condition_text: string;
  action_text: string;
  enabled: number | boolean;
  priority: number;
  created_at: string;
  updated_at: string;
};

type ScheduledJobRow = {
  id: string;
  name: string;
  schedule_text: string;
  job_type: string;
  last_run_at: string | null;
  next_run_at: string | null;
  status: JobStatus;
  enabled: number | boolean;
  created_at: string;
  updated_at: string;
};

type WebhookRow = {
  id: number;
  url: string | null;
  events_json: string | null;
  enabled: number | boolean;
  updated_at: string;
};

type BackupRow = {
  id: string;
  website_name: string;
  server_name: string;
  size_mb: string | number;
  status: BackupStatus;
  created_at: string;
  expires_at: string | null;
  backup_type: BackupType;
};

type AlertRow = {
  id: string;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  website_name: string | null;
  server_name: string | null;
  is_active: number | boolean;
  created_at: string;
};

type IncidentRow = {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  occurrences: number;
  started_at: string;
};

type QueueRow = {
  id: string;
  website_name: string;
  status: QueueStatus;
  progress_percent: number;
  step_text: string;
  server_name: string;
  created_at: string;
  eta_minutes: number | null;
  error_message: string | null;
  retry_count: number;
};

type TemplateMappingRow = {
  id: string;
  template_name: string;
  category: string;
  stack_type: string;
  profile_name: string;
  server_pool: string;
  pricing_monthly: string | number;
  featured: number | boolean;
  websites_count: number;
};

type UserPreferenceRow = {
  user_id: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  email_notifications: number | boolean;
  maintenance_alerts: number | boolean;
  weekly_reports: number | boolean;
  two_factor: number | boolean;
  api_key: string;
};

let operationsSchemaPromise: Promise<void> | null = null;

function toBool(value: number | boolean) {
  return value === 1 || value === true;
}

function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function formatDateTime(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string | Date | null) {
  if (!value) return "";
  const parsed = value instanceof Date ? value : new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.split(" ")[0] || value;
  }
  return "";
}

function toSizeLabel(sizeMb: number) {
  if (sizeMb >= 1024) {
    return `${(sizeMb / 1024).toFixed(1)} GB`;
  }
  return `${Math.round(sizeMb)} MB`;
}

function mapServer(row: ServerRow): ServerRecord {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    provider: row.provider,
    ipAddress: row.ip_address,
    operatingSystem: row.operating_system,
    stackSupport: parseStringArray(row.stack_support),
    status: row.status,
    cpuUsage: Number(row.cpu_usage || 0),
    ramUsage: Number(row.ram_usage || 0),
    diskUsage: Number(row.disk_usage || 0),
    websitesCount: Number(row.websites_count || 0),
    lastSyncAt: row.last_sync_at,
    provisioningEnabled: toBool(row.provisioning_enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfile(row: ProfileRow): ProvisioningProfileRecord {
  return {
    id: row.id,
    name: row.name,
    stack: row.stack_type,
    method: row.deployment_method,
    server: row.target_server_name,
    database: row.database_strategy,
    domain: row.domain_strategy,
    ssl: row.ssl_strategy,
    status: row.status,
    websites: Number(row.websites_count || 0),
    created: formatDateOnly(row.created_at as string | Date),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : row.updated_at,
  };
}

function mapRule(row: RuleRow): DeploymentRuleRecord {
  return {
    id: row.id,
    name: row.name,
    condition: row.condition_text,
    action: row.action_text,
    enabled: toBool(row.enabled),
    priority: Number(row.priority || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapScheduledJob(row: ScheduledJobRow): ScheduledJobRecord {
  return {
    id: row.id,
    name: row.name,
    schedule: row.schedule_text,
    type: row.job_type,
    lastRun: formatDateTime(row.last_run_at),
    nextRun: formatDateTime(row.next_run_at),
    status: row.status,
    enabled: toBool(row.enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWebhook(row: WebhookRow): WebhookConfigRecord {
  return {
    url: row.url,
    events: parseStringArray(row.events_json),
    enabled: toBool(row.enabled),
    updatedAt: row.updated_at,
  };
}

function mapBackup(row: BackupRow): BackupRecord {
  const sizeMb = Number(row.size_mb || 0);
  return {
    id: row.id,
    website: row.website_name,
    server: row.server_name,
    sizeMb,
    sizeLabel: toSizeLabel(sizeMb),
    status: row.status,
    created: formatDateTime(row.created_at) || row.created_at,
    expiry: row.expires_at,
    type: row.backup_type,
  };
}

function mapAlert(row: AlertRow): MonitoringAlertRecord {
  return {
    id: row.id,
    type: row.alert_type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    timestamp: formatDateTime(row.created_at) || row.created_at,
    website: row.website_name,
    server: row.server_name,
    active: toBool(row.is_active),
  };
}

function sinceLabel(value: string) {
  const now = Date.now();
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "unknown";
  const diffMinutes = Math.max(1, Math.floor((now - then) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function mapIncident(row: IncidentRow): MonitoringIncidentRecord {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    count: Number(row.occurrences || 0),
    since: sinceLabel(row.started_at),
  };
}

function mapQueueJob(row: QueueRow): QueueJobRecord {
  return {
    id: row.id,
    website: row.website_name,
    status: row.status,
    progress: Number(row.progress_percent || 0),
    step: row.step_text,
    server: row.server_name,
    created: formatDateTime(row.created_at) || row.created_at,
    eta: row.eta_minutes ? `${row.eta_minutes} min` : null,
    error: row.error_message,
    retries: Number(row.retry_count || 0),
  };
}

function mapTemplateMapping(row: TemplateMappingRow): TemplateMappingRecord {
  return {
    id: row.id,
    templateName: row.template_name,
    category: row.category,
    stack: row.stack_type,
    profile: row.profile_name,
    serverPool: row.server_pool,
    pricing: `$${Math.round(Number(row.pricing_monthly || 0))}/mo`,
    featured: toBool(row.featured),
    websites: Number(row.websites_count || 0),
  };
}

function generateApiKey() {
  return `sk_live_${randomBytes(18).toString("hex")}`;
}

export async function ensureOperationsSchema(): Promise<void> {
  if (!operationsSchemaPromise) {
    operationsSchemaPromise = initializeOperationsSchema();
  }
  await operationsSchemaPromise;
}

async function initializeOperationsSchema() {
  await ensureCoreSchema();
  await ensurePlatformDataSchema();

  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS infra_servers (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      region VARCHAR(64) NOT NULL,
      provider VARCHAR(64) NOT NULL,
      ip_address VARCHAR(64) NOT NULL,
      operating_system VARCHAR(64) NOT NULL,
      stack_support TEXT NOT NULL,
      status ENUM('healthy','degraded','offline','maintenance') NOT NULL DEFAULT 'healthy',
      cpu_usage INT NOT NULL DEFAULT 0,
      ram_usage INT NOT NULL DEFAULT 0,
      disk_usage INT NOT NULL DEFAULT 0,
      websites_count INT NOT NULL DEFAULT 0,
      last_sync_at DATETIME NULL,
      provisioning_enabled TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provisioning_profiles (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      stack_type VARCHAR(64) NOT NULL,
      deployment_method VARCHAR(64) NOT NULL,
      target_server_name VARCHAR(191) NOT NULL,
      database_strategy VARCHAR(64) NOT NULL,
      domain_strategy VARCHAR(64) NOT NULL,
      ssl_strategy VARCHAR(64) NOT NULL,
      status ENUM('active','disabled') NOT NULL DEFAULT 'active',
      websites_count INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS deployment_rules (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      condition_text VARCHAR(255) NOT NULL,
      action_text VARCHAR(255) NOT NULL,
      enabled TINYINT(1) NOT NULL DEFAULT 1,
      priority INT NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS scheduled_jobs (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      schedule_text VARCHAR(191) NOT NULL,
      job_type VARCHAR(64) NOT NULL,
      last_run_at DATETIME NULL,
      next_run_at DATETIME NULL,
      status ENUM('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
      enabled TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS webhook_configs (
      id TINYINT UNSIGNED PRIMARY KEY,
      url TEXT NULL,
      events_json TEXT NULL,
      enabled TINYINT(1) NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS backup_records (
      id VARCHAR(64) PRIMARY KEY,
      website_name VARCHAR(191) NOT NULL,
      server_name VARCHAR(191) NOT NULL,
      size_mb DECIMAL(12,2) NOT NULL DEFAULT 0,
      status ENUM('completed','pending','failed') NOT NULL DEFAULT 'pending',
      backup_type ENUM('full','incremental') NOT NULL DEFAULT 'full',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at DATE NULL,
      download_url TEXT NULL,
      INDEX idx_backup_status (status),
      INDEX idx_backup_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS monitoring_alerts (
      id VARCHAR(64) PRIMARY KEY,
      alert_type VARCHAR(64) NOT NULL,
      severity ENUM('info','warning','critical') NOT NULL DEFAULT 'warning',
      title VARCHAR(191) NOT NULL,
      description TEXT NOT NULL,
      website_name VARCHAR(191) NULL,
      server_name VARCHAR(191) NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_monitoring_alerts_active (is_active),
      INDEX idx_monitoring_alerts_severity (severity)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS monitoring_incidents (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(191) NOT NULL,
      severity ENUM('info','warning','critical') NOT NULL DEFAULT 'warning',
      status ENUM('open','resolved') NOT NULL DEFAULT 'open',
      occurrences INT NOT NULL DEFAULT 1,
      started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME NULL,
      INDEX idx_monitoring_incidents_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provisioning_queue_jobs (
      id VARCHAR(64) PRIMARY KEY,
      website_name VARCHAR(191) NOT NULL,
      status ENUM('running','pending','failed','completed') NOT NULL DEFAULT 'pending',
      progress_percent INT NOT NULL DEFAULT 0,
      step_text VARCHAR(255) NOT NULL,
      server_name VARCHAR(191) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      eta_minutes INT NULL,
      error_message TEXT NULL,
      retry_count INT NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_provisioning_queue_status (status),
      INDEX idx_provisioning_queue_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS template_mappings (
      id VARCHAR(64) PRIMARY KEY,
      template_id CHAR(36) NULL,
      template_name VARCHAR(191) NOT NULL,
      category VARCHAR(64) NOT NULL,
      stack_type VARCHAR(64) NOT NULL,
      profile_name VARCHAR(191) NOT NULL,
      server_pool VARCHAR(191) NOT NULL,
      pricing_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      websites_count INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_template_mappings_featured (featured)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id CHAR(36) PRIMARY KEY,
      phone VARCHAR(64) NULL,
      first_name VARCHAR(120) NULL,
      last_name VARCHAR(120) NULL,
      company VARCHAR(191) NULL,
      email_notifications TINYINT(1) NOT NULL DEFAULT 1,
      maintenance_alerts TINYINT(1) NOT NULL DEFAULT 1,
      weekly_reports TINYINT(1) NOT NULL DEFAULT 0,
      two_factor TINYINT(1) NOT NULL DEFAULT 0,
      api_key VARCHAR(191) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await seedOperationsData();
}

async function seedOperationsData() {
  const pool = getMySQLPool();

  const [serversCountRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM infra_servers",
  );
  if ((serversCountRows[0]?.total || 0) === 0) {
    const servers = [
      {
        id: "srv-us-east-1",
        name: "US East Primary",
        region: "us-east-1",
        provider: "AWS",
        ipAddress: "34.201.45.78",
        os: "Ubuntu 22.04",
        stack: ["Laravel", "Next.js"],
        status: "healthy",
        cpu: 32,
        ram: 64,
        disk: 42,
        websites: 145,
      },
      {
        id: "srv-eu-west-1",
        name: "EU West Primary",
        region: "eu-west-1",
        provider: "AWS",
        ipAddress: "52.18.90.23",
        os: "Ubuntu 22.04",
        stack: ["Laravel", "WordPress"],
        status: "healthy",
        cpu: 28,
        ram: 58,
        disk: 38,
        websites: 132,
      },
      {
        id: "srv-ap-south-1",
        name: "AP South Secondary",
        region: "ap-south-1",
        provider: "DigitalOcean",
        ipAddress: "103.145.23.67",
        os: "Debian 11",
        stack: ["Next.js"],
        status: "degraded",
        cpu: 72,
        ram: 85,
        disk: 91,
        websites: 98,
      },
    ] as const;

    for (const server of servers) {
      await pool.query(
        `
          INSERT INTO infra_servers (
            id, name, region, provider, ip_address, operating_system,
            stack_support, status, cpu_usage, ram_usage, disk_usage,
            websites_count, last_sync_at, provisioning_enabled
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)
        `,
        [
          server.id,
          server.name,
          server.region,
          server.provider,
          server.ipAddress,
          server.os,
          JSON.stringify(server.stack),
          server.status,
          server.cpu,
          server.ram,
          server.disk,
          server.websites,
        ],
      );
    }
  }

  const [profilesCountRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM provisioning_profiles",
  );
  if ((profilesCountRows[0]?.total || 0) === 0) {
    const profiles = [
      {
        id: "prf-nextjs-premium",
        name: "Next.js Premium",
        stack: "Next.js",
        method: "Docker",
        server: "US East Primary",
        database: "Managed",
        domain: "Auto",
        ssl: "Let's Encrypt",
        status: "active",
        websites: 456,
      },
      {
        id: "prf-laravel-standard",
        name: "Laravel Standard",
        stack: "Laravel",
        method: "Traditional",
        server: "EU West Primary",
        database: "Server",
        domain: "Manual",
        ssl: "Let's Encrypt",
        status: "active",
        websites: 234,
      },
      {
        id: "prf-wordpress-basic",
        name: "WordPress Basic",
        stack: "WordPress",
        method: "Traditional",
        server: "AP South Secondary",
        database: "Managed",
        domain: "Auto",
        ssl: "Let's Encrypt",
        status: "disabled",
        websites: 123,
      },
    ] as const;

    for (const profile of profiles) {
      await pool.query(
        `
          INSERT INTO provisioning_profiles (
            id, name, stack_type, deployment_method, target_server_name,
            database_strategy, domain_strategy, ssl_strategy, status, websites_count
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          profile.id,
          profile.name,
          profile.stack,
          profile.method,
          profile.server,
          profile.database,
          profile.domain,
          profile.ssl,
          profile.status,
          profile.websites,
        ],
      );
    }
  }

  const [rulesCountRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM deployment_rules",
  );
  if ((rulesCountRows[0]?.total || 0) === 0) {
    const rules = [
      {
        id: "rule-auto-retry",
        name: "Auto-retry Failed Provisioning",
        condition: "Provisioning fails",
        action: "Retry after 5 minutes",
        enabled: 1,
        priority: 1,
      },
      {
        id: "rule-wordpress-pool",
        name: "WordPress Isolation Pool",
        condition: "Stack = WordPress",
        action: "Deploy to isolated server group",
        enabled: 1,
        priority: 2,
      },
      {
        id: "rule-server-capacity",
        name: "Auto-upgrade Server on Capacity",
        condition: "Server CPU/RAM > 85%",
        action: "Schedule upgrade and notify",
        enabled: 0,
        priority: 3,
      },
    ] as const;

    for (const rule of rules) {
      await pool.query(
        `
          INSERT INTO deployment_rules (id, name, condition_text, action_text, enabled, priority)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [rule.id, rule.name, rule.condition, rule.action, rule.enabled, rule.priority],
      );
    }
  }

  const [jobsCountRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM scheduled_jobs",
  );
  if ((jobsCountRows[0]?.total || 0) === 0) {
    const jobs = [
      {
        id: "cron-daily-backup",
        name: "Daily Backup",
        schedule: "Every day at 3:00 AM",
        type: "backup",
        status: "completed",
      },
      {
        id: "cron-hourly-health",
        name: "Hourly Health Check",
        schedule: "Every hour",
        type: "health-check",
        status: "completed",
      },
      {
        id: "cron-ssl-renewal",
        name: "SSL Certificate Renewal",
        schedule: "Every day at 2:00 AM",
        type: "ssl-renewal",
        status: "pending",
      },
    ] as const;

    for (const job of jobs) {
      await pool.query(
        `
          INSERT INTO scheduled_jobs (
            id, name, schedule_text, job_type, last_run_at, next_run_at, status, enabled
          )
          VALUES (
            ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 1 HOUR), ?, 1
          )
        `,
        [job.id, job.name, job.schedule, job.type, job.status],
      );
    }
  }

  await pool.query(
    `
      INSERT INTO webhook_configs (id, url, events_json, enabled)
      VALUES (1, NULL, ?, 0)
      ON DUPLICATE KEY UPDATE id = id
    `,
    [JSON.stringify(["provisioning_started", "provisioning_completed", "provisioning_failed"])],
  );

  const [backupRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM backup_records",
  );
  if ((backupRows[0]?.total || 0) === 0) {
    const backups = [
      ["bak-001", "TechCorp Solution", "US East Primary", 2458, "completed", "full", 90],
      ["bak-002", "Design Studio Pro", "EU West Primary", 1843, "completed", "full", 89],
      ["bak-003", "E-Shop Elite", "US East Primary", 3280, "pending", "full", 90],
      ["bak-004", "Restaurant Hub", "AP South Secondary", 892, "completed", "incremental", 88],
    ] as const;

    for (const backup of backups) {
      await pool.query(
        `
          INSERT INTO backup_records (
            id, website_name, server_name, size_mb, status, backup_type,
            created_at, expires_at, download_url
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL ? DAY), NULL
          )
        `,
        backup,
      );
    }
  }

  const [alertsRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM monitoring_alerts",
  );
  if ((alertsRows[0]?.total || 0) === 0) {
    const alerts = [
      [
        "alert-site-down",
        "uptime",
        "warning",
        "Site Down - E-Shop Elite",
        "50 minute outage detected",
        "E-Shop Elite",
        null,
      ],
      [
        "alert-ssl-expiry",
        "ssl",
        "critical",
        "SSL Certificate Expires Soon",
        "Restaurant Hub SSL expires in 14 days",
        "Restaurant Hub",
        null,
      ],
      [
        "alert-high-cpu",
        "cpu",
        "warning",
        "High CPU Usage",
        "US East Primary at 85% CPU for 30 minutes",
        null,
        "US East Primary",
      ],
    ] as const;

    for (const alert of alerts) {
      await pool.query(
        `
          INSERT INTO monitoring_alerts (
            id, alert_type, severity, title, description, website_name, server_name, is_active, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR))
        `,
        alert,
      );
    }
  }

  const [incidentsRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM monitoring_incidents",
  );
  if ((incidentsRows[0]?.total || 0) === 0) {
    const incidents = [
      [
        "inc-domain-verification",
        "Domain Verification Failed",
        "critical",
        "open",
        3,
      ],
      [
        "inc-db-timeout",
        "Database Connection Timeout",
        "warning",
        "resolved",
        1,
      ],
    ] as const;

    for (const incident of incidents) {
      await pool.query(
        `
          INSERT INTO monitoring_incidents (
            id, title, severity, status, occurrences, started_at,
            resolved_at
          )
          VALUES (
            ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 6 HOUR),
            CASE WHEN ? = 'resolved' THEN DATE_SUB(NOW(), INTERVAL 2 HOUR) ELSE NULL END
          )
        `,
        [...incident, incident[3]],
      );
    }
  }

  const [queueRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM provisioning_queue_jobs",
  );
  if ((queueRows[0]?.total || 0) === 0) {
    const jobs = [
      [
        "job-001",
        "TechCorp Solution",
        "running",
        65,
        "Configuring environment variables",
        "US East Primary",
        2,
        null,
        0,
      ],
      [
        "job-002",
        "Design Studio Pro",
        "running",
        42,
        "Copying files to server",
        "EU West Primary",
        5,
        null,
        0,
      ],
      [
        "job-003",
        "E-Shop Elite",
        "pending",
        0,
        "Waiting in queue",
        "US East Primary",
        12,
        null,
        0,
      ],
      [
        "job-004",
        "Restaurant Hub",
        "failed",
        0,
        "Database connection failed",
        "AP South Secondary",
        null,
        "Database connection failed",
        2,
      ],
    ] as const;

    for (const job of jobs) {
      await pool.query(
        `
          INSERT INTO provisioning_queue_jobs (
            id, website_name, status, progress_percent, step_text, server_name,
            created_at, eta_minutes, error_message, retry_count
          )
          VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 1 HOUR), ?, ?, ?)
        `,
        job,
      );
    }
  }

  const [mappingRows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM template_mappings",
  );
  if ((mappingRows[0]?.total || 0) === 0) {
    const templates = await listTemplates({ includeInactive: true });
    const [profileRows] = await pool.query<Array<{ name: string }>>(
      `
        SELECT name
        FROM provisioning_profiles
        ORDER BY created_at ASC
        LIMIT 2
      `,
    );
    const firstProfile = profileRows[0]?.name || "Next.js Premium";
    const secondProfile = profileRows[1]?.name || "Laravel Standard";
    const defaultPool = "US East Primary";

    for (let index = 0; index < Math.min(templates.length, 6); index += 1) {
      const template = templates[index];
      await pool.query(
        `
          INSERT INTO template_mappings (
            id, template_id, template_name, category, stack_type,
            profile_name, server_pool, pricing_monthly, featured, websites_count
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          `tm-${index + 1}`,
          template.id,
          template.name,
          template.category,
          template.stack,
          template.stack === "Laravel" ? secondProfile : firstProfile,
          defaultPool,
          Number(template.startingPrice || 39),
          template.featured ? 1 : 0,
          20 + index * 13,
        ],
      );
    }
  }
}

export async function listServers(): Promise<ServerRecord[]> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<ServerRow[]>(
    `
      SELECT
        id, name, region, provider, ip_address, operating_system,
        stack_support, status, cpu_usage, ram_usage, disk_usage,
        websites_count, last_sync_at, provisioning_enabled,
        created_at, updated_at
      FROM infra_servers
      ORDER BY created_at ASC
    `,
  );
  return rows.map(mapServer);
}

export async function getServerById(serverId: string): Promise<ServerRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<ServerRow[]>(
    `
      SELECT
        id, name, region, provider, ip_address, operating_system,
        stack_support, status, cpu_usage, ram_usage, disk_usage,
        websites_count, last_sync_at, provisioning_enabled,
        created_at, updated_at
      FROM infra_servers
      WHERE id = ?
      LIMIT 1
    `,
    [serverId],
  );
  return rows[0] ? mapServer(rows[0]) : null;
}

export async function createServer(input: {
  name: string;
  region: string;
  provider: string;
  ipAddress: string;
  operatingSystem: string;
  stackSupport: string[];
  status?: ServerStatus;
}): Promise<ServerRecord> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const id = `srv-${randomUUID().slice(0, 8)}`;

  await pool.query(
    `
      INSERT INTO infra_servers (
        id, name, region, provider, ip_address, operating_system,
        stack_support, status, cpu_usage, ram_usage, disk_usage,
        websites_count, last_sync_at, provisioning_enabled
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, NOW(), 1)
    `,
    [
      id,
      input.name.trim(),
      input.region.trim(),
      input.provider.trim(),
      input.ipAddress.trim(),
      input.operatingSystem.trim(),
      JSON.stringify(input.stackSupport || []),
      input.status || "healthy",
    ],
  );

  const server = await getServerById(id);
  if (!server) {
    throw new Error("Failed to create server");
  }
  return server;
}

export async function updateServer(
  serverId: string,
  updates: Partial<{
    name: string;
    region: string;
    provider: string;
    ipAddress: string;
    operatingSystem: string;
    stackSupport: string[];
    status: ServerStatus;
    cpuUsage: number;
    ramUsage: number;
    diskUsage: number;
    provisioningEnabled: boolean;
  }>,
): Promise<ServerRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const fields: string[] = [];
  const values: Array<string | number> = [];

  if (typeof updates.name === "string") {
    fields.push("name = ?");
    values.push(updates.name.trim());
  }
  if (typeof updates.region === "string") {
    fields.push("region = ?");
    values.push(updates.region.trim());
  }
  if (typeof updates.provider === "string") {
    fields.push("provider = ?");
    values.push(updates.provider.trim());
  }
  if (typeof updates.ipAddress === "string") {
    fields.push("ip_address = ?");
    values.push(updates.ipAddress.trim());
  }
  if (typeof updates.operatingSystem === "string") {
    fields.push("operating_system = ?");
    values.push(updates.operatingSystem.trim());
  }
  if (Array.isArray(updates.stackSupport)) {
    fields.push("stack_support = ?");
    values.push(JSON.stringify(updates.stackSupport));
  }
  if (typeof updates.status === "string") {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (typeof updates.cpuUsage === "number") {
    fields.push("cpu_usage = ?");
    values.push(Math.max(0, Math.min(100, Math.round(updates.cpuUsage))));
  }
  if (typeof updates.ramUsage === "number") {
    fields.push("ram_usage = ?");
    values.push(Math.max(0, Math.min(100, Math.round(updates.ramUsage))));
  }
  if (typeof updates.diskUsage === "number") {
    fields.push("disk_usage = ?");
    values.push(Math.max(0, Math.min(100, Math.round(updates.diskUsage))));
  }
  if (typeof updates.provisioningEnabled === "boolean") {
    fields.push("provisioning_enabled = ?");
    values.push(updates.provisioningEnabled ? 1 : 0);
  }

  if (fields.length > 0) {
    fields.push("last_sync_at = NOW()");
    values.push(serverId);
    await pool.query(
      `UPDATE infra_servers SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  return getServerById(serverId);
}

export async function deleteServer(serverId: string): Promise<boolean> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [result] = await pool.query("DELETE FROM infra_servers WHERE id = ?", [serverId]);
  return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
}

export async function listProvisioningProfiles(): Promise<ProvisioningProfileRecord[]> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<ProfileRow[]>(
    `
      SELECT
        id, name, stack_type, deployment_method, target_server_name,
        database_strategy, domain_strategy, ssl_strategy, status,
        websites_count, created_at, updated_at
      FROM provisioning_profiles
      ORDER BY created_at ASC
    `,
  );
  return rows.map(mapProfile);
}

export async function getProvisioningProfileById(
  profileId: string,
): Promise<ProvisioningProfileRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<ProfileRow[]>(
    `
      SELECT
        id, name, stack_type, deployment_method, target_server_name,
        database_strategy, domain_strategy, ssl_strategy, status,
        websites_count, created_at, updated_at
      FROM provisioning_profiles
      WHERE id = ?
      LIMIT 1
    `,
    [profileId],
  );
  return rows[0] ? mapProfile(rows[0]) : null;
}

export async function createProvisioningProfile(input: {
  name: string;
  stack: string;
  method: string;
  server: string;
  database: string;
  domain: string;
  ssl: string;
  status?: ProfileStatus;
}): Promise<ProvisioningProfileRecord> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const id = `prf-${randomUUID().slice(0, 8)}`;

  await pool.query(
    `
      INSERT INTO provisioning_profiles (
        id, name, stack_type, deployment_method, target_server_name,
        database_strategy, domain_strategy, ssl_strategy, status, websites_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `,
    [
      id,
      input.name.trim(),
      input.stack.trim(),
      input.method.trim(),
      input.server.trim(),
      input.database.trim(),
      input.domain.trim(),
      input.ssl.trim(),
      input.status || "active",
    ],
  );

  const profile = await getProvisioningProfileById(id);
  if (!profile) {
    throw new Error("Failed to create provisioning profile");
  }
  return profile;
}

export async function updateProvisioningProfile(
  profileId: string,
  updates: Partial<{
    name: string;
    stack: string;
    method: string;
    server: string;
    database: string;
    domain: string;
    ssl: string;
    status: ProfileStatus;
  }>,
): Promise<ProvisioningProfileRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const fields: string[] = [];
  const values: Array<string> = [];

  if (typeof updates.name === "string") {
    fields.push("name = ?");
    values.push(updates.name.trim());
  }
  if (typeof updates.stack === "string") {
    fields.push("stack_type = ?");
    values.push(updates.stack.trim());
  }
  if (typeof updates.method === "string") {
    fields.push("deployment_method = ?");
    values.push(updates.method.trim());
  }
  if (typeof updates.server === "string") {
    fields.push("target_server_name = ?");
    values.push(updates.server.trim());
  }
  if (typeof updates.database === "string") {
    fields.push("database_strategy = ?");
    values.push(updates.database.trim());
  }
  if (typeof updates.domain === "string") {
    fields.push("domain_strategy = ?");
    values.push(updates.domain.trim());
  }
  if (typeof updates.ssl === "string") {
    fields.push("ssl_strategy = ?");
    values.push(updates.ssl.trim());
  }
  if (typeof updates.status === "string") {
    fields.push("status = ?");
    values.push(updates.status);
  }

  if (fields.length > 0) {
    values.push(profileId);
    await pool.query(
      `UPDATE provisioning_profiles SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  return getProvisioningProfileById(profileId);
}

export async function deleteProvisioningProfile(profileId: string): Promise<boolean> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [result] = await pool.query(
    "DELETE FROM provisioning_profiles WHERE id = ?",
    [profileId],
  );
  return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
}

export async function listDeploymentRules(): Promise<DeploymentRuleRecord[]> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<RuleRow[]>(
    `
      SELECT id, name, condition_text, action_text, enabled, priority, created_at, updated_at
      FROM deployment_rules
      ORDER BY priority ASC, created_at ASC
    `,
  );
  return rows.map(mapRule);
}

export async function createDeploymentRule(input: {
  name: string;
  condition: string;
  action: string;
  enabled?: boolean;
  priority?: number;
}): Promise<DeploymentRuleRecord> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const id = `rule-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `
      INSERT INTO deployment_rules (id, name, condition_text, action_text, enabled, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      input.name.trim(),
      input.condition.trim(),
      input.action.trim(),
      input.enabled === false ? 0 : 1,
      input.priority || 1,
    ],
  );
  const rules = await listDeploymentRules();
  const rule = rules.find((item) => item.id === id);
  if (!rule) throw new Error("Failed to create deployment rule");
  return rule;
}

export async function updateDeploymentRule(
  ruleId: string,
  updates: Partial<{
    name: string;
    condition: string;
    action: string;
    enabled: boolean;
    priority: number;
  }>,
): Promise<DeploymentRuleRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const fields: string[] = [];
  const values: Array<string | number> = [];

  if (typeof updates.name === "string") {
    fields.push("name = ?");
    values.push(updates.name.trim());
  }
  if (typeof updates.condition === "string") {
    fields.push("condition_text = ?");
    values.push(updates.condition.trim());
  }
  if (typeof updates.action === "string") {
    fields.push("action_text = ?");
    values.push(updates.action.trim());
  }
  if (typeof updates.enabled === "boolean") {
    fields.push("enabled = ?");
    values.push(updates.enabled ? 1 : 0);
  }
  if (typeof updates.priority === "number") {
    fields.push("priority = ?");
    values.push(Math.max(1, Math.round(updates.priority)));
  }

  if (fields.length > 0) {
    values.push(ruleId);
    await pool.query(
      `UPDATE deployment_rules SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  const rules = await listDeploymentRules();
  return rules.find((item) => item.id === ruleId) || null;
}

export async function deleteDeploymentRule(ruleId: string): Promise<boolean> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [result] = await pool.query("DELETE FROM deployment_rules WHERE id = ?", [ruleId]);
  return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
}

export async function listScheduledJobs(): Promise<ScheduledJobRecord[]> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<ScheduledJobRow[]>(
    `
      SELECT
        id, name, schedule_text, job_type, last_run_at, next_run_at,
        status, enabled, created_at, updated_at
      FROM scheduled_jobs
      ORDER BY created_at ASC
    `,
  );
  return rows.map(mapScheduledJob);
}

export async function createScheduledJob(input: {
  name: string;
  schedule: string;
  type: string;
  status?: JobStatus;
  enabled?: boolean;
}): Promise<ScheduledJobRecord> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const id = `cron-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `
      INSERT INTO scheduled_jobs (
        id, name, schedule_text, job_type, last_run_at, next_run_at, status, enabled
      )
      VALUES (?, ?, ?, ?, NULL, DATE_ADD(NOW(), INTERVAL 1 HOUR), ?, ?)
    `,
    [
      id,
      input.name.trim(),
      input.schedule.trim(),
      input.type.trim(),
      input.status || "pending",
      input.enabled === false ? 0 : 1,
    ],
  );
  const jobs = await listScheduledJobs();
  const job = jobs.find((item) => item.id === id);
  if (!job) throw new Error("Failed to create scheduled job");
  return job;
}

export async function updateScheduledJob(
  jobId: string,
  updates: Partial<{
    name: string;
    schedule: string;
    type: string;
    status: JobStatus;
    enabled: boolean;
  }>,
): Promise<ScheduledJobRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const fields: string[] = [];
  const values: Array<string | number> = [];

  if (typeof updates.name === "string") {
    fields.push("name = ?");
    values.push(updates.name.trim());
  }
  if (typeof updates.schedule === "string") {
    fields.push("schedule_text = ?");
    values.push(updates.schedule.trim());
  }
  if (typeof updates.type === "string") {
    fields.push("job_type = ?");
    values.push(updates.type.trim());
  }
  if (typeof updates.status === "string") {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (typeof updates.enabled === "boolean") {
    fields.push("enabled = ?");
    values.push(updates.enabled ? 1 : 0);
  }
  if (updates.status === "completed") {
    fields.push("last_run_at = NOW()");
    fields.push("next_run_at = DATE_ADD(NOW(), INTERVAL 1 DAY)");
  }

  if (fields.length > 0) {
    values.push(jobId);
    await pool.query(
      `UPDATE scheduled_jobs SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  const jobs = await listScheduledJobs();
  return jobs.find((item) => item.id === jobId) || null;
}

export async function deleteScheduledJob(jobId: string): Promise<boolean> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [result] = await pool.query("DELETE FROM scheduled_jobs WHERE id = ?", [jobId]);
  return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
}

export async function getWebhookConfig(): Promise<WebhookConfigRecord> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<WebhookRow[]>(
    "SELECT id, url, events_json, enabled, updated_at FROM webhook_configs WHERE id = 1 LIMIT 1",
  );
  if (!rows[0]) {
    return { url: null, events: [], enabled: false, updatedAt: new Date().toISOString() };
  }
  return mapWebhook(rows[0]);
}

export async function updateWebhookConfig(updates: {
  url?: string | null;
  events?: string[];
  enabled?: boolean;
}): Promise<WebhookConfigRecord> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (Object.prototype.hasOwnProperty.call(updates, "url")) {
    fields.push("url = ?");
    values.push(updates.url || null);
  }
  if (Array.isArray(updates.events)) {
    fields.push("events_json = ?");
    values.push(JSON.stringify(updates.events));
  }
  if (typeof updates.enabled === "boolean") {
    fields.push("enabled = ?");
    values.push(updates.enabled ? 1 : 0);
  }

  if (fields.length > 0) {
    await pool.query(
      `UPDATE webhook_configs SET ${fields.join(", ")} WHERE id = 1`,
      values,
    );
  }

  return getWebhookConfig();
}

export async function getAutomationSnapshot() {
  const [rules, jobs, webhook] = await Promise.all([
    listDeploymentRules(),
    listScheduledJobs(),
    getWebhookConfig(),
  ]);

  return { rules, jobs, webhook };
}

export async function listBackups(): Promise<BackupRecord[]> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<BackupRow[]>(
    `
      SELECT
        id, website_name, server_name, size_mb, status,
        created_at, expires_at, backup_type
      FROM backup_records
      ORDER BY created_at DESC
      LIMIT 200
    `,
  );
  return rows.map(mapBackup);
}

export async function createBackup(input: {
  website: string;
  server: string;
  type?: BackupType;
}): Promise<BackupRecord> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const id = `bak-${randomUUID().slice(0, 8)}`;
  const sizeMb = Math.max(150, Math.round(Math.random() * 3200));

  await pool.query(
    `
      INSERT INTO backup_records (
        id, website_name, server_name, size_mb, status, backup_type, created_at, expires_at
      )
      VALUES (?, ?, ?, ?, 'pending', ?, NOW(), DATE_ADD(CURDATE(), INTERVAL 90 DAY))
    `,
    [id, input.website.trim(), input.server.trim(), sizeMb, input.type || "full"],
  );

  const [rows] = await pool.query<BackupRow[]>(
    `
      SELECT
        id, website_name, server_name, size_mb, status,
        created_at, expires_at, backup_type
      FROM backup_records
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );
  if (!rows[0]) throw new Error("Failed to create backup");
  return mapBackup(rows[0]);
}

export async function updateBackupStatus(
  backupId: string,
  status: BackupStatus,
): Promise<BackupRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  await pool.query("UPDATE backup_records SET status = ? WHERE id = ?", [status, backupId]);
  const [rows] = await pool.query<BackupRow[]>(
    `
      SELECT
        id, website_name, server_name, size_mb, status,
        created_at, expires_at, backup_type
      FROM backup_records
      WHERE id = ?
      LIMIT 1
    `,
    [backupId],
  );
  return rows[0] ? mapBackup(rows[0]) : null;
}

export async function getMonitoringSnapshot() {
  await ensureOperationsSchema();
  const pool = getMySQLPool();

  const [alertsRows, incidentsRows, serversRows] = await Promise.all([
    pool.query<AlertRow[]>(
      `
        SELECT
          id, alert_type, severity, title, description, website_name,
          server_name, is_active, created_at
        FROM monitoring_alerts
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT 50
      `,
    ),
    pool.query<IncidentRow[]>(
      `
        SELECT id, title, severity, status, occurrences, started_at
        FROM monitoring_incidents
        ORDER BY started_at DESC
        LIMIT 50
      `,
    ),
    pool.query<
      Array<{
        status: ServerStatus;
        cpu_avg: string | number;
        ram_avg: string | number;
        disk_avg: string | number;
      }>
    >(
      `
        SELECT
          status,
          AVG(cpu_usage) AS cpu_avg,
          AVG(ram_usage) AS ram_avg,
          AVG(disk_usage) AS disk_avg
        FROM infra_servers
        GROUP BY status
      `,
    ),
  ]);

  const alerts = alertsRows[0].map(mapAlert);
  const incidents = incidentsRows[0].map(mapIncident);

  const serviceStatus = [
    { service: "API Gateway", status: "operational" },
    { service: "Database Cluster", status: "operational" },
    { service: "DNS Resolution", status: "operational" },
    { service: "SSL Provider", status: "degraded" },
    { service: "Backup System", status: "operational" },
  ];

  const totalServers = serversRows[0].length || 1;
  const avgCpu =
    serversRows[0].reduce((sum, row) => sum + Number(row.cpu_avg || 0), 0) / totalServers;
  const avgRam =
    serversRows[0].reduce((sum, row) => sum + Number(row.ram_avg || 0), 0) / totalServers;
  const avgDisk =
    serversRows[0].reduce((sum, row) => sum + Number(row.disk_avg || 0), 0) / totalServers;

  return {
    alerts,
    incidents,
    serviceStatus,
    performance: {
      apiResponseTimeMs: 125,
      errorRatePct: 0.02,
      sslHealthPct: Math.max(10, Math.round(100 - avgDisk / 2)),
      cpuAvgPct: Math.round(avgCpu),
      ramAvgPct: Math.round(avgRam),
      diskAvgPct: Math.round(avgDisk),
    },
    uptime: {
      today: "99.9%",
      sevenDays: "99.8%",
      thirtyDays: "99.7%",
      allTime: "99.85%",
    },
  };
}

export async function listProvisioningQueueJobs(): Promise<QueueJobRecord[]> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<QueueRow[]>(
    `
      SELECT
        id, website_name, status, progress_percent, step_text, server_name,
        created_at, eta_minutes, error_message, retry_count
      FROM provisioning_queue_jobs
      ORDER BY created_at DESC
      LIMIT 200
    `,
  );
  return rows.map(mapQueueJob);
}

export async function createProvisioningQueueJob(input: {
  id: string;
  websiteName: string;
  serverName: string;
  status?: QueueStatus;
  progress?: number;
  step?: string;
  etaMinutes?: number | null;
  error?: string | null;
  retries?: number;
}): Promise<QueueJobRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();

  await pool.query(
    `
      INSERT INTO provisioning_queue_jobs (
        id, website_name, status, progress_percent, step_text, server_name,
        eta_minutes, error_message, retry_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        website_name = VALUES(website_name),
        status = VALUES(status),
        progress_percent = VALUES(progress_percent),
        step_text = VALUES(step_text),
        server_name = VALUES(server_name),
        eta_minutes = VALUES(eta_minutes),
        error_message = VALUES(error_message),
        retry_count = VALUES(retry_count)
    `,
    [
      input.id,
      input.websiteName,
      input.status || "pending",
      Math.max(0, Math.min(100, Math.round(input.progress || 0))),
      input.step || "Queued for provisioning",
      input.serverName,
      input.etaMinutes ?? null,
      input.error ?? null,
      Math.max(0, Math.round(input.retries || 0)),
    ],
  );

  return updateProvisioningQueueJob(input.id, {});
}

export async function updateProvisioningQueueJob(
  jobId: string,
  updates: Partial<{
    status: QueueStatus;
    progress: number;
    step: string;
    etaMinutes: number | null;
    error: string | null;
    retries: number;
  }>,
): Promise<QueueJobRecord | null> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (typeof updates.status === "string") {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (typeof updates.progress === "number") {
    fields.push("progress_percent = ?");
    values.push(Math.max(0, Math.min(100, Math.round(updates.progress))));
  }
  if (typeof updates.step === "string") {
    fields.push("step_text = ?");
    values.push(updates.step.trim());
  }
  if (Object.prototype.hasOwnProperty.call(updates, "etaMinutes")) {
    fields.push("eta_minutes = ?");
    values.push(updates.etaMinutes ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "error")) {
    fields.push("error_message = ?");
    values.push(updates.error ?? null);
  }
  if (typeof updates.retries === "number") {
    fields.push("retry_count = ?");
    values.push(Math.max(0, Math.round(updates.retries)));
  }

  if (fields.length > 0) {
    values.push(jobId);
    await pool.query(
      `UPDATE provisioning_queue_jobs SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  const [rows] = await pool.query<QueueRow[]>(
    `
      SELECT
        id, website_name, status, progress_percent, step_text, server_name,
        created_at, eta_minutes, error_message, retry_count
      FROM provisioning_queue_jobs
      WHERE id = ?
      LIMIT 1
    `,
    [jobId],
  );
  return rows[0] ? mapQueueJob(rows[0]) : null;
}

export async function getProvisioningQueueSnapshot() {
  const jobs = await listProvisioningQueueJobs();
  const running = jobs.filter((item) => item.status === "running");
  const pending = jobs.filter((item) => item.status === "pending");
  const failed = jobs.filter((item) => item.status === "failed");
  return {
    jobs,
    running,
    pending,
    failed,
    stats: {
      running: running.length,
      pending: pending.length,
      failed: failed.length,
      queueHealth: Math.max(0, 100 - failed.length * 8),
    },
  };
}

export async function listTemplateMappings(): Promise<TemplateMappingRecord[]> {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<TemplateMappingRow[]>(
    `
      SELECT
        id, template_name, category, stack_type, profile_name, server_pool,
        pricing_monthly, featured, websites_count
      FROM template_mappings
      ORDER BY featured DESC, websites_count DESC
      LIMIT 200
    `,
  );
  return rows.map(mapTemplateMapping);
}

export async function getTemplateMappingSnapshot() {
  const mappings = await listTemplateMappings();
  const pools = new Map<string, { templates: number; websites: number }>();

  for (const mapping of mappings) {
    const current = pools.get(mapping.serverPool) || { templates: 0, websites: 0 };
    current.templates += 1;
    current.websites += mapping.websites;
    pools.set(mapping.serverPool, current);
  }

  return {
    mappings,
    stats: {
      totalTemplates: mappings.length,
      totalWebsites: mappings.reduce((sum, item) => sum + item.websites, 0),
      featuredCount: mappings.filter((item) => item.featured).length,
    },
    poolDistribution: [...pools.entries()].map(([pool, value]) => ({
      pool,
      templates: value.templates,
      websites: value.websites,
    })),
  };
}

async function ensureUserPreferences(userId: string) {
  await ensureOperationsSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<UserPreferenceRow[]>(
    `
      SELECT
        user_id, phone, first_name, last_name, company,
        email_notifications, maintenance_alerts, weekly_reports,
        two_factor, api_key
      FROM user_preferences
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  if (rows[0]) {
    return rows[0];
  }

  await pool.query(
    `
      INSERT INTO user_preferences (
        user_id, phone, first_name, last_name, company,
        email_notifications, maintenance_alerts, weekly_reports, two_factor, api_key
      )
      VALUES (?, NULL, NULL, NULL, NULL, 1, 1, 0, 0, ?)
    `,
    [userId, generateApiKey()],
  );

  const [freshRows] = await pool.query<UserPreferenceRow[]>(
    `
      SELECT
        user_id, phone, first_name, last_name, company,
        email_notifications, maintenance_alerts, weekly_reports,
        two_factor, api_key
      FROM user_preferences
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  if (!freshRows[0]) {
    throw new Error("Failed to initialize user preferences");
  }

  return freshRows[0];
}

export async function getUserSettings(userId: string) {
  const user = await findUserById(userId);
  if (!user) return null;
  const pref = await ensureUserPreferences(userId);

  const [firstName, ...restNames] = (user.fullName || "").split(" ");
  const lastName = restNames.join(" ").trim();

  return {
    email: user.email,
    phone: pref.phone || "",
    firstName: pref.first_name || firstName || "",
    lastName: pref.last_name || lastName || "",
    company: pref.company || user.companyName || "",
    apiKey: pref.api_key,
    emailNotifications: toBool(pref.email_notifications),
    maintenanceAlerts: toBool(pref.maintenance_alerts),
    weeklyReports: toBool(pref.weekly_reports),
    twoFactor: toBool(pref.two_factor),
  };
}

export async function updateUserSettings(
  userId: string,
  updates: Partial<{
    phone: string;
    firstName: string;
    lastName: string;
    company: string;
    emailNotifications: boolean;
    maintenanceAlerts: boolean;
    weeklyReports: boolean;
    twoFactor: boolean;
    regenerateApiKey: boolean;
  }>,
) {
  await ensureUserPreferences(userId);
  const pool = getMySQLPool();
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (typeof updates.phone === "string") {
    fields.push("phone = ?");
    values.push(updates.phone.trim() || null);
  }
  if (typeof updates.firstName === "string") {
    fields.push("first_name = ?");
    values.push(updates.firstName.trim() || null);
  }
  if (typeof updates.lastName === "string") {
    fields.push("last_name = ?");
    values.push(updates.lastName.trim() || null);
  }
  if (typeof updates.company === "string") {
    fields.push("company = ?");
    values.push(updates.company.trim() || null);
  }
  if (typeof updates.emailNotifications === "boolean") {
    fields.push("email_notifications = ?");
    values.push(updates.emailNotifications ? 1 : 0);
  }
  if (typeof updates.maintenanceAlerts === "boolean") {
    fields.push("maintenance_alerts = ?");
    values.push(updates.maintenanceAlerts ? 1 : 0);
  }
  if (typeof updates.weeklyReports === "boolean") {
    fields.push("weekly_reports = ?");
    values.push(updates.weeklyReports ? 1 : 0);
  }
  if (typeof updates.twoFactor === "boolean") {
    fields.push("two_factor = ?");
    values.push(updates.twoFactor ? 1 : 0);
  }
  if (updates.regenerateApiKey === true) {
    fields.push("api_key = ?");
    values.push(generateApiKey());
  }

  if (fields.length > 0) {
    values.push(userId);
    await pool.query(
      `
        UPDATE user_preferences
        SET ${fields.join(", ")}
        WHERE user_id = ?
      `,
      values,
    );
  }

  const nameParts = [
    typeof updates.firstName === "string" ? updates.firstName.trim() : "",
    typeof updates.lastName === "string" ? updates.lastName.trim() : "",
  ].filter(Boolean);

  if (
    typeof updates.firstName === "string" ||
    typeof updates.lastName === "string" ||
    typeof updates.company === "string"
  ) {
    await pool.query(
      `
        UPDATE users
        SET
          full_name = COALESCE(?, full_name),
          company_name = COALESCE(?, company_name)
        WHERE id = ?
      `,
      [
        nameParts.length > 0 ? nameParts.join(" ") : null,
        typeof updates.company === "string" ? updates.company.trim() || null : null,
        userId,
      ],
    );
  }

  return getUserSettings(userId);
}
