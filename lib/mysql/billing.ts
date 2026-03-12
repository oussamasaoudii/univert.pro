import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureCoreSchema } from "@/lib/mysql/schema";
import {
  ensurePlatformDataSchema,
  getUserSubscription,
  type UserSubscriptionRecord,
} from "@/lib/mysql/platform";

export type BillingPlanTier =
  | "starter"
  | "growth"
  | "pro"
  | "premium"
  | "enterprise";

export type InvoiceStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethodType = "card" | "paypal" | "bank";

export type BillingPlanRecord = {
  id: string;
  name: string;
  tier: BillingPlanTier;
  monthlyPrice: number;
  yearlyPrice: number;
  websiteLimit: number;
  storageLimit: string;
  bandwidthLimit: string;
  supportLevel: string;
  isActive: boolean;
  position: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
};

export type UserInvoiceRecord = {
  id: string;
  invoiceNumber: string;
  userId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  paymentMethod: string | null;
  downloadUrl: string | null;
  issuedAt: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserPaymentMethodRecord = {
  id: string;
  userId: string;
  methodType: PaymentMethodType;
  brand: string | null;
  last4: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BillingSnapshot = {
  subscription: UserSubscriptionRecord;
  currentPlan: BillingPlanRecord | null;
  plans: BillingPlanRecord[];
  invoices: UserInvoiceRecord[];
  paymentMethods: UserPaymentMethodRecord[];
};

export type AdminInvoiceRecord = UserInvoiceRecord & {
  userEmail: string | null;
  planName: string | null;
};

type BillingPlanRow = {
  id: string;
  name: string;
  tier: BillingPlanTier;
  monthly_price: string | number;
  yearly_price: string | number;
  website_limit: number;
  storage_limit: string;
  bandwidth_limit: string;
  support_level: string;
  is_active: number | boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

type BillingPlanFeatureRow = {
  id: string;
  plan_id: string;
  feature_text: string;
  position: number;
};

type UserInvoiceRow = {
  id: string;
  invoice_number: string;
  user_id: string;
  user_email?: string | null;
  plan_name?: string | null;
  subscription_id: string | null;
  amount: string | number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  payment_method: string | null;
  download_url: string | null;
  issued_at: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

type UserPaymentMethodRow = {
  id: string;
  user_id: string;
  method_type: PaymentMethodType;
  brand: string | null;
  last4: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  is_default: number | boolean;
  created_at: string;
  updated_at: string;
};

type MonthlyRevenueRow = {
  month_key: string;
  revenue: string | number;
};

type DistributionRow = {
  plan_name: string;
  total: string | number;
};

type InvoiceCountersRow = {
  total_revenue: string | number;
  paid_invoices: string | number;
  pending_invoices: string | number;
  failed_invoices: string | number;
};

let billingSchemaPromise: Promise<void> | null = null;
let billingSchemaInitialized = false;

async function checkBillingTablesExist(): Promise<boolean> {
  try {
    const pool = getMySQLPool();
    if (!pool) return true; // Skip DDL if no pool
    await pool.query(`SELECT 1 FROM billing_plans LIMIT 1`);
    return true;
  } catch (error: unknown) {
    const mysqlError = error as { code?: string };
    if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
      return false;
    }
    return true; // Assume exists to avoid DDL on permission errors
  }
}

function normalizePlan(row: BillingPlanRow, features: string[]): BillingPlanRecord {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier,
    monthlyPrice: Number(row.monthly_price || 0),
    yearlyPrice: Number(row.yearly_price || 0),
    websiteLimit: Number(row.website_limit || 0),
    storageLimit: row.storage_limit,
    bandwidthLimit: row.bandwidth_limit,
    supportLevel: row.support_level,
    isActive: row.is_active === 1 || row.is_active === true,
    position: Number(row.position || 0),
    features,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeInvoice(row: UserInvoiceRow): UserInvoiceRecord {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    userId: row.user_id,
    subscriptionId: row.subscription_id,
    amount: Number(row.amount || 0),
    currency: row.currency,
    status: row.status,
    description: row.description,
    paymentMethod: row.payment_method,
    downloadUrl: row.download_url,
    issuedAt: row.issued_at,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeAdminInvoice(row: UserInvoiceRow): AdminInvoiceRecord {
  return {
    ...normalizeInvoice(row),
    userEmail: row.user_email || null,
    planName: row.plan_name || null,
  };
}

function normalizePaymentMethod(row: UserPaymentMethodRow): UserPaymentMethodRecord {
  return {
    id: row.id,
    userId: row.user_id,
    methodType: row.method_type,
    brand: row.brand,
    last4: row.last4,
    expiryMonth: row.expiry_month,
    expiryYear: row.expiry_year,
    isDefault: row.is_default === 1 || row.is_default === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeTier(input: string): BillingPlanTier {
  const value = input.trim().toLowerCase();
  if (value.includes("enterprise")) return "enterprise";
  if (value.includes("premium")) return "premium";
  if (value.includes("pro")) return "pro";
  if (value.includes("growth")) return "growth";
  return "starter";
}

function formatMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const monthNumber = Number(month);
  if (!year || Number.isNaN(monthNumber)) {
    return key;
  }
  const date = new Date(Date.UTC(Number(year), monthNumber - 1, 1));
  return date.toLocaleDateString("en-US", { month: "short" });
}

async function ensureBillingSchema() {
  if (billingSchemaInitialized) {
    return;
  }
  
  if (!billingSchemaPromise) {
    billingSchemaPromise = initializeBillingSchema();
  }

  await billingSchemaPromise;
}

async function initializeBillingSchema() {
  await ensureCoreSchema();
  await ensurePlatformDataSchema();

  const pool = getMySQLPool();
  
  // Check if tables already exist (pre-created via migration script)
  const tablesExist = await checkBillingTablesExist();
  
  if (tablesExist) {
    // Tables exist, just seed default data if needed
    await seedBillingPlans();
    billingSchemaInitialized = true;
    return;
  }
  
  // Tables don't exist, try to create them

  await pool.query(`
    CREATE TABLE IF NOT EXISTS billing_plans (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      tier ENUM('starter', 'growth', 'pro', 'premium', 'enterprise') NOT NULL UNIQUE,
      monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      yearly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      website_limit INT NOT NULL DEFAULT 1,
      storage_limit VARCHAR(64) NOT NULL DEFAULT '5 GB',
      bandwidth_limit VARCHAR(64) NOT NULL DEFAULT '50 GB',
      support_level VARCHAR(64) NOT NULL DEFAULT 'email',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      position INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_billing_plans_position (position),
      INDEX idx_billing_plans_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS billing_plan_features (
      id CHAR(36) PRIMARY KEY,
      plan_id CHAR(36) NOT NULL,
      feature_text VARCHAR(255) NOT NULL,
      position INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_plan_features_plan (plan_id),
      CONSTRAINT fk_plan_features_plan FOREIGN KEY (plan_id) REFERENCES billing_plans(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_invoices (
      id CHAR(36) PRIMARY KEY,
      invoice_number VARCHAR(64) NOT NULL UNIQUE,
      user_id CHAR(36) NOT NULL,
      subscription_id CHAR(36) NULL,
      amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      status ENUM('paid', 'pending', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
      description VARCHAR(255) NOT NULL,
      payment_method VARCHAR(120) NULL,
      download_url TEXT NULL,
      issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_invoices_user (user_id),
      INDEX idx_user_invoices_status (status),
      INDEX idx_user_invoices_issued (issued_at),
      CONSTRAINT fk_user_invoices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_user_invoices_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_payment_methods (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      method_type ENUM('card', 'paypal', 'bank') NOT NULL DEFAULT 'card',
      brand VARCHAR(64) NULL,
      last4 VARCHAR(8) NULL,
      expiry_month TINYINT UNSIGNED NULL,
      expiry_year SMALLINT UNSIGNED NULL,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_payment_methods_user (user_id),
      CONSTRAINT fk_payment_methods_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await seedBillingPlans();
  billingSchemaInitialized = true;
}

async function seedBillingPlans() {
  const pool = getMySQLPool();
  const [rows] = await pool.query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM billing_plans",
  );

  if ((rows[0]?.total || 0) > 0) {
    return;
  }

  const plans = [
    {
      name: "Starter",
      tier: "starter" as BillingPlanTier,
      monthlyPrice: 29,
      yearlyPrice: 290,
      websiteLimit: 1,
      storageLimit: "5 GB",
      bandwidthLimit: "50 GB",
      supportLevel: "Email support",
      position: 1,
      features: [
        "1 website included",
        "SSL certificate",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      name: "Growth",
      tier: "growth" as BillingPlanTier,
      monthlyPrice: 59,
      yearlyPrice: 590,
      websiteLimit: 3,
      storageLimit: "20 GB",
      bandwidthLimit: "200 GB",
      supportLevel: "Priority email",
      position: 2,
      features: [
        "3 websites included",
        "Advanced analytics",
        "Custom domains",
        "Priority email support",
      ],
    },
    {
      name: "Pro",
      tier: "pro" as BillingPlanTier,
      monthlyPrice: 99,
      yearlyPrice: 990,
      websiteLimit: 10,
      storageLimit: "80 GB",
      bandwidthLimit: "1 TB",
      supportLevel: "Priority chat",
      position: 3,
      features: [
        "10 websites included",
        "Team collaboration",
        "Priority provisioning queue",
        "Priority chat support",
      ],
    },
    {
      name: "Premium",
      tier: "premium" as BillingPlanTier,
      monthlyPrice: 149,
      yearlyPrice: 1490,
      websiteLimit: 25,
      storageLimit: "200 GB",
      bandwidthLimit: "2 TB",
      supportLevel: "24/7 chat",
      position: 4,
      features: [
        "25 websites included",
        "White-label options",
        "Dedicated resources",
        "24/7 chat support",
      ],
    },
    {
      name: "Enterprise",
      tier: "enterprise" as BillingPlanTier,
      monthlyPrice: 299,
      yearlyPrice: 2990,
      websiteLimit: 100,
      storageLimit: "1 TB",
      bandwidthLimit: "5 TB",
      supportLevel: "Dedicated manager",
      position: 5,
      features: [
        "Unlimited scaling options",
        "SLA and dedicated account manager",
        "Advanced security controls",
        "Custom integration support",
      ],
    },
  ];

  for (const plan of plans) {
    const planId = randomUUID();

    await pool.query(
      `
        INSERT INTO billing_plans (
          id, name, tier, monthly_price, yearly_price, website_limit,
          storage_limit, bandwidth_limit, support_level, is_active, position
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `,
      [
        planId,
        plan.name,
        plan.tier,
        plan.monthlyPrice,
        plan.yearlyPrice,
        plan.websiteLimit,
        plan.storageLimit,
        plan.bandwidthLimit,
        plan.supportLevel,
        plan.position,
      ],
    );

    for (let index = 0; index < plan.features.length; index += 1) {
      await pool.query(
        `
          INSERT INTO billing_plan_features (id, plan_id, feature_text, position)
          VALUES (?, ?, ?, ?)
        `,
        [randomUUID(), planId, plan.features[index], index + 1],
      );
    }
  }
}

async function listPlanFeaturesMap(planIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (planIds.length === 0) {
    return map;
  }

  const pool = getMySQLPool();
  const placeholders = planIds.map(() => "?").join(", ");
  const [rows] = await pool.query<BillingPlanFeatureRow[]>(
    `
      SELECT id, plan_id, feature_text, position
      FROM billing_plan_features
      WHERE plan_id IN (${placeholders})
      ORDER BY position ASC, created_at ASC
    `,
    planIds,
  );

  for (const row of rows) {
    const existing = map.get(row.plan_id) || [];
    existing.push(row.feature_text);
    map.set(row.plan_id, existing);
  }

  return map;
}

export async function listBillingPlans(options?: {
  includeInactive?: boolean;
}): Promise<BillingPlanRecord[]> {
  await ensureBillingSchema();
  const pool = getMySQLPool();
  const includeInactive = options?.includeInactive === true;

  const [rows] = await pool.query<BillingPlanRow[]>(
    `
      SELECT
        id, name, tier, monthly_price, yearly_price, website_limit,
        storage_limit, bandwidth_limit, support_level, is_active,
        position, created_at, updated_at
      FROM billing_plans
      ${includeInactive ? "" : "WHERE is_active = 1"}
      ORDER BY position ASC, created_at ASC
    `,
  );

  const featuresMap = await listPlanFeaturesMap(rows.map((row) => row.id));
  return rows.map((row) => normalizePlan(row, featuresMap.get(row.id) || []));
}

export async function getBillingPlanByTier(
  tier: BillingPlanTier,
): Promise<BillingPlanRecord | null> {
  const plans = await listBillingPlans({ includeInactive: true });
  return plans.find((plan) => plan.tier === tier) || null;
}

export async function listUserInvoices(
  userId: string,
  limit: number = 25,
): Promise<UserInvoiceRecord[]> {
  await ensureBillingSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<UserInvoiceRow[]>(
    `
      SELECT
        id, invoice_number, user_id, subscription_id,
        amount, currency, status, description, payment_method,
        download_url, issued_at, paid_at, created_at, updated_at
      FROM user_invoices
      WHERE user_id = ?
      ORDER BY issued_at DESC, created_at DESC
      LIMIT ?
    `,
    [userId, limit],
  );

  return rows.map(normalizeInvoice);
}

export async function listUserPaymentMethods(
  userId: string,
): Promise<UserPaymentMethodRecord[]> {
  await ensureBillingSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<UserPaymentMethodRow[]>(
    `
      SELECT
        id, user_id, method_type, brand, last4,
        expiry_month, expiry_year, is_default, created_at, updated_at
      FROM user_payment_methods
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at ASC
    `,
    [userId],
  );

  return rows.map(normalizePaymentMethod);
}

async function ensureDefaultPaymentMethod(
  userId: string,
): Promise<UserPaymentMethodRecord[]> {
  const methods = await listUserPaymentMethods(userId);
  if (methods.length > 0) {
    return methods;
  }

  const pool = getMySQLPool();
  const paymentMethodId = randomUUID();
  await pool.query(
    `
      INSERT INTO user_payment_methods (
        id, user_id, method_type, brand, last4, expiry_month, expiry_year, is_default
      )
      VALUES (?, ?, 'card', 'Visa', '4242', 12, 2028, 1)
    `,
    [paymentMethodId, userId],
  );

  return listUserPaymentMethods(userId);
}

export async function getUserBillingSnapshot(userId: string): Promise<BillingSnapshot> {
  await ensureBillingSchema();

  const [subscription, plans, invoices] = await Promise.all([
    getUserSubscription(userId),
    listBillingPlans(),
    listUserInvoices(userId, 25),
  ]);

  const currentPlanTier = normalizeTier(subscription.planName);
  const currentPlan = plans.find((plan) => plan.tier === currentPlanTier) || null;
  const paymentMethods = await ensureDefaultPaymentMethod(userId);

  return {
    subscription,
    currentPlan,
    plans,
    invoices,
    paymentMethods,
  };
}

export async function updateUserSubscriptionPlan(
  userId: string,
  updates: {
    tier?: BillingPlanTier;
    billingCycle?: "monthly" | "yearly";
  },
): Promise<UserSubscriptionRecord> {
  await ensureBillingSchema();
  const pool = getMySQLPool();
  const subscription = await getUserSubscription(userId);

  const fields: string[] = [];
  const values: Array<string | number> = [];
  let nextPlanTier = normalizeTier(subscription.planName);
  let nextBillingCycle = subscription.billingCycle;

  if (updates.tier) {
    const plan = await getBillingPlanByTier(updates.tier);
    if (plan) {
      fields.push("plan_name = ?");
      values.push(plan.tier);
      nextPlanTier = plan.tier;
    }
  }

  if (updates.billingCycle) {
    fields.push("billing_cycle = ?");
    values.push(updates.billingCycle);
    nextBillingCycle = updates.billingCycle;
  }

  if (fields.length > 0) {
    fields.push(
      "renewal_date = DATE_ADD(CURDATE(), INTERVAL ? DAY)",
    );
    values.push(nextBillingCycle === "yearly" ? 365 : 30);
    values.push(subscription.id);

    await pool.query(
      `
        UPDATE user_subscriptions
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
      values,
    );

    await pool.query("UPDATE users SET plan = ? WHERE id = ?", [nextPlanTier, userId]);
  }

  return getUserSubscription(userId);
}

export async function createInvoice(input: {
  userId: string;
  subscriptionId: string | null;
  amount: number;
  status?: InvoiceStatus;
  description: string;
  paymentMethod?: string | null;
  downloadUrl?: string | null;
}): Promise<UserInvoiceRecord> {
  await ensureBillingSchema();
  const pool = getMySQLPool();
  const invoiceId = randomUUID();
  const invoiceNumber = `INV-${Date.now()}`;
  const status = input.status || "pending";

  await pool.query(
    `
      INSERT INTO user_invoices (
        id, invoice_number, user_id, subscription_id, amount, currency, status,
        description, payment_method, download_url, issued_at, paid_at
      )
      VALUES (?, ?, ?, ?, ?, 'USD', ?, ?, ?, ?, NOW(), ?)
    `,
    [
      invoiceId,
      invoiceNumber,
      input.userId,
      input.subscriptionId,
      Number(input.amount),
      status,
      input.description,
      input.paymentMethod || null,
      input.downloadUrl || null,
      status === "paid" ? new Date() : null,
    ],
  );

  const [rows] = await pool.query<UserInvoiceRow[]>(
    `
      SELECT
        id, invoice_number, user_id, subscription_id,
        amount, currency, status, description, payment_method,
        download_url, issued_at, paid_at, created_at, updated_at
      FROM user_invoices
      WHERE id = ?
      LIMIT 1
    `,
    [invoiceId],
  );

  if (!rows[0]) {
    throw new Error("Failed to create invoice");
  }

  return normalizeInvoice(rows[0]);
}

export async function getInvoiceCounters(): Promise<{
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  failedInvoices: number;
}> {
  await ensureBillingSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<InvoiceCountersRow[]>(
    `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS total_revenue,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_invoices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_invoices,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_invoices
      FROM user_invoices
    `,
  );

  const row = rows[0];
  return {
    totalRevenue: Number(row?.total_revenue || 0),
    paidInvoices: Number(row?.paid_invoices || 0),
    pendingInvoices: Number(row?.pending_invoices || 0),
    failedInvoices: Number(row?.failed_invoices || 0),
  };
}

export async function getMonthlyRevenueTrend(
  months: number = 6,
): Promise<Array<{ month: string; revenue: number }>> {
  await ensureBillingSchema();
  const pool = getMySQLPool();

  const keys: string[] = [];
  const baseDate = new Date();
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const d = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() - offset, 1));
    keys.push(formatMonthKey(d));
  }

  const earliest = `${keys[0]}-01`;
  const [rows] = await pool.query<MonthlyRevenueRow[]>(
    `
      SELECT DATE_FORMAT(issued_at, '%Y-%m') AS month_key, COALESCE(SUM(amount), 0) AS revenue
      FROM user_invoices
      WHERE status = 'paid' AND issued_at >= ?
      GROUP BY DATE_FORMAT(issued_at, '%Y-%m')
    `,
    [earliest],
  );

  const revenueMap = new Map<string, number>();
  for (const row of rows) {
    revenueMap.set(row.month_key, Number(row.revenue || 0));
  }

  return keys.map((key) => ({
    month: formatMonthLabel(key),
    revenue: revenueMap.get(key) || 0,
  }));
}

export async function getSubscriptionPlanDistribution(): Promise<
  Array<{ name: string; value: number }>
> {
  await ensureBillingSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<DistributionRow[]>(
    `
      SELECT LOWER(plan_name) AS plan_name, COUNT(*) AS total
      FROM user_subscriptions
      GROUP BY LOWER(plan_name)
      ORDER BY total DESC
    `,
  );

  if (rows.length === 0) {
    return [];
  }

  return rows.map((row) => ({
    name: normalizeTier(row.plan_name),
    value: Number(row.total || 0),
  }));
}

export async function listInvoicesForAdmin(options?: {
  search?: string;
  limit?: number;
}): Promise<AdminInvoiceRecord[]> {
  await ensureBillingSchema();
  const pool = getMySQLPool();
  const search = options?.search?.trim().toLowerCase();
  const limit = options?.limit && options.limit > 0 ? options.limit : 200;

  if (search) {
    const like = `%${search}%`;
    const [rows] = await pool.query<UserInvoiceRow[]>(
      `
        SELECT
          i.id,
          i.invoice_number,
          i.user_id,
          u.email AS user_email,
          s.plan_name,
          i.subscription_id,
          i.amount,
          i.currency,
          i.status,
          i.description,
          i.payment_method,
          i.download_url,
          i.issued_at,
          i.paid_at,
          i.created_at,
          i.updated_at
        FROM user_invoices i
        LEFT JOIN users u ON u.id = i.user_id
        LEFT JOIN user_subscriptions s ON s.id = i.subscription_id
        WHERE LOWER(i.invoice_number) LIKE ?
          OR LOWER(COALESCE(u.email, '')) LIKE ?
          OR LOWER(i.description) LIKE ?
        ORDER BY i.issued_at DESC, i.created_at DESC
        LIMIT ?
      `,
      [like, like, like, limit],
    );

    return rows.map(normalizeAdminInvoice);
  }

  const [rows] = await pool.query<UserInvoiceRow[]>(
    `
      SELECT
        i.id,
        i.invoice_number,
        i.user_id,
        u.email AS user_email,
        s.plan_name,
        i.subscription_id,
        i.amount,
        i.currency,
        i.status,
        i.description,
        i.payment_method,
        i.download_url,
        i.issued_at,
        i.paid_at,
        i.created_at,
        i.updated_at
      FROM user_invoices i
      LEFT JOIN users u ON u.id = i.user_id
      LEFT JOIN user_subscriptions s ON s.id = i.subscription_id
      ORDER BY i.issued_at DESC, i.created_at DESC
      LIMIT ?
    `,
    [limit],
  );

  return rows.map(normalizeAdminInvoice);
}
