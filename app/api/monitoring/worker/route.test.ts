import test from "node:test";
import assert from "node:assert/strict";
import { handleMonitoringWorkerPost } from "./route";

test("handleMonitoringWorkerPost blocks missing bearer secrets and records an audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleMonitoringWorkerPost(
    new Request("https://univert.pro/api/monitoring/worker", {
      method: "POST",
    }),
    {
      assessWebsiteHealth: async () => {},
      enforceRouteRateLimit: async () => {
        throw new Error("rate limit should not run");
      },
      hasValidInternalBearer: () => false,
      listWebsitesForAdmin: async () => [],
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.internal_api_unauthorized");
  assert.equal(auditCalls[0]?.resourceId, "/api/monitoring/worker");
});

test("handleMonitoringWorkerPost blocks invalid bearer secrets and records an audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleMonitoringWorkerPost(
    new Request("https://univert.pro/api/monitoring/worker", {
      method: "POST",
      headers: {
        authorization: "Bearer wrong-secret",
      },
    }),
    {
      assessWebsiteHealth: async () => {},
      enforceRouteRateLimit: async () => {
        throw new Error("rate limit should not run");
      },
      hasValidInternalBearer: () => false,
      listWebsitesForAdmin: async () => [],
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.internal_api_unauthorized");
  assert.equal(auditCalls[0]?.resourceId, "/api/monitoring/worker");
});
