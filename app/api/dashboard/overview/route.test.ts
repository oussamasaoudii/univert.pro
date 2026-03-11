import test from "node:test";
import assert from "node:assert/strict";
import { handleDashboardOverviewGet } from "./route";

test("handleDashboardOverviewGet strips internal fields from dashboard read payloads", async () => {
  const response = await handleDashboardOverviewGet(
    new Request("https://univert.pro/api/dashboard/overview"),
    {
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 119,
        retryAfterSeconds: 0,
      }),
      getDashboardRequestUser: async () => ({
        id: "user-1",
        email: "user@example.com",
        role: "user",
        source: "mysql",
        sessionType: "user",
      }),
      getUserSubscription: async () => ({
        id: "sub-1",
        userId: "user-1",
        planName: "pro",
        status: "active",
        billingCycle: "monthly",
        renewalDate: "2026-04-09",
        createdAt: "2026-03-09T00:00:00.000Z",
        updatedAt: "2026-03-09T00:00:00.000Z",
      }),
      listDomainsByUser: async () => [
        {
          id: "domain-1",
          domain: "example.com",
          userId: "user-1",
          ownerEmail: "user@example.com",
          websiteName: "Project One",
          isPrimary: true,
          verificationStatus: "verified",
          sslStatus: "active",
          createdAt: "2026-03-09T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
        },
      ] as any,
      listUserActivities: async () => [
        {
          id: "activity-1",
          userId: "user-1",
          activityType: "website_created",
          message: "Created Project One",
          createdAt: "2026-03-09T00:00:00.000Z",
        },
      ] as any,
      listUserNotifications: async () => [
        {
          id: "notification-1",
          userId: "user-1",
          title: "Provisioning update",
          message: "Your website is ready",
          read: false,
          createdAt: "2026-03-09T00:00:00.000Z",
        },
      ] as any,
      listUserWebsites: async () => [
        {
          id: "site-1",
          userId: "user-1",
          ownerEmail: "user@example.com",
          templateId: "template-1",
          templateName: "Corporate Pro",
          templateStack: "Next.js",
          projectName: "Project One",
          status: "ready",
          subdomain: "project-one",
          customDomain: null,
          liveUrl: "https://project-one.univert.pro",
          dashboardUrl: "https://project-one.univert.pro/admin",
          provisioningJobId: "job-1",
          provisioningError: "should-not-leak",
          renewalDate: "2026-04-09",
          pageViews: 100,
          visits: 50,
          avgSessionDuration: "1:00",
          createdAt: "2026-03-09T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
        },
      ] as any,
    } as any,
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.subscription.planName, "pro");
  assert.equal("billingCycle" in payload.subscription, false);
  assert.equal(payload.websites[0].id, "site-1");
  assert.equal("ownerEmail" in payload.websites[0], false);
  assert.equal("dashboardUrl" in payload.websites[0], false);
  assert.equal("provisioningJobId" in payload.websites[0], false);
  assert.equal(payload.notifications[0].id, "notification-1");
  assert.equal("userId" in payload.notifications[0], false);
});

test("handleDashboardOverviewGet rejects admin sessions on dashboard endpoints", async () => {
  const response = await handleDashboardOverviewGet(
    new Request("https://univert.pro/api/dashboard/overview"),
    {
      enforceRouteRateLimit: async () => {
        throw new Error("rate limit should not run");
      },
      getDashboardRequestUser: async () => ({
        id: "admin-1",
        email: "admin@example.com",
        role: "admin",
        source: "mysql",
        sessionType: "admin",
      }),
      getUserSubscription: async () => null,
      listDomainsByUser: async () => [],
      listUserActivities: async () => [],
      listUserNotifications: async () => [],
      listUserWebsites: async () => [],
    } as any,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
});
