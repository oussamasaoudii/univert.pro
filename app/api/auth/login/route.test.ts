import test from "node:test";
import assert from "node:assert/strict";
import { RateLimitError } from "@/lib/utils/errors";
import { parseJsonBody } from "@/lib/security/request";
import { handleLoginPost } from "./route";

test("handleLoginPost rejects malformed JSON with a safe 400 response and audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleLoginPost(
    new Request("https://univert.pro/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: '{"email":"test@example.com","password":"secret"',
    }),
    {
      applyProgressiveDelay: async () => {},
      assertTrustedOrigin: () => {},
      authenticateUser: async () => {
        throw new Error("authenticateUser should not run");
      },
      clearRateLimit: async () => {},
      consumeRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 4,
        retryAfterSeconds: 0,
      }),
      createAuditLog: async () => {},
      createUserSessionRecord: async () => {
        throw new Error("createUserSessionRecord should not run");
      },
      createUserSessionToken: () => "session-token",
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 9,
        retryAfterSeconds: 0,
      }),
      getLocalAdminCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getUserSessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" }),
      parseJsonBody,
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "invalid_json",
    code: "VALIDATION_ERROR",
  });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.invalid_json_rejected");
  assert.equal(auditCalls[0]?.resourceId, "/api/auth/login");
});

test("handleLoginPost rejects invalid schema with a safe 400 response and audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleLoginPost(
    new Request("https://univert.pro/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        email: 123,
        password: ["wrong"],
      }),
    }),
    {
      applyProgressiveDelay: async () => {},
      assertTrustedOrigin: () => {},
      authenticateUser: async () => {
        throw new Error("authenticateUser should not run");
      },
      clearRateLimit: async () => {},
      consumeRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 4,
        retryAfterSeconds: 0,
      }),
      createAuditLog: async () => {},
      createUserSessionRecord: async () => {
        throw new Error("createUserSessionRecord should not run");
      },
      createUserSessionToken: () => "session-token",
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 9,
        retryAfterSeconds: 0,
      }),
      getLocalAdminCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getUserSessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" }),
      parseJsonBody,
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "invalid_request_body",
    code: "VALIDATION_ERROR",
  });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.invalid_schema_rejected");
  assert.equal(auditCalls[0]?.resourceId, "/api/auth/login");
});

test("handleLoginPost enforces account failure rate limits and records abuse events", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const rateLimitInputs: Array<Record<string, unknown>> = [];

  const response = await handleLoginPost(
    new Request("https://univert.pro/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "test-agent",
      },
      body: JSON.stringify({
        email: "user@example.com",
        password: "wrong-password",
      }),
    }),
    {
      applyProgressiveDelay: async () => {},
      assertTrustedOrigin: () => {},
      authenticateUser: async () => ({ error: "invalid_credentials" }),
      clearRateLimit: async () => {},
      consumeRateLimit: async (input) => {
        rateLimitInputs.push(input as unknown as Record<string, unknown>);
        return {
          allowed: false,
          attempts: 6,
          remaining: 0,
          retryAfterSeconds: 1800,
        };
      },
      createAuditLog: async (entry) => {
        auditCalls.push(entry as unknown as Record<string, unknown>);
      },
      createUserSessionRecord: async () => {
        throw new Error("createUserSessionRecord should not run");
      },
      createUserSessionToken: () => "session-token",
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 9,
        retryAfterSeconds: 0,
      }),
      getLocalAdminCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getUserSessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" }),
      parseJsonBody,
      securityAuditLog: async () => {},
    },
  );

  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), { error: "too_many_requests" });
  assert.equal(rateLimitInputs.length, 1);
  assert.equal(rateLimitInputs[0]?.limit, 5);
  assert.deepEqual(
    auditCalls.map((entry) => entry.action),
    [
      "security.repeated_failed_login_detected",
      "security.rate_limit_exceeded",
    ],
  );
});

test("handleLoginPost records an audit event when the IP route limit is exceeded", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleLoginPost(
    new Request("https://univert.pro/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "test-agent",
      },
      body: JSON.stringify({
        email: "user@example.com",
        password: "wrong-password",
      }),
    }),
    {
      applyProgressiveDelay: async () => {},
      assertTrustedOrigin: () => {},
      authenticateUser: async () => {
        throw new Error("authenticateUser should not run");
      },
      clearRateLimit: async () => {},
      consumeRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 4,
        retryAfterSeconds: 0,
      }),
      createAuditLog: async (entry) => {
        auditCalls.push(entry as unknown as Record<string, unknown>);
      },
      createUserSessionRecord: async () => {
        throw new Error("createUserSessionRecord should not run");
      },
      createUserSessionToken: () => "session-token",
      enforceRouteRateLimit: async () => {
        throw new RateLimitError("too_many_requests", {
          scope: "auth-login-ip",
        });
      },
      getLocalAdminCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getUserSessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" }),
      parseJsonBody,
      securityAuditLog: async () => {},
    },
  );

  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), {
    error: "too_many_requests",
    code: "RATE_LIMIT",
  });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.rate_limit_exceeded");
  assert.equal(auditCalls[0]?.resource_id, "auth-login-ip");
});
