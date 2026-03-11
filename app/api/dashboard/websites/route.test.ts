import test from "node:test";
import assert from "node:assert/strict";
import { handleDashboardWebsitesGet } from "./route";

test("handleDashboardWebsitesGet scopes data to the authenticated user and strips internal website fields", async () => {
  const loaderCalls: Array<[string, number?]> = [];

  const response = await handleDashboardWebsitesGet(
    new Request("https://univert.pro/api/dashboard/websites"),
    {
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 179,
        retryAfterSeconds: 0,
      }),
      getDashboardRequestUser: async () => ({
        id: "user-1",
        email: "user@example.com",
        role: "user",
        source: "mysql",
        sessionType: "user",
      }),
      listDomainsByUser: async (userId: string) => {
        loaderCalls.push([userId]);
        return [
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
        ] as any;
      },
      listTemplates: async () => [{ id: "template-1", stack: "Next.js" }] as any,
      listUserActivities: async (userId: string, limit: number) => {
        loaderCalls.push([userId, limit]);
        return [
          {
            id: "activity-1",
            userId,
            activityType: "website_created",
            message: "Created Project One",
            createdAt: "2026-03-09T00:00:00.000Z",
          },
        ] as any;
      },
      listUserWebsites: async (userId: string) => {
        loaderCalls.push([userId]);
        return [
          {
            id: "site-1",
            userId,
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
        ] as any;
      },
    } as any,
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(loaderCalls.length, 3);
  assert.equal(
    loaderCalls.filter((call) => call[0] === "user-1").length,
    3,
  );
  assert.equal(
    loaderCalls.some((call) => call[1] === 12),
    true,
  );
  assert.deepEqual(payload.domains, [{ id: "domain-1", domain: "example.com" }]);
  assert.equal(payload.websites[0].id, "site-1");
  assert.equal("ownerEmail" in payload.websites[0], false);
  assert.equal("userId" in payload.websites[0], false);
  assert.equal("provisioningJobId" in payload.websites[0], false);
  assert.equal("provisioningError" in payload.websites[0], false);
});

test("handleDashboardWebsitesGet returns 401 for unauthenticated requests", async () => {
  const response = await handleDashboardWebsitesGet(
    new Request("https://univert.pro/api/dashboard/websites"),
    {
      enforceRouteRateLimit: async () => {
        throw new Error("rate limit should not run");
      },
      getDashboardRequestUser: async () => null,
      listDomainsByUser: async () => [],
      listTemplates: async () => [],
      listUserActivities: async () => [],
      listUserWebsites: async () => [],
    } as any,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
});

test("handleDashboardWebsitesGet rejects admin sessions on dashboard endpoints", async () => {
  const response = await handleDashboardWebsitesGet(
    new Request("https://univert.pro/api/dashboard/websites"),
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
      listDomainsByUser: async () => [],
      listTemplates: async () => [],
      listUserActivities: async () => [],
      listUserWebsites: async () => [],
    } as any,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
});
