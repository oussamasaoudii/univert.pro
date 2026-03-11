import test from "node:test";
import assert from "node:assert/strict";
import { RateLimitError } from "@/lib/utils/errors";
import { parseJsonBody } from "@/lib/security/request";
import { handleAdminLoginPost } from "./route";

test("handleAdminLoginPost rejects malformed JSON with a safe 400 response and audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleAdminLoginPost(
    new Request("https://univert.pro/api/auth/admin-login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: '{"email":"admin@example.com","password":"secret"',
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
        remaining: 3,
        retryAfterSeconds: 0,
      }),
      createAdminMfaChallengeToken: () => "challenge-token",
      createAuditLog: async () => {},
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 4,
        retryAfterSeconds: 0,
      }),
      getAdminMfaChallengeCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getAdminMfaSummary: async () => null,
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
  assert.equal(auditCalls[0]?.resourceId, "/api/auth/admin-login");
});

test("handleAdminLoginPost applies a stricter account failure limit than normal login", async () => {
  const rateLimitInputs: Array<Record<string, unknown>> = [];

  const response = await handleAdminLoginPost(
    new Request("https://univert.pro/api/auth/admin-login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        email: "admin@example.com",
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
          allowed: true,
          attempts: 1,
          remaining: 3,
          retryAfterSeconds: 0,
        };
      },
      createAdminMfaChallengeToken: () => "challenge-token",
      createAuditLog: async () => {},
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 4,
        retryAfterSeconds: 0,
      }),
      getAdminMfaChallengeCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getAdminMfaSummary: async () => null,
      getLocalAdminCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getUserSessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" }),
      parseJsonBody,
      securityAuditLog: async () => {},
    },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "invalid_credentials" });
  assert.equal(rateLimitInputs.length, 1);
  assert.equal(rateLimitInputs[0]?.limit, 4);
});

test("handleAdminLoginPost returns 429 and records abuse events when admin login failures are repeated", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleAdminLoginPost(
    new Request("https://univert.pro/api/auth/admin-login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "test-agent",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "wrong-password",
      }),
    }),
    {
      applyProgressiveDelay: async () => {},
      assertTrustedOrigin: () => {},
      authenticateUser: async () => ({ error: "invalid_credentials" }),
      clearRateLimit: async () => {},
      consumeRateLimit: async () => ({
        allowed: false,
        attempts: 4,
        remaining: 0,
        retryAfterSeconds: 3600,
      }),
      createAdminMfaChallengeToken: () => "challenge-token",
      createAuditLog: async (entry) => {
        auditCalls.push(entry as unknown as Record<string, unknown>);
      },
      enforceRouteRateLimit: async () => ({
        allowed: true,
        attempts: 1,
        remaining: 4,
        retryAfterSeconds: 0,
      }),
      getAdminMfaChallengeCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getAdminMfaSummary: async () => null,
      getLocalAdminCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getUserSessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" }),
      parseJsonBody,
      securityAuditLog: async () => {},
    },
  );

  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), { error: "too_many_requests" });
  assert.deepEqual(
    auditCalls.map((entry) => entry.action),
    [
      "security.repeated_failed_login_detected",
      "security.rate_limit_exceeded",
    ],
  );
});

test("handleAdminLoginPost records an audit event when the admin IP route limit is exceeded", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleAdminLoginPost(
    new Request("https://univert.pro/api/auth/admin-login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "test-agent",
      },
      body: JSON.stringify({
        email: "admin@example.com",
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
        remaining: 3,
        retryAfterSeconds: 0,
      }),
      createAdminMfaChallengeToken: () => "challenge-token",
      createAuditLog: async (entry) => {
        auditCalls.push(entry as unknown as Record<string, unknown>);
      },
      enforceRouteRateLimit: async () => {
        throw new RateLimitError("too_many_requests", {
          scope: "auth-admin-login-ip",
        });
      },
      getAdminMfaChallengeCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
      getAdminMfaSummary: async () => null,
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
  assert.equal(auditCalls[0]?.resource_id, "auth-admin-login-ip");
});
