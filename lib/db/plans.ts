import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureBillingCompatSchema } from "@/lib/mysql/legacy-schema";
import { getBillingPlanByTier, listBillingPlans } from "@/lib/mysql/billing";
import type {
  BillingPlanRow,
  FeatureUsageRow,
  PlanFeatureRow,
  PlanName,
  SubscriptionHistoryRow,
} from "./types";

type PlanFeatureDbRow = Omit<PlanFeatureRow, "is_enabled"> & {
  is_enabled: number | boolean;
};

function featureKeyFromText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function mapPlan(plan: Awaited<ReturnType<typeof getBillingPlanByTier>>): BillingPlanRow | null {
  if (!plan) {
    return null;
  }

  return {
    id: plan.id,
    name: plan.tier as PlanName,
    display_name: plan.name,
    description: null,
    price_monthly: plan.monthlyPrice,
    price_annual: plan.yearlyPrice,
    stripe_product_id: null,
    stripe_price_id_monthly: null,
    stripe_price_id_annual: null,
    is_active: plan.isActive,
    position: plan.position,
    created_at: plan.createdAt,
    updated_at: plan.updatedAt,
  };
}

function mapFeatureUsage(row: {
  id: string;
  user_id: string;
  feature_key: string;
  usage_count: number | string;
  limit_value: number | string | null;
  reset_at: string | null;
  created_at: string;
  updated_at: string;
}): FeatureUsageRow {
  return {
    id: row.id,
    user_id: row.user_id,
    feature_key: row.feature_key,
    usage_count: Number(row.usage_count || 0),
    limit_value: row.limit_value === null ? null : Number(row.limit_value),
    reset_at: row.reset_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function parseJsonRecord(value: string | null): Record<string, any> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, any>)
      : {};
  } catch {
    return {};
  }
}

export async function getAllPlans(): Promise<BillingPlanRow[]> {
  const plans = await listBillingPlans();
  return plans
    .map((plan) => mapPlan(plan))
    .filter(Boolean) as BillingPlanRow[];
}

export async function getPlanByName(name: PlanName): Promise<BillingPlanRow | null> {
  return mapPlan(await getBillingPlanByTier(name));
}

export async function getPlanById(planId: string): Promise<BillingPlanRow | null> {
  const plans = await listBillingPlans({ includeInactive: true });
  return mapPlan(plans.find((plan) => plan.id === planId) || null);
}

export async function getPlanFeatures(planId: string): Promise<PlanFeatureRow[]> {
  const plans = await listBillingPlans({ includeInactive: true });
  const plan = plans.find((candidate) => candidate.id === planId);
  if (!plan) {
    return [];
  }

  return plan.features.map((feature, index) => ({
    id: `${plan.id}:${index}`,
    plan_id: plan.id,
    feature_key: featureKeyFromText(feature),
    feature_name: feature,
    feature_value: null,
    is_enabled: true,
    created_at: plan.createdAt,
  }));
}

export async function getFeatureValue(planId: string, featureKey: string): Promise<string | null> {
  const features = await getPlanFeatures(planId);
  const feature = features.find((item) => item.feature_key === featureKey && item.is_enabled);
  return feature?.feature_value || (feature ? "true" : null);
}

export async function logSubscriptionAction(
  subscriptionId: string,
  userId: string,
  action: SubscriptionHistoryRow["action"],
  oldPlanId: string | null = null,
  newPlanId: string | null = null,
  oldStatus: string | null = null,
  newStatus: string | null = null,
  amount: number | null = null,
  metadata: Record<string, any> = {},
): Promise<SubscriptionHistoryRow | null> {
  try {
    await ensureBillingCompatSchema();
    const pool = getMySQLPool();
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO subscription_history (
          id, subscription_id, user_id, action, old_plan_id, new_plan_id,
          old_status, new_status, amount, metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        subscriptionId,
        userId,
        action,
        oldPlanId,
        newPlanId,
        oldStatus,
        newStatus,
        amount,
        JSON.stringify(metadata),
      ],
    );

    return {
      id,
      subscription_id: subscriptionId,
      user_id: userId,
      action,
      old_plan_id: oldPlanId,
      new_plan_id: newPlanId,
      old_status: oldStatus,
      new_status: newStatus,
      amount,
      metadata,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[db] Error logging subscription action:", error);
    return null;
  }
}

export async function getSubscriptionHistory(subscriptionId: string, limit: number = 50): Promise<SubscriptionHistoryRow[]> {
  try {
    await ensureBillingCompatSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM subscription_history
        WHERE subscription_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [subscriptionId, limit],
    );

    return (rows as Array<{
      id: string;
      subscription_id: string;
      user_id: string;
      action: SubscriptionHistoryRow["action"];
      old_plan_id: string | null;
      new_plan_id: string | null;
      old_status: string | null;
      new_status: string | null;
      amount: number | string | null;
      metadata: string | null;
      created_at: string;
    }>).map((row) => ({
      ...row,
      amount: row.amount === null ? null : Number(row.amount),
      metadata: parseJsonRecord(row.metadata),
    }));
  } catch (error) {
    console.error("[db] Error fetching subscription history:", error);
    return [];
  }
}

export async function getFeatureUsage(userId: string, featureKey: string): Promise<FeatureUsageRow | null> {
  try {
    await ensureBillingCompatSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM feature_usage
        WHERE user_id = ?
          AND feature_key = ?
        LIMIT 1
      `,
      [userId, featureKey],
    );

    const row = (rows as Array<{
      id: string;
      user_id: string;
      feature_key: string;
      usage_count: number | string;
      limit_value: number | string | null;
      reset_at: string | null;
      created_at: string;
      updated_at: string;
    }>)[0];

    return row ? mapFeatureUsage(row) : null;
  } catch (error) {
    console.error("[db] Error fetching feature usage:", error);
    return null;
  }
}

export async function incrementFeatureUsage(userId: string, featureKey: string, amount: number = 1): Promise<FeatureUsageRow | null> {
  try {
    await ensureBillingCompatSchema();
    const pool = getMySQLPool();
    const existing = await getFeatureUsage(userId, featureKey);

    if (existing) {
      await pool.query(
        `
          UPDATE feature_usage
          SET usage_count = usage_count + ?,
              updated_at = NOW()
          WHERE id = ?
        `,
        [amount, existing.id],
      );

      return getFeatureUsage(userId, featureKey);
    }

    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO feature_usage (
          id, user_id, feature_key, usage_count, limit_value
        )
        VALUES (?, ?, ?, ?, NULL)
      `,
      [id, userId, featureKey, amount],
    );

    return getFeatureUsage(userId, featureKey);
  } catch (error) {
    console.error("[db] Error incrementing feature usage:", error);
    return null;
  }
}

export async function resetFeatureUsage(userId: string, featureKey: string): Promise<boolean> {
  try {
    await ensureBillingCompatSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE feature_usage
        SET usage_count = 0,
            reset_at = NOW(),
            updated_at = NOW()
        WHERE user_id = ?
          AND feature_key = ?
      `,
      [userId, featureKey],
    );

    return true;
  } catch (error) {
    console.error("[db] Error resetting feature usage:", error);
    return false;
  }
}

export async function hasFeatureAccess(userId: string, featureKey: string): Promise<boolean> {
  const usage = await getFeatureUsage(userId, featureKey);
  if (!usage) {
    return false;
  }

  if (usage.limit_value === null) {
    return true;
  }

  return usage.usage_count < usage.limit_value;
}
