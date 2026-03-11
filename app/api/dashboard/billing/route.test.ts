import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonBody } from "@/lib/security/request";
import { handleDashboardBillingPatch } from "./route";

function createDashboardBillingDeps(overrides: Record<string, unknown> = {}) {
  return {
    assertTrustedOrigin: () => {},
    createUserActivity: async () => {},
    enforceRouteRateLimit: async () => ({
      allowed: true,
      attempts: 1,
      remaining: 19,
      retryAfterSeconds: 0,
    }),
    getAuthenticatedRequestUser: async () => ({
      id: "user-1",
      email: "user@example.com",
      role: "user",
      source: "mysql",
      sessionType: "user",
    }),
    getUserBillingSnapshot: async () => ({
      subscription: {
        planName: "pro",
        billingCycle: "yearly",
      },
      currentPlan: null,
      plans: [],
      invoices: [],
      paymentMethods: [],
    }),
    getUserSubscription: async () => ({
      id: "sub-1",
      userId: "user-1",
      planName: "pro",
      status: "active",
      billingCycle: "monthly",
      renewalDate: "2026-04-09",
    }),
    parseJsonBody,
    updateUserSubscriptionPlan: async () => ({
      id: "sub-1",
      userId: "user-1",
      planName: "pro",
      status: "active",
      billingCycle: "yearly",
      renewalDate: "2027-03-09",
    }),
    ...overrides,
  };
}

test("handleDashboardBillingPatch rejects direct self-service plan escalation", async () => {
  let updateCalled = false;

  const response = await handleDashboardBillingPatch(
    new Request("https://univert.pro/api/dashboard/billing", {
      method: "PATCH",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        planTier: "enterprise",
      }),
    }),
    createDashboardBillingDeps({
      updateUserSubscriptionPlan: async () => {
        updateCalled = true;
        throw new Error("updateUserSubscriptionPlan should not run");
      },
    }) as any,
  );

  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), {
    error: "plan_change_requires_checkout",
  });
  assert.equal(updateCalled, false);
});

test("handleDashboardBillingPatch still allows billing-cycle changes within the current plan", async () => {
  let activityCalls = 0;
  let updatePayload: Record<string, unknown> | null = null;

  const response = await handleDashboardBillingPatch(
    new Request("https://univert.pro/api/dashboard/billing", {
      method: "PATCH",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        billingCycle: "yearly",
      }),
    }),
    createDashboardBillingDeps({
      createUserActivity: async () => {
        activityCalls += 1;
      },
      updateUserSubscriptionPlan: async (_userId: string, updates: Record<string, unknown>) => {
        updatePayload = updates;
        return {
          id: "sub-1",
          userId: "user-1",
          planName: "pro",
          status: "active",
          billingCycle: "yearly",
          renewalDate: "2027-03-09",
        };
      },
    }) as any,
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(updatePayload, { billingCycle: "yearly" });
  assert.equal(activityCalls, 1);
  assert.equal(payload.ok, true);
  assert.equal(payload.subscription.planName, "pro");
});

test("handleDashboardBillingPatch rejects admin sessions on dashboard endpoints", async () => {
  const response = await handleDashboardBillingPatch(
    new Request("https://univert.pro/api/dashboard/billing", {
      method: "PATCH",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        billingCycle: "yearly",
      }),
    }),
    createDashboardBillingDeps({
      enforceRouteRateLimit: async () => {
        throw new Error("rate limit should not run");
      },
      getAuthenticatedRequestUser: async () => ({
        id: "admin-1",
        email: "admin@example.com",
        role: "admin",
        source: "mysql",
        sessionType: "admin",
      }),
    }) as any,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
});
