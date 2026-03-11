import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardRequestUser } from "@/lib/api-auth";
import {
  getUserBillingSnapshot,
  updateUserSubscriptionPlan,
  type BillingPlanTier,
} from "@/lib/mysql/billing";
import { getUserSubscription, createUserActivity } from "@/lib/mysql/platform";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";
import {
  getPreviewBillingSnapshot,
  updatePreviewBillingSnapshot,
} from "@/lib/preview-data";
import { isPreviewMode } from "@/lib/preview-mode";

const PLAN_TIERS: BillingPlanTier[] = [
  "starter",
  "growth",
  "pro",
  "premium",
  "enterprise",
];

const billingUpdateSchema = z
  .object({
    planTier: z.enum(PLAN_TIERS).optional(),
    billingCycle: z.enum(["monthly", "yearly"]).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.planTier || value.billingCycle), {
    message: "at_least_one_field_required",
  });

type DashboardBillingRouteDeps = {
  assertTrustedOrigin: typeof assertTrustedOrigin;
  createUserActivity: typeof createUserActivity;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getDashboardRequestUser: typeof getDashboardRequestUser;
  getUserBillingSnapshot: typeof getUserBillingSnapshot;
  getUserSubscription: typeof getUserSubscription;
  parseJsonBody: typeof parseJsonBody;
  updateUserSubscriptionPlan: typeof updateUserSubscriptionPlan;
};

const dashboardBillingRouteDeps: DashboardBillingRouteDeps = {
  assertTrustedOrigin,
  createUserActivity,
  enforceRouteRateLimit,
  getDashboardRequestUser,
  getUserBillingSnapshot,
  getUserSubscription,
  parseJsonBody,
  updateUserSubscriptionPlan,
};

function normalizePlanTier(planName: string): BillingPlanTier {
  const value = planName.trim().toLowerCase();
  if (value.includes("enterprise")) return "enterprise";
  if (value.includes("premium")) return "premium";
  if (value.includes("pro")) return "pro";
  if (value.includes("growth")) return "growth";
  return "starter";
}

export async function handleDashboardBillingGet(
  request: Request,
  deps: DashboardBillingRouteDeps = dashboardBillingRouteDeps,
) {
  try {
    if (isPreviewMode()) {
      return NextResponse.json(getPreviewBillingSnapshot());
    }

    const user = await deps.getDashboardRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "dashboard-billing-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const snapshot = await deps.getUserBillingSnapshot(user.id);
    return NextResponse.json(snapshot);
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.billing.read" });
  }
}

export async function handleDashboardBillingPatch(
  request: Request,
  deps: DashboardBillingRouteDeps = dashboardBillingRouteDeps,
) {
  try {
    if (isPreviewMode()) {
      const body = await deps.parseJsonBody(request, billingUpdateSchema, { maxBytes: 4 * 1024 });
      const snapshot = updatePreviewBillingSnapshot({
        planTier: body.planTier,
        billingCycle: body.billingCycle,
      });

      return NextResponse.json({
        ok: true,
        subscription: snapshot.subscription,
        currentPlan: snapshot.currentPlan,
        plans: snapshot.plans,
        invoices: snapshot.invoices,
        paymentMethods: snapshot.paymentMethods,
      });
    }

    deps.assertTrustedOrigin(request);
    const user = await deps.getDashboardRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "dashboard-billing-update",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 20 * 60 * 1000,
    });

    const body = await deps.parseJsonBody(request, billingUpdateSchema, { maxBytes: 4 * 1024 });
    const planTier = body.planTier;
    const billingCycle = body.billingCycle;

    const before = await deps.getUserSubscription(user.id);
    const currentPlanTier = normalizePlanTier(before.planName);
    if (planTier && planTier !== currentPlanTier) {
      return NextResponse.json(
        { error: "plan_change_requires_checkout" },
        { status: 409 },
      );
    }

    const updates: { tier?: BillingPlanTier; billingCycle?: "monthly" | "yearly" } = {};

    if (planTier && planTier === currentPlanTier) {
      updates.tier = planTier;
    }

    if (billingCycle) {
      updates.billingCycle = billingCycle;
    }

    const updatedSubscription = await deps.updateUserSubscriptionPlan(user.id, updates);

    if (before.planName !== updatedSubscription.planName) {
      await deps.createUserActivity(user.id, {
        activityType: "plan_upgraded",
        message: `Plan changed from ${before.planName} to ${updatedSubscription.planName}.`,
      });
    } else if (before.billingCycle !== updatedSubscription.billingCycle) {
      await deps.createUserActivity(user.id, {
        activityType: "subscription_updated",
        message: `Billing cycle changed to ${updatedSubscription.billingCycle}.`,
      });
    }

    const snapshot = await deps.getUserBillingSnapshot(user.id);
    return NextResponse.json({
      ok: true,
      subscription: snapshot.subscription,
      currentPlan: snapshot.currentPlan,
      plans: snapshot.plans,
      invoices: snapshot.invoices,
      paymentMethods: snapshot.paymentMethods,
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.billing.update" });
  }
}

export async function GET(request: Request) {
  return handleDashboardBillingGet(request);
}

export async function PATCH(request: Request) {
  return handleDashboardBillingPatch(request);
}
