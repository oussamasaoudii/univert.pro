import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonBody } from "@/lib/security/request";
import { handleProvisioningStatusGet } from "@/app/api/provisioning/[jobId]/route";
import { handleProvisioningWebsiteGet } from "@/app/api/provisioning/website/[websiteId]/route";
import {
  handleDashboardDomainDelete,
  handleDashboardDomainGet,
  handleDashboardDomainPatch,
} from "@/app/api/dashboard/domains/[id]/route";
import { handleDashboardDomainVerifyPost } from "@/app/api/dashboard/domains/[id]/verify/route";
import {
  handleDashboardSupportTicketGet,
  handleDashboardSupportTicketPatch,
} from "@/app/api/dashboard/support/tickets/[id]/route";

test("handleProvisioningStatusGet returns provisioning data for the owning user", async () => {
  const response = await handleProvisioningStatusGet(
    new Request("https://univert.pro/api/provisioning/job-1"),
    { params: Promise.resolve({ jobId: "11111111-1111-4111-8111-111111111111" }) },
    {
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 119,
        retryAfterSeconds: 0,
      }),
      getAuthenticatedRequestUser: async () =>
        ({ id: "user-1", role: "user", source: "mysql" }) as any,
      getProvisioningJob: async () =>
        ({ id: "11111111-1111-4111-8111-111111111111", website_id: "site-1" }) as any,
      getRecentJobLogs: async () => [{ id: "log-1" }] as any,
      getJobsForProvisioning: async () =>
        [{ id: "queue-1", status: "processing", attempt_count: 1, max_attempts: 3 }] as any,
      getWebsiteById: async (_websiteId: string, userId?: string) =>
        userId === "user-1"
          ? ({ id: "site-1", ownerEmail: "owner@example.com" }) as any
          : null,
      securityAuditLog: async () => {
        throw new Error("audit log should not run for owner access");
      },
    },
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.job.id, "11111111-1111-4111-8111-111111111111");
  assert.equal(payload.website.id, "site-1");
  assert.equal(payload.queue.id, "queue-1");
});

test("handleProvisioningStatusGet rejects cross-tenant job access with audit logging", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleProvisioningStatusGet(
    new Request("https://univert.pro/api/provisioning/job-1"),
    { params: Promise.resolve({ jobId: "11111111-1111-4111-8111-111111111111" }) },
    {
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 119,
        retryAfterSeconds: 0,
      }),
      getAuthenticatedRequestUser: async () =>
        ({ id: "user-2", role: "user", source: "mysql" }) as any,
      getProvisioningJob: async () =>
        ({ id: "11111111-1111-4111-8111-111111111111", website_id: "site-1" }) as any,
      getRecentJobLogs: async () => {
        throw new Error("logs should not be fetched for cross-tenant access");
      },
      getJobsForProvisioning: async () => {
        throw new Error("queue jobs should not be fetched for cross-tenant access");
      },
      getWebsiteById: async (_websiteId: string, userId?: string) =>
        userId ? null : ({ id: "site-1", ownerEmail: "owner@example.com" }) as any,
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.resourceType, "provisioning_job");
  assert.equal(auditCalls[0]?.targetId, "11111111-1111-4111-8111-111111111111");
});

test("handleProvisioningStatusGet still allows admin access to provisioning jobs", async () => {
  const response = await handleProvisioningStatusGet(
    new Request("https://univert.pro/api/provisioning/job-1"),
    { params: Promise.resolve({ jobId: "11111111-1111-4111-8111-111111111111" }) },
    {
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 119,
        retryAfterSeconds: 0,
      }),
      getAuthenticatedRequestUser: async () =>
        ({ id: "admin-1", role: "admin", source: "mysql" }) as any,
      getProvisioningJob: async () =>
        ({ id: "11111111-1111-4111-8111-111111111111", website_id: "site-1" }) as any,
      getRecentJobLogs: async () => [],
      getJobsForProvisioning: async () => [],
      getWebsiteById: async () => ({ id: "site-1", ownerEmail: "owner@example.com" }) as any,
      securityAuditLog: async () => {
        throw new Error("audit log should not run for admin access");
      },
    },
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.website.id, "site-1");
});

test("handleProvisioningWebsiteGet returns provisioning details for the owning user", async () => {
  const response = await handleProvisioningWebsiteGet(
    new Request("https://univert.pro/api/provisioning/website/site-1"),
    { params: Promise.resolve({ websiteId: "site-1" }) },
    {
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 119,
        retryAfterSeconds: 0,
      }),
      getAuthenticatedRequestUser: async () =>
        ({ id: "user-1", role: "user", source: "mysql" }) as any,
      getJobsForProvisioning: async () => [],
      getProvisioningJob: async () => ({ id: "job-1" }) as any,
      getRecentJobLogs: async () => [{ id: "log-1" }] as any,
      getWebsiteById: async (_websiteId: string, userId?: string) =>
        userId === "user-1"
          ? ({ id: "site-1", provisioningJobId: "job-1" }) as any
          : null,
      getWebsiteProvisioningJob: async () => null,
      securityAuditLog: async () => {
        throw new Error("audit log should not run for owner access");
      },
    },
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.website.id, "site-1");
  assert.equal(payload.job.id, "job-1");
});

test("handleProvisioningWebsiteGet rejects cross-tenant website access with audit logging", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleProvisioningWebsiteGet(
    new Request("https://univert.pro/api/provisioning/website/site-1"),
    { params: Promise.resolve({ websiteId: "site-1" }) },
    {
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 119,
        retryAfterSeconds: 0,
      }),
      getAuthenticatedRequestUser: async () =>
        ({ id: "user-2", role: "user", source: "mysql" }) as any,
      getJobsForProvisioning: async () => {
        throw new Error("queue lookup should not run for cross-tenant access");
      },
      getProvisioningJob: async () => {
        throw new Error("job lookup should not run for cross-tenant access");
      },
      getRecentJobLogs: async () => {
        throw new Error("logs should not run for cross-tenant access");
      },
      getWebsiteById: async (_websiteId: string, userId?: string) =>
        userId ? null : ({ id: "site-1", provisioningJobId: "job-1" }) as any,
      getWebsiteProvisioningJob: async () => null,
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "website_not_found" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.resourceType, "website");
  assert.equal(auditCalls[0]?.targetId, "site-1");
});

test("handleProvisioningWebsiteGet returns 401 for unauthenticated requests", async () => {
  const response = await handleProvisioningWebsiteGet(
    new Request("https://univert.pro/api/provisioning/website/site-1"),
    { params: Promise.resolve({ websiteId: "site-1" }) },
    {
      enforceRouteRateLimit: async () => {
        throw new Error("rate limit should not run for unauthorized access");
      },
      getAuthenticatedRequestUser: async () => null,
      getJobsForProvisioning: async () => [],
      getProvisioningJob: async () => null,
      getRecentJobLogs: async () => [],
      getWebsiteById: async () => null,
      getWebsiteProvisioningJob: async () => null,
      securityAuditLog: async () => {},
    },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
});

test("handleProvisioningWebsiteGet still allows admin access to website provisioning details", async () => {
  const response = await handleProvisioningWebsiteGet(
    new Request("https://univert.pro/api/provisioning/website/site-1"),
    { params: Promise.resolve({ websiteId: "site-1" }) },
    {
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 119,
        retryAfterSeconds: 0,
      }),
      getAuthenticatedRequestUser: async () =>
        ({ id: "admin-1", role: "admin", source: "mysql" }) as any,
      getJobsForProvisioning: async () => [],
      getProvisioningJob: async () => ({ id: "job-1" }) as any,
      getRecentJobLogs: async () => [],
      getWebsiteById: async () => ({ id: "site-1", provisioningJobId: "job-1" }) as any,
      getWebsiteProvisioningJob: async () => null,
      securityAuditLog: async () => {
        throw new Error("audit log should not run for admin access");
      },
    },
  );

  assert.equal(response.status, 200);
});

function createDashboardDomainDeps() {
  return {
    assignDashboardDomainToWebsiteForUser: async () => ({
      success: true,
      domain: { id: "domain-1" },
      message: "bound",
    }),
    createUserActivity: async () => true,
    createUserNotification: async () => true,
    deleteDashboardDomainForUser: async () => ({ success: true }),
    enforceRouteRateLimit: async () => ({
      allowed: true,
      attempts: 1,
      remaining: 10,
      retryAfterSeconds: 0,
    }),
    getAuthenticatedRequestUser: async () =>
      ({ id: "user-1", role: "user", source: "mysql" }) as any,
    getDomain: async () => null,
    getOwnedDashboardDomain: async () => null,
    listDashboardDomainsForUser: async () => [],
    parseJsonBody,
    securityAuditLog: async () => {},
    setPrimaryDomain: async () => undefined,
  };
}

test("handleDashboardDomainGet returns a domain for the owning user", async () => {
  const deps = createDashboardDomainDeps();
  deps.getOwnedDashboardDomain = async () => ({ id: "domain-1", domain: "a.example" }) as any;

  const response = await handleDashboardDomainGet(
    new Request("https://univert.pro/api/dashboard/domains/domain-1"),
    { params: Promise.resolve({ id: "domain-1" }) },
    deps,
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.domain.id, "domain-1");
});

test("handleDashboardDomainGet rejects cross-tenant domain reads with audit logging", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const deps = createDashboardDomainDeps();
  deps.getAuthenticatedRequestUser = async () =>
    ({ id: "user-2", role: "user", source: "mysql" }) as any;
  deps.getDomain = async () => ({ id: "domain-1", user_id: "user-1" }) as any;
  deps.securityAuditLog = async (_request, input) => {
    auditCalls.push(input as unknown as Record<string, unknown>);
  };

  const response = await handleDashboardDomainGet(
    new Request("https://univert.pro/api/dashboard/domains/domain-1"),
    { params: Promise.resolve({ id: "domain-1" }) },
    deps,
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "domain_not_found" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.resourceType, "domain");
  assert.equal(auditCalls[0]?.targetId, "domain-1");
});

test("handleDashboardDomainPatch allows the owning user to bind a domain", async () => {
  const deps = createDashboardDomainDeps();
  deps.getDomain = async () =>
    ({ id: "domain-1", user_id: "user-1", domain: "a.example", website_id: null }) as any;
  deps.getOwnedDashboardDomain = async () =>
    ({ id: "domain-1", domain: "a.example", websiteId: "site-2" }) as any;

  const response = await handleDashboardDomainPatch(
    new Request("https://univert.pro/api/dashboard/domains/domain-1", {
      method: "PATCH",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({ websiteId: "site-2" }),
    }),
    { params: Promise.resolve({ id: "domain-1" }) },
    deps,
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.ok, true);
});

test("handleDashboardDomainPatch rejects cross-tenant domain mutations with audit logging", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const deps = createDashboardDomainDeps();
  deps.getAuthenticatedRequestUser = async () =>
    ({ id: "user-2", role: "user", source: "mysql" }) as any;
  deps.getDomain = async () => ({ id: "domain-1", user_id: "user-1" }) as any;
  deps.securityAuditLog = async (_request, input) => {
    auditCalls.push(input as unknown as Record<string, unknown>);
  };

  const response = await handleDashboardDomainPatch(
    new Request("https://univert.pro/api/dashboard/domains/domain-1", {
      method: "PATCH",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({ websiteId: "site-2" }),
    }),
    { params: Promise.resolve({ id: "domain-1" }) },
    deps,
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "domain_not_found" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.targetId, "domain-1");
});

test("handleDashboardDomainDelete rejects cross-tenant deletions with audit logging", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const deps = createDashboardDomainDeps();
  deps.getAuthenticatedRequestUser = async () =>
    ({ id: "user-2", role: "user", source: "mysql" }) as any;
  deps.getDomain = async () => ({ id: "domain-1", user_id: "user-1" }) as any;
  deps.securityAuditLog = async (_request, input) => {
    auditCalls.push(input as unknown as Record<string, unknown>);
  };

  const response = await handleDashboardDomainDelete(
    new Request("https://univert.pro/api/dashboard/domains/domain-1", {
      method: "DELETE",
      headers: {
        origin: "https://univert.pro",
      },
    }),
    { params: Promise.resolve({ id: "domain-1" }) },
    deps,
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "domain_not_found" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.targetId, "domain-1");
});

function createDashboardDomainVerifyDeps() {
  return {
    createUserActivity: async () => true,
    createUserNotification: async () => true,
    enforceRouteRateLimit: async () => ({
      allowed: true,
      attempts: 1,
      remaining: 19,
      retryAfterSeconds: 0,
    }),
    getAuthenticatedRequestUser: async () =>
      ({ id: "user-1", role: "user", source: "mysql" }) as any,
    getDomain: async () => null,
    securityAuditLog: async () => {},
    verifyDashboardDomainForUser: async () => ({
      success: true,
      message: "verified",
      domain: { id: "domain-1", websiteId: null },
    }),
  };
}

test("handleDashboardDomainVerifyPost verifies domains for the owning user", async () => {
  const response = await handleDashboardDomainVerifyPost(
    new Request("https://univert.pro/api/dashboard/domains/domain-1/verify", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
    }),
    { params: Promise.resolve({ id: "domain-1" }) },
    createDashboardDomainVerifyDeps(),
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.domain.id, "domain-1");
});

test("handleDashboardDomainVerifyPost rejects cross-tenant verification attempts with audit logging", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const deps = createDashboardDomainVerifyDeps();
  deps.getAuthenticatedRequestUser = async () =>
    ({ id: "user-2", role: "user", source: "mysql" }) as any;
  deps.getDomain = async () => ({ id: "domain-1", user_id: "user-1" }) as any;
  deps.securityAuditLog = async (_request, input) => {
    auditCalls.push(input as unknown as Record<string, unknown>);
  };

  const response = await handleDashboardDomainVerifyPost(
    new Request("https://univert.pro/api/dashboard/domains/domain-1/verify", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
    }),
    { params: Promise.resolve({ id: "domain-1" }) },
    deps,
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: "domain_not_found",
    pending: false,
  });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.targetId, "domain-1");
});

function createDashboardSupportTicketDeps() {
  return {
    addSupportTicketMessage: async () => true,
    enforceRouteRateLimit: async () => ({
      allowed: true,
      attempts: 1,
      remaining: 29,
      retryAfterSeconds: 0,
    }),
    getAuthenticatedRequestUser: async () =>
      ({ id: "user-1", role: "user", source: "mysql" }) as any,
    getSupportTicketById: async () => null,
    listSupportTicketMessages: async () => [],
    parseJsonBody,
    securityAuditLog: async () => {},
  };
}

test("handleDashboardSupportTicketGet returns ticket details for the owning user", async () => {
  const deps = createDashboardSupportTicketDeps();
  deps.getSupportTicketById = async () => ({ id: "ticket-1", userId: "user-1" }) as any;
  deps.listSupportTicketMessages = async () => [{ id: "msg-1" }] as any;

  const response = await handleDashboardSupportTicketGet(
    new Request("https://univert.pro/api/dashboard/support/tickets/ticket-1"),
    { params: Promise.resolve({ id: "ticket-1" }) },
    deps,
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.ticket.id, "ticket-1");
  assert.equal(payload.messages[0].id, "msg-1");
});

test("handleDashboardSupportTicketGet rejects cross-tenant reads with audit logging", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const deps = createDashboardSupportTicketDeps();
  deps.getAuthenticatedRequestUser = async () =>
    ({ id: "user-2", role: "user", source: "mysql" }) as any;
  deps.getSupportTicketById = async () => ({ id: "ticket-1", userId: "user-1" }) as any;
  deps.securityAuditLog = async (_request, input) => {
    auditCalls.push(input as unknown as Record<string, unknown>);
  };

  const response = await handleDashboardSupportTicketGet(
    new Request("https://univert.pro/api/dashboard/support/tickets/ticket-1"),
    { params: Promise.resolve({ id: "ticket-1" }) },
    deps,
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "not_found" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.resourceType, "support_ticket");
  assert.equal(auditCalls[0]?.targetId, "ticket-1");
});

test("handleDashboardSupportTicketGet returns 401 for unauthenticated requests", async () => {
  const deps = createDashboardSupportTicketDeps();
  deps.getAuthenticatedRequestUser = async () => null;

  const response = await handleDashboardSupportTicketGet(
    new Request("https://univert.pro/api/dashboard/support/tickets/ticket-1"),
    { params: Promise.resolve({ id: "ticket-1" }) },
    deps,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
});

test("handleDashboardSupportTicketPatch allows the owning user to reply", async () => {
  const deps = createDashboardSupportTicketDeps();
  deps.getSupportTicketById = async () => ({ id: "ticket-1", userId: "user-1" }) as any;
  deps.listSupportTicketMessages = async () => [{ id: "msg-2" }] as any;

  const response = await handleDashboardSupportTicketPatch(
    new Request("https://univert.pro/api/dashboard/support/tickets/ticket-1", {
      method: "PATCH",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({ message: "Reply" }),
    }),
    { params: Promise.resolve({ id: "ticket-1" }) },
    deps,
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.messages[0].id, "msg-2");
});

test("handleDashboardSupportTicketPatch rejects cross-tenant replies with audit logging", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const deps = createDashboardSupportTicketDeps();
  deps.getAuthenticatedRequestUser = async () =>
    ({ id: "user-2", role: "user", source: "mysql" }) as any;
  deps.getSupportTicketById = async () => ({ id: "ticket-1", userId: "user-1" }) as any;
  deps.securityAuditLog = async (_request, input) => {
    auditCalls.push(input as unknown as Record<string, unknown>);
  };

  const response = await handleDashboardSupportTicketPatch(
    new Request("https://univert.pro/api/dashboard/support/tickets/ticket-1", {
      method: "PATCH",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({ message: "Reply" }),
    }),
    { params: Promise.resolve({ id: "ticket-1" }) },
    deps,
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "not_found" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.targetId, "ticket-1");
});
