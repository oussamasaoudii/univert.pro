import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureCoreSchema } from "@/lib/mysql/schema";
import {
  publishAdminNotificationCreated,
  publishUserNotificationCreated,
} from "@/lib/realtime/publishers";

export type TemplateCategory =
  | "corporate"
  | "agency"
  | "portfolio"
  | "ecommerce"
  | "restaurant"
  | "saas"
  | "marketplace";

export type TemplateStack = "Laravel" | "Next.js" | "WordPress";
export type WebsiteStatus =
  | "pending"
  | "provisioning"
  | "ready"
  | "suspended"
  | "failed";

export type TemplateRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: TemplateCategory;
  stack: TemplateStack;
  previewImageUrl: string | null;
  liveDemoUrl: string | null;
  startingPrice: number;
  performanceScore: number;
  featured: boolean;
  isActive: boolean;
  templateSourcePath: string | null;
  deploymentProfile: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WebsiteRecord = {
  id: string;
  userId: string;
  ownerEmail: string | null;
  templateId: string | null;
  templateName: string;
  templateStack: TemplateStack;
  projectName: string;
  status: WebsiteStatus;
  subdomain: string;
  customDomain: string | null;
  liveUrl: string | null;
  dashboardUrl: string | null;
  provisioningJobId: string | null;
  provisioningError: string | null;
  renewalDate: string | null;
  pageViews: number;
  visits: number;
  avgSessionDuration: string;
  createdAt: string;
  updatedAt: string;
};

export type UserSubscriptionRecord = {
  id: string;
  userId: string;
  planName: string;
  status: "trialing" | "active" | "past_due" | "cancelled";
  billingCycle: "monthly" | "yearly";
  renewalDate: string;
  createdAt: string;
  updatedAt: string;
};

export type UserActivityRecord = {
  id: string;
  userId: string;
  activityType: string;
  message: string;
  createdAt: string;
};

export type UserNotificationRecord = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type AdminNotificationRecord = {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string | null;
  read: boolean;
  createdAt: string;
};

type TemplateRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: TemplateCategory;
  stack: TemplateStack;
  preview_image_url: string | null;
  live_demo_url: string | null;
  starting_price: number | string;
  performance_score: number | string;
  featured: number | boolean;
  is_active: number | boolean;
  template_source_path: string | null;
  deployment_profile: string | null;
  created_at: string;
  updated_at: string;
};

type WebsiteRow = {
  id: string;
  user_id: string;
  owner_email: string | null;
  template_id: string | null;
  template_name: string | null;
  template_stack: TemplateStack | null;
  project_name: string;
  status: WebsiteStatus;
  subdomain: string;
  custom_domain: string | null;
  live_url: string | null;
  dashboard_url: string | null;
  provisioning_job_id: string | null;
  provisioning_error: string | null;
  renewal_date: string | null;
  page_views: number;
  visits: number;
  avg_session_duration: string | null;
  created_at: string;
  updated_at: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_name: string;
  status: "trialing" | "active" | "past_due" | "cancelled";
  billing_cycle: "monthly" | "yearly";
  renewal_date: string;
  created_at: string;
  updated_at: string;
};

type ActivityRow = {
  id: string;
  user_id: string;
  activity_type: string;
  message: string;
  created_at: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: number | boolean;
  created_at: string;
};

type AdminNotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: string | null;
  is_read: number | boolean;
  created_at: string;
};

type AdminRecipientRow = {
  id: string;
};

let platformSchemaPromise: Promise<void> | null = null;
let platformSchemaInitialized = false;

async function checkPlatformTablesExist(): Promise<boolean> {
  try {
    const pool = getMySQLPool();
    if (!pool) return true; // Skip DDL if no pool
    await pool.query(`SELECT 1 FROM templates LIMIT 1`);
    return true;
  } catch (error: unknown) {
    const mysqlError = error as { code?: string };
    if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
      return false;
    }
    return true; // Assume exists to avoid DDL on permission errors
  }
}

function normalizeTemplate(row: TemplateRow): TemplateRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category,
    stack: row.stack,
    previewImageUrl: row.preview_image_url,
    liveDemoUrl: row.live_demo_url,
    startingPrice: Number(row.starting_price || 0),
    performanceScore: Number(row.performance_score || 0),
    featured: row.featured === 1 || row.featured === true,
    isActive: row.is_active === 1 || row.is_active === true,
    templateSourcePath: row.template_source_path,
    deploymentProfile: row.deployment_profile,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeWebsite(row: WebsiteRow): WebsiteRecord {
  return {
    id: row.id,
    userId: row.user_id,
    ownerEmail: row.owner_email,
    templateId: row.template_id,
    templateName: row.template_name || "Custom Template",
    templateStack: row.template_stack || "Next.js",
    projectName: row.project_name,
    status: row.status,
    subdomain: row.subdomain,
    customDomain: row.custom_domain,
    liveUrl: row.live_url,
    dashboardUrl: row.dashboard_url,
    provisioningJobId: row.provisioning_job_id,
    provisioningError: row.provisioning_error,
    renewalDate: row.renewal_date,
    pageViews: Number(row.page_views || 0),
    visits: Number(row.visits || 0),
    avgSessionDuration: row.avg_session_duration || "0:00",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeSubscription(row: SubscriptionRow): UserSubscriptionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    planName: row.plan_name,
    status: row.status,
    billingCycle: row.billing_cycle,
    renewalDate: row.renewal_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeActivity(row: ActivityRow): UserActivityRecord {
  return {
    id: row.id,
    userId: row.user_id,
    activityType: row.activity_type,
    message: row.message,
    createdAt: row.created_at,
  };
}

function normalizeNotification(row: NotificationRow): UserNotificationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    read: row.is_read === 1 || row.is_read === true,
    createdAt: row.created_at,
  };
}

function normalizeAdminNotification(
  row: AdminNotificationRow,
): AdminNotificationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    category: row.category,
    read: row.is_read === 1 || row.is_read === true,
    createdAt: row.created_at,
  };
}

function toSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `template-${Date.now().toString(36)}`;
}

export async function ensurePlatformDataSchema(): Promise<void> {
  if (platformSchemaInitialized) {
    return;
  }
  
  if (!platformSchemaPromise) {
    platformSchemaPromise = initializePlatformDataSchema();
  }

  return platformSchemaPromise;
}

async function initializePlatformDataSchema() {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  
  // Check if tables already exist (pre-created via migration script)
  const tablesExist = await checkPlatformTablesExist();
  
  if (tablesExist) {
    // Tables exist, just seed default data if needed
    await seedDefaultTemplates();
    platformSchemaInitialized = true;
    return;
  }
  
  // Tables don't exist, try to create them

  await pool.query(`
    CREATE TABLE IF NOT EXISTS templates (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      slug VARCHAR(191) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      category ENUM('corporate', 'agency', 'portfolio', 'ecommerce', 'restaurant', 'saas', 'marketplace') NOT NULL,
      stack ENUM('Laravel', 'Next.js', 'WordPress') NOT NULL DEFAULT 'Next.js',
      preview_image_url TEXT NULL,
      live_demo_url TEXT NULL,
      starting_price DECIMAL(10,2) NOT NULL DEFAULT 29.00,
      performance_score DECIMAL(3,1) NOT NULL DEFAULT 4.5,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      template_source_path TEXT NULL,
      deployment_profile VARCHAR(64) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_templates_category (category),
      INDEX idx_templates_stack (stack),
      INDEX idx_templates_featured (featured),
      INDEX idx_templates_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS websites (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      template_id CHAR(36) NULL,
      project_name VARCHAR(191) NOT NULL,
      status ENUM('pending', 'provisioning', 'ready', 'suspended', 'failed') NOT NULL DEFAULT 'pending',
      subdomain VARCHAR(191) NOT NULL UNIQUE,
      custom_domain VARCHAR(191) NULL,
      live_url TEXT NULL,
      dashboard_url TEXT NULL,
      provisioning_job_id CHAR(36) NULL,
      provisioning_error TEXT NULL,
      renewal_date DATE NULL,
      page_views INT NOT NULL DEFAULT 0,
      visits INT NOT NULL DEFAULT 0,
      avg_session_duration VARCHAR(16) NOT NULL DEFAULT '0:00',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_websites_user_id (user_id),
      INDEX idx_websites_status (status),
      INDEX idx_websites_template_id (template_id),
      CONSTRAINT fk_websites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_websites_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    ALTER TABLE templates
      ADD COLUMN IF NOT EXISTS template_source_path TEXT NULL,
      ADD COLUMN IF NOT EXISTS deployment_profile VARCHAR(64) NULL
  `);

  await pool.query(`
    ALTER TABLE websites
      ADD COLUMN IF NOT EXISTS provisioning_job_id CHAR(36) NULL,
      ADD COLUMN IF NOT EXISTS provisioning_error TEXT NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL UNIQUE,
      plan_name VARCHAR(32) NOT NULL DEFAULT 'starter',
      status ENUM('trialing', 'active', 'past_due', 'cancelled') NOT NULL DEFAULT 'active',
      billing_cycle ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
      renewal_date DATE NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_activities (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      activity_type VARCHAR(64) NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_activities_user (user_id),
      INDEX idx_activities_created (created_at),
      CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_notifications (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      title VARCHAR(191) NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notifications_user (user_id),
      INDEX idx_notifications_read (is_read),
      CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      title VARCHAR(191) NOT NULL,
      message TEXT NOT NULL,
      category VARCHAR(80) NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin_notifications_user (user_id),
      INDEX idx_admin_notifications_read (is_read),
      INDEX idx_admin_notifications_category (category),
      CONSTRAINT fk_admin_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await seedDefaultTemplates();
  platformSchemaInitialized = true;
}

async function seedDefaultTemplates() {
  const pool = getMySQLPool();
  const [rows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM templates",
  );

  if ((rows[0]?.total || 0) > 0) {
    return;
  }

  const templates = [
    {
      name: "Corporate Pro",
      slug: "corporate-pro",
      description: "Modern corporate website with multi-page layout and CMS blocks.",
      category: "corporate",
      stack: "Next.js",
      startingPrice: 39,
      performanceScore: 4.8,
      featured: 1,
    },
    {
      name: "Agency Momentum",
      slug: "agency-momentum",
      description: "High-converting agency template with portfolio and lead forms.",
      category: "agency",
      stack: "Next.js",
      startingPrice: 49,
      performanceScore: 4.7,
      featured: 1,
    },
    {
      name: "Storefront Plus",
      slug: "storefront-plus",
      description: "Ecommerce storefront with optimized product pages and checkout.",
      category: "ecommerce",
      stack: "WordPress",
      startingPrice: 59,
      performanceScore: 4.6,
      featured: 0,
    },
    {
      name: "SaaS Launch",
      slug: "saas-launch",
      description: "SaaS landing page with pricing, FAQ, and blog-ready sections.",
      category: "saas",
      stack: "Next.js",
      startingPrice: 45,
      performanceScore: 4.7,
      featured: 1,
    },
    {
      name: "Restaurant Prime",
      slug: "restaurant-prime",
      description: "Restaurant template with menu, booking, and gallery modules.",
      category: "restaurant",
      stack: "Laravel",
      startingPrice: 35,
      performanceScore: 4.5,
      featured: 0,
    },
  ] as const;

  for (const template of templates) {
    await pool.query(
      `
      INSERT INTO templates (
        id, name, slug, description, category, stack,
        starting_price, performance_score, featured, is_active,
        template_source_path, deployment_profile
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, NULL)
    `,
      [
        randomUUID(),
        template.name,
        template.slug,
        template.description,
        template.category,
        template.stack,
        template.startingPrice,
        template.performanceScore,
        template.featured,
      ],
    );
  }
}

export async function listTemplates(options?: {
  search?: string;
  includeInactive?: boolean;
}): Promise<TemplateRecord[]> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const search = options?.search?.trim().toLowerCase();
  const includeInactive = options?.includeInactive === true;

  let whereSql = "WHERE 1=1";
  const values: unknown[] = [];

  if (!includeInactive) {
    whereSql += " AND t.is_active = 1";
  }

  if (search) {
    whereSql +=
      " AND (LOWER(t.name) LIKE ? OR LOWER(t.category) LIKE ? OR LOWER(t.stack) LIKE ?)";
    const like = `%${search}%`;
    values.push(like, like, like);
  }

  const [rows] = await pool.query<TemplateRow[]>(
    `
      SELECT
        t.id,
        t.name,
        t.slug,
        t.description,
        t.category,
        t.stack,
        t.preview_image_url,
        t.live_demo_url,
        t.starting_price,
        t.performance_score,
        t.featured,
        t.is_active,
        t.template_source_path,
        t.deployment_profile,
        t.created_at,
        t.updated_at
      FROM templates t
      ${whereSql}
      ORDER BY t.featured DESC, t.created_at DESC
    `,
    values,
  );

  return rows.map(normalizeTemplate);
}

export async function getTemplateById(
  templateId: string,
  options?: { includeInactive?: boolean },
): Promise<TemplateRecord | null> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const includeInactive = options?.includeInactive === true;

  const [rows] = await pool.query<TemplateRow[]>(
    `
      SELECT
        id,
        name,
        slug,
        description,
        category,
        stack,
        preview_image_url,
        live_demo_url,
        starting_price,
        performance_score,
        featured,
        is_active,
        template_source_path,
        deployment_profile,
        created_at,
        updated_at
      FROM templates
      WHERE id = ?
        ${includeInactive ? "" : "AND is_active = 1"}
      LIMIT 1
    `,
    [templateId],
  );

  return rows[0] ? normalizeTemplate(rows[0]) : null;
}

export async function createTemplate(input: {
  name: string;
  description: string;
  category: TemplateCategory;
  stack: TemplateStack;
  startingPrice: number;
  performanceScore?: number;
  featured?: boolean;
  isActive?: boolean;
  liveDemoUrl?: string | null;
  previewImageUrl?: string | null;
  templateSourcePath?: string | null;
  deploymentProfile?: string | null;
}): Promise<TemplateRecord> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  const id = randomUUID();
  const baseSlug = toSlug(input.name);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const [existing] = await pool.query<Array<{ id: string }>>(
      "SELECT id FROM templates WHERE slug = ? LIMIT 1",
      [slug],
    );

    if (!existing[0]) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  await pool.query(
    `
      INSERT INTO templates (
        id, name, slug, description, category, stack,
        preview_image_url, live_demo_url,
        starting_price, performance_score,
        featured, is_active,
        template_source_path, deployment_profile
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      input.name.trim(),
      slug,
      input.description.trim(),
      input.category,
      input.stack,
      input.previewImageUrl || null,
      input.liveDemoUrl || null,
      Number(input.startingPrice),
      Number(input.performanceScore || 4.5),
      input.featured ? 1 : 0,
      input.isActive === false ? 0 : 1,
      input.templateSourcePath || null,
      input.deploymentProfile || null,
    ],
  );

  const [rows] = await pool.query<TemplateRow[]>(
    `
      SELECT
        id, name, slug, description, category, stack,
        preview_image_url, live_demo_url, starting_price,
        performance_score, featured, is_active,
        template_source_path, deployment_profile,
        created_at, updated_at
      FROM templates
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  if (!rows[0]) {
    throw new Error("Template creation failed");
  }

  return normalizeTemplate(rows[0]);
}

export async function updateTemplate(
  templateId: string,
  updates: Partial<{
    name: string;
    description: string;
    category: TemplateCategory;
    stack: TemplateStack;
    startingPrice: number;
    performanceScore: number;
    featured: boolean;
    isActive: boolean;
    liveDemoUrl: string | null;
    previewImageUrl: string | null;
    templateSourcePath: string | null;
    deploymentProfile: string | null;
  }>,
): Promise<TemplateRecord | null> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (typeof updates.name === "string" && updates.name.trim()) {
    fields.push("name = ?");
    values.push(updates.name.trim());
  }
  if (typeof updates.description === "string") {
    fields.push("description = ?");
    values.push(updates.description.trim());
  }
  if (updates.category) {
    fields.push("category = ?");
    values.push(updates.category);
  }
  if (updates.stack) {
    fields.push("stack = ?");
    values.push(updates.stack);
  }
  if (typeof updates.startingPrice === "number") {
    fields.push("starting_price = ?");
    values.push(updates.startingPrice);
  }
  if (typeof updates.performanceScore === "number") {
    fields.push("performance_score = ?");
    values.push(updates.performanceScore);
  }
  if (typeof updates.featured === "boolean") {
    fields.push("featured = ?");
    values.push(updates.featured ? 1 : 0);
  }
  if (typeof updates.isActive === "boolean") {
    fields.push("is_active = ?");
    values.push(updates.isActive ? 1 : 0);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "liveDemoUrl")) {
    fields.push("live_demo_url = ?");
    values.push(updates.liveDemoUrl ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "previewImageUrl")) {
    fields.push("preview_image_url = ?");
    values.push(updates.previewImageUrl ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "templateSourcePath")) {
    fields.push("template_source_path = ?");
    values.push(updates.templateSourcePath ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "deploymentProfile")) {
    fields.push("deployment_profile = ?");
    values.push(updates.deploymentProfile ?? null);
  }

  if (fields.length > 0) {
    values.push(templateId);
    await pool.query(
      `UPDATE templates SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  const [rows] = await pool.query<TemplateRow[]>(
    `
      SELECT
        id, name, slug, description, category, stack,
        preview_image_url, live_demo_url, starting_price,
        performance_score, featured, is_active,
        template_source_path, deployment_profile,
        created_at, updated_at
      FROM templates
      WHERE id = ?
      LIMIT 1
    `,
    [templateId],
  );

  return rows[0] ? normalizeTemplate(rows[0]) : null;
}

export async function deleteTemplate(templateId: string): Promise<boolean> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const [result] = await pool.query("DELETE FROM templates WHERE id = ?", [templateId]);
  return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
}

export async function ensureUserSubscription(
  userId: string,
): Promise<UserSubscriptionRecord> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<SubscriptionRow[]>(
    `
      SELECT id, user_id, plan_name, status, billing_cycle, renewal_date, created_at, updated_at
      FROM user_subscriptions
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  if (rows[0]) {
    return normalizeSubscription(rows[0]);
  }

  const id = randomUUID();
  await pool.query(
    `
      INSERT INTO user_subscriptions (id, user_id, plan_name, status, billing_cycle, renewal_date)
      VALUES (?, ?, 'starter', 'active', 'monthly', DATE_ADD(CURDATE(), INTERVAL 30 DAY))
    `,
    [id, userId],
  );

  await createUserNotification(userId, {
    title: "Subscription Activated",
    message: "Your Starter subscription is active and ready.",
  });

  await createUserActivity(userId, {
    activityType: "subscription_created",
    message: "Starter subscription activated.",
  });

  const [freshRows] = await pool.query<SubscriptionRow[]>(
    `
      SELECT id, user_id, plan_name, status, billing_cycle, renewal_date, created_at, updated_at
      FROM user_subscriptions
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  if (!freshRows[0]) {
    throw new Error("Failed to create subscription");
  }

  return normalizeSubscription(freshRows[0]);
}

export async function getUserSubscription(
  userId: string,
): Promise<UserSubscriptionRecord> {
  return ensureUserSubscription(userId);
}

export async function listUserWebsites(userId: string): Promise<WebsiteRecord[]> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<WebsiteRow[]>(
    `
      SELECT
        w.id,
        w.user_id,
        u.email AS owner_email,
        w.template_id,
        t.name AS template_name,
        t.stack AS template_stack,
        w.project_name,
        w.status,
        w.subdomain,
        w.custom_domain,
        w.live_url,
        w.dashboard_url,
        w.provisioning_job_id,
        w.provisioning_error,
        w.renewal_date,
        w.page_views,
        w.visits,
        w.avg_session_duration,
        w.created_at,
        w.updated_at
      FROM websites w
      LEFT JOIN templates t ON t.id = w.template_id
      LEFT JOIN users u ON u.id = w.user_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `,
    [userId],
  );
  return rows.map(normalizeWebsite);
}

export async function listWebsitesForAdmin(search?: string): Promise<WebsiteRecord[]> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const query = search?.trim().toLowerCase();

  if (query) {
    const like = `%${query}%`;
    const [rows] = await pool.query<WebsiteRow[]>(
      `
        SELECT
          w.id,
          w.user_id,
          u.email AS owner_email,
          w.template_id,
          t.name AS template_name,
          t.stack AS template_stack,
          w.project_name,
          w.status,
          w.subdomain,
          w.custom_domain,
          w.live_url,
          w.dashboard_url,
          w.provisioning_job_id,
          w.provisioning_error,
          w.renewal_date,
          w.page_views,
          w.visits,
          w.avg_session_duration,
          w.created_at,
          w.updated_at
        FROM websites w
        LEFT JOIN templates t ON t.id = w.template_id
        LEFT JOIN users u ON u.id = w.user_id
        WHERE LOWER(w.project_name) LIKE ?
          OR LOWER(w.subdomain) LIKE ?
          OR LOWER(COALESCE(w.custom_domain, '')) LIKE ?
          OR LOWER(COALESCE(u.email, '')) LIKE ?
        ORDER BY w.created_at DESC
      `,
      [like, like, like, like],
    );
    return rows.map(normalizeWebsite);
  }

  const [rows] = await pool.query<WebsiteRow[]>(
    `
      SELECT
        w.id,
        w.user_id,
        u.email AS owner_email,
        w.template_id,
        t.name AS template_name,
        t.stack AS template_stack,
        w.project_name,
        w.status,
        w.subdomain,
        w.custom_domain,
        w.live_url,
        w.dashboard_url,
        w.provisioning_job_id,
        w.provisioning_error,
        w.renewal_date,
        w.page_views,
        w.visits,
        w.avg_session_duration,
        w.created_at,
        w.updated_at
      FROM websites w
      LEFT JOIN templates t ON t.id = w.template_id
      LEFT JOIN users u ON u.id = w.user_id
      ORDER BY w.created_at DESC
    `,
  );
  return rows.map(normalizeWebsite);
}

export async function updateWebsiteStatus(
  websiteId: string,
  status: WebsiteStatus,
): Promise<WebsiteRecord | null> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  await pool.query("UPDATE websites SET status = ? WHERE id = ?", [status, websiteId]);

  const [rows] = await pool.query<WebsiteRow[]>(
    `
      SELECT
        w.id,
        w.user_id,
        u.email AS owner_email,
        w.template_id,
        t.name AS template_name,
        t.stack AS template_stack,
        w.project_name,
        w.status,
        w.subdomain,
        w.custom_domain,
        w.live_url,
        w.dashboard_url,
        w.provisioning_job_id,
        w.provisioning_error,
        w.renewal_date,
        w.page_views,
        w.visits,
        w.avg_session_duration,
        w.created_at,
        w.updated_at
      FROM websites w
      LEFT JOIN templates t ON t.id = w.template_id
      LEFT JOIN users u ON u.id = w.user_id
      WHERE w.id = ?
      LIMIT 1
    `,
    [websiteId],
  );

  return rows[0] ? normalizeWebsite(rows[0]) : null;
}

export async function getWebsiteById(
  websiteId: string,
  userId?: string,
): Promise<WebsiteRecord | null> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const scopedFilter = userId ? "AND w.user_id = ?" : "";
  const params = userId ? [websiteId, userId] : [websiteId];

  const [rows] = await pool.query<WebsiteRow[]>(
    `
      SELECT
        w.id,
        w.user_id,
        u.email AS owner_email,
        w.template_id,
        t.name AS template_name,
        t.stack AS template_stack,
        w.project_name,
        w.status,
        w.subdomain,
        w.custom_domain,
        w.live_url,
        w.dashboard_url,
        w.provisioning_job_id,
        w.provisioning_error,
        w.renewal_date,
        w.page_views,
        w.visits,
        w.avg_session_duration,
        w.created_at,
        w.updated_at
      FROM websites w
      LEFT JOIN templates t ON t.id = w.template_id
      LEFT JOIN users u ON u.id = w.user_id
      WHERE w.id = ?
      ${scopedFilter}
      LIMIT 1
    `,
    params,
  );

  return rows[0] ? normalizeWebsite(rows[0]) : null;
}

export async function createWebsite(input: {
  id: string;
  userId: string;
  templateId: string;
  projectName: string;
  subdomain: string;
  customDomain?: string | null;
  status?: WebsiteStatus;
  liveUrl?: string | null;
  dashboardUrl?: string | null;
  provisioningJobId?: string | null;
  renewalDate?: string | null;
}): Promise<WebsiteRecord> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  await pool.query(
    `
      INSERT INTO websites (
        id, user_id, template_id, project_name, status, subdomain, custom_domain,
        live_url, dashboard_url, provisioning_job_id, renewal_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.id,
      input.userId,
      input.templateId,
      input.projectName.trim(),
      input.status || "pending",
      input.subdomain.trim().toLowerCase(),
      input.customDomain || null,
      input.liveUrl || null,
      input.dashboardUrl || null,
      input.provisioningJobId || null,
      input.renewalDate || null,
    ],
  );

  const website = await getWebsiteById(input.id);
  if (!website) {
    throw new Error("Failed to create website");
  }

  return website;
}

export async function updateWebsiteDeployment(
  websiteId: string,
  updates: Partial<{
    status: WebsiteStatus;
    liveUrl: string | null;
    dashboardUrl: string | null;
    provisioningJobId: string | null;
    provisioningError: string | null;
    customDomain: string | null;
  }>,
): Promise<WebsiteRecord | null> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (typeof updates.status === "string") {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "liveUrl")) {
    fields.push("live_url = ?");
    values.push(updates.liveUrl ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "dashboardUrl")) {
    fields.push("dashboard_url = ?");
    values.push(updates.dashboardUrl ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "provisioningJobId")) {
    fields.push("provisioning_job_id = ?");
    values.push(updates.provisioningJobId ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "provisioningError")) {
    fields.push("provisioning_error = ?");
    values.push(updates.provisioningError ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "customDomain")) {
    fields.push("custom_domain = ?");
    values.push(updates.customDomain ?? null);
  }

  if (fields.length === 0) {
    return getWebsiteById(websiteId);
  }

  values.push(websiteId);
  await pool.query(`UPDATE websites SET ${fields.join(", ")} WHERE id = ?`, values);
  return getWebsiteById(websiteId);
}

export async function listUserActivities(
  userId: string,
  limit: number = 10,
): Promise<UserActivityRecord[]> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<ActivityRow[]>(
    `
      SELECT id, user_id, activity_type, message, created_at
      FROM user_activities
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [userId, limit],
  );
  return rows.map(normalizeActivity);
}

export async function listUserNotifications(
  userId: string,
  limit: number = 10,
): Promise<UserNotificationRecord[]> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<NotificationRow[]>(
    `
      SELECT id, user_id, title, message, is_read, created_at
      FROM user_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [userId, limit],
  );
  return rows.map(normalizeNotification);
}

export async function listAdminNotifications(
  userId: string,
  limit: number = 10,
): Promise<AdminNotificationRecord[]> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<AdminNotificationRow[]>(
    `
      SELECT id, user_id, title, message, category, is_read, created_at
      FROM admin_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [userId, limit],
  );

  return rows.map(normalizeAdminNotification);
}

export async function createUserActivity(
  userId: string,
  input: { activityType: string; message: string },
): Promise<void> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  await pool.query(
    `
      INSERT INTO user_activities (id, user_id, activity_type, message)
      VALUES (?, ?, ?, ?)
    `,
    [randomUUID(), userId, input.activityType, input.message],
  );
}

export async function createUserNotification(
  userId: string,
  input: { title: string; message: string; read?: boolean },
): Promise<void> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  await pool.query(
    `
      INSERT INTO user_notifications (id, user_id, title, message, is_read)
      VALUES (?, ?, ?, ?, ?)
    `,
    [id, userId, input.title, input.message, input.read ? 1 : 0],
  );

  await publishUserNotificationCreated(userId, {
    id,
    title: input.title,
    message: input.message,
    read: Boolean(input.read),
    createdAt,
  });
}

export async function createAdminNotification(
  input: {
    title: string;
    message: string;
    category?: string | null;
    read?: boolean;
  },
  options?: {
    recipientAdminIds?: string[];
    excludeAdminIds?: string[];
  },
): Promise<void> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();

  const excludedAdminIds = new Set(options?.excludeAdminIds || []);
  const recipientAdminIds =
    options?.recipientAdminIds && options.recipientAdminIds.length > 0
      ? options.recipientAdminIds
      : (
          await pool.query<AdminRecipientRow[]>(
            `
              SELECT id
              FROM users
              WHERE role = 'admin'
                AND status = 'active'
            `,
          )
        )[0].map((row) => row.id);

  const uniqueRecipients = [...new Set(recipientAdminIds)].filter(
    (recipientAdminId) => !excludedAdminIds.has(recipientAdminId),
  );

  if (uniqueRecipients.length === 0) {
    return;
  }

  const createdAt = new Date().toISOString();
  await Promise.all(
    uniqueRecipients.map(async (recipientAdminId) => {
      const id = randomUUID();
      await pool.query(
        `
          INSERT INTO admin_notifications (id, user_id, title, message, category, is_read)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          recipientAdminId,
          input.title,
          input.message,
          input.category || null,
          input.read ? 1 : 0,
        ],
      );

      await publishAdminNotificationCreated(recipientAdminId, {
        id,
        title: input.title,
        message: input.message,
        category: input.category || null,
        read: Boolean(input.read),
        createdAt,
      });
    }),
  );
}
