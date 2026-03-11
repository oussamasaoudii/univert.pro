import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonBody } from "@/lib/security/request";
import { handleQueueWorkerPost } from "./route";

test("handleQueueWorkerPost blocks unauthenticated internal probes and records an audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleQueueWorkerPost(
    new Request("https://univert.pro/api/queue/worker", {
      method: "POST",
      body: JSON.stringify({ mode: "single" }),
    }),
    {
      hasValidInternalBearer: () => false,
      getAdminRequestUser: async () => null,
      enforceRouteRateLimit: async () => {
        throw new Error("rate limit should not run");
      },
      parseJsonBody: async () => {
        throw new Error("body parsing should not run");
      },
      processNextJob: async () => {
        throw new Error("job processing should not run");
      },
      runWorkerLoop: async () => {
        throw new Error("worker loop should not run");
      },
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthorized" });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.internal_api_unauthorized");
  assert.equal(auditCalls[0]?.resourceId, "/api/queue/worker");
});

test("handleQueueWorkerPost rejects malformed JSON with a safe 400 response and audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleQueueWorkerPost(
    new Request("https://univert.pro/api/queue/worker", {
      method: "POST",
      body: '{"mode":"batch"',
    }),
    {
      hasValidInternalBearer: () => true,
      getAdminRequestUser: async () => null,
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 29,
        retryAfterSeconds: 0,
      }),
      parseJsonBody,
      processNextJob: async () => {
        throw new Error("single-job processing should not run");
      },
      runWorkerLoop: async () => {
        throw new Error("worker loop should not run");
      },
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, "invalid_json");
  assert.equal(typeof payload.workerId, "string");
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.invalid_json_rejected");
});
