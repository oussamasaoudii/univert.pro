import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensurePlatformDataSchema, getUserSubscription as getPlatformSubscription } from "@/lib/mysql/platform";
import { getBillingPlanByTier } from "@/lib/mysql/billing";
import type { SubscriptionRow } from "./types";

function normalizeStatus(
  status: "trialing" | "active" | "past_due" | "cancelled",
): SubscriptionRow["status"] {
  if (status === "cancelled") {
    return "canceled";
  }
  return status;
}

async function resolvePlanId(planName: string) {
  const plan = await getBillingPlanByTier((planName || "starter") as any);
  return plan?.id || planName || "starter";
}

function buildSubscriptionRow(input: {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionRow["status"];
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string | null;
  trialEnd?: string | null;
  cancelAt?: string | null;
  canceledAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}): SubscriptionRow {
  return {
    id: input.id,
    user_id: input.userId,
    plan_id: input.planId,
    status: input.status,
    current_period_start: input.currentPeriodStart,
    current_period_end: input.currentPeriodEnd,
    trial_start: input.trialStart || null,
    trial_end: input.trialEnd || null,
    cancel_at: input.cancelAt || null,
    canceled_at: input.canceledAt || null,
    ended_at: input.endedAt || null,
    stripe_subscription_id: null,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

export async function getUserSubscription(userId: string): Promise<SubscriptionRow | null> {
  try {
    const subscription = await getPlatformSubscription(userId);
    const planId = await resolvePlanId(subscription.planName);
    const currentPeriodEnd = new Date(subscription.renewalDate).toISOString();
    const days = subscription.billingCycle === "yearly" ? 365 : 30;
    const currentPeriodStart = new Date(
      new Date(subscription.renewalDate).getTime() - days * 24 * 60 * 60 * 1000,
    ).toISOString();

    return buildSubscriptionRow({
      id: subscription.id,
      userId: subscription.userId,
      planId,
      status: normalizeStatus(subscription.status),
      currentPeriodStart,
      currentPeriodEnd,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      canceledAt: subscription.status === "cancelled" ? subscription.updatedAt : null,
      cancelAt: subscription.status === "cancelled" ? subscription.updatedAt : null,
    });
  } catch (error) {
    console.error("[db] Error fetching subscription:", error);
    return null;
  }
}

export async function createSubscription(
  userId: string,
  planId: string,
): Promise<SubscriptionRow | null> {
  try {
    await ensurePlatformDataSchema();
    const pool = getMySQLPool();
    const existing = await getUserSubscription(userId);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (existing) {
      await pool.query(
        `
          UPDATE user_subscriptions
          SET plan_name = ?,
              status = 'trialing',
              billing_cycle = 'monthly',
              renewal_date = ?
          WHERE id = ?
        `,
        [planId, periodEnd.toISOString().slice(0, 10), existing.id],
      );

      return buildSubscriptionRow({
        id: existing.id,
        userId,
        planId,
        status: "trialing",
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        trialStart: now.toISOString(),
        trialEnd: trialEnd.toISOString(),
        createdAt: existing.created_at,
        updatedAt: new Date().toISOString(),
      });
    }

    const subscriptionId = randomUUID();
    await pool.query(
      `
        INSERT INTO user_subscriptions (
          id, user_id, plan_name, status, billing_cycle, renewal_date
        )
        VALUES (?, ?, ?, 'trialing', 'monthly', ?)
      `,
      [subscriptionId, userId, planId, periodEnd.toISOString().slice(0, 10)],
    );

    return buildSubscriptionRow({
      id: subscriptionId,
      userId,
      planId,
      status: "trialing",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      trialStart: now.toISOString(),
      trialEnd: trialEnd.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[db] Error creating subscription:", error);
    return null;
  }
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionRow["status"],
): Promise<SubscriptionRow | null> {
  try {
    await ensurePlatformDataSchema();
    const pool = getMySQLPool();
    const normalizedStatus = status === "canceled" ? "cancelled" : status;

    await pool.query(
      `
        UPDATE user_subscriptions
        SET status = ?,
            updated_at = NOW()
        WHERE id = ?
      `,
      [normalizedStatus, subscriptionId],
    );

    const [rows] = await pool.query(
      `
        SELECT user_id
        FROM user_subscriptions
        WHERE id = ?
        LIMIT 1
      `,
      [subscriptionId],
    );

    const userId = (rows as Array<{ user_id: string }>)[0]?.user_id;
    if (!userId) {
      return null;
    }

    const updated = await getUserSubscription(userId);
    if (!updated) {
      return null;
    }

    if (status === "canceled") {
      return {
        ...updated,
        cancel_at: new Date().toISOString(),
        canceled_at: new Date().toISOString(),
      };
    }

    if (status === "ended") {
      return {
        ...updated,
        ended_at: new Date().toISOString(),
      };
    }

    return updated;
  } catch (error) {
    console.error("[db] Error updating subscription:", error);
    return null;
  }
}

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  return getUserSubscription(userId);
}
