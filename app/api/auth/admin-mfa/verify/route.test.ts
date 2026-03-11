import test from "node:test";
import assert from "node:assert/strict";
import { RateLimitError } from "@/lib/utils/errors";
import { parseJsonBody } from "@/lib/security/request";
import { handleAdminMfaVerifyPost } from "./route";

function createAdminMfaVerifyDeps(overrides: Record<string, unknown> = {}) {
  return {
    assertTrustedOrigin: () => {},
    completeAdminMfaEnrollment: async () => ({ ok: true, method: "totp" }),
    createAuditLog: async () => {},
    createUserSessionRecord: async () => ({
      sessionId: "session-1",
    }),
    createUserSessionToken: () => "session-token",
    enforceRouteRateLimit: async () => ({
      allowed: true,
      attempts: 1,
      remaining: 9,
      retryAfterSeconds: 0,
    }),
    findUserById: async () => ({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      sessionVersion: 1,
    }),
    getAdminMfaChallengeCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
    getChallengeCookieValue: async () => "challenge-token",
    getLocalAdminCookieOptions: () => ({ httpOnly: true, sameSite: "strict" as const, secure: true, path: "/" }),
    getUserSessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" }),
    parseJsonBody,
    securityAuditLog: async () => {},
    verifyAdminMfaAssertion: async () => ({ ok: true, method: "totp" }),
    verifyAdminMfaChallengeToken: () => ({
      sub: "admin-1",
      email: "admin@example.com",
      purpose: "verify" as const,
      exp: Math.floor(Date.now() / 1000) + 600,
    }),
    ...overrides,
  };
}

test("handleAdminMfaVerifyPost returns 401 when the MFA challenge cookie is missing", async () => {
  const response = await handleAdminMfaVerifyPost(
    new Request("https://univert.pro/api/auth/admin-mfa/verify", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        code: "123456",
      }),
    }),
    createAdminMfaVerifyDeps({
      getChallengeCookieValue: async () => undefined,
      verifyAdminMfaChallengeToken: () => null,
    }) as any,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "challenge_required" });
});

test("handleAdminMfaVerifyPost rejects invalid schema with a safe 400 response and audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleAdminMfaVerifyPost(
    new Request("https://univert.pro/api/auth/admin-mfa/verify", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        code: ["wrong"],
      }),
    }),
    createAdminMfaVerifyDeps({
      securityAuditLog: async (_request: Request, input: Record<string, unknown>) => {
        auditCalls.push(input);
      },
    }) as any,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "invalid_request_body",
    code: "VALIDATION_ERROR",
  });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.invalid_schema_rejected");
  assert.equal(auditCalls[0]?.resourceId, "/api/auth/admin-mfa/verify");
});

test("handleAdminMfaVerifyPost records a rate-limit audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleAdminMfaVerifyPost(
    new Request("https://univert.pro/api/auth/admin-mfa/verify", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "test-agent",
      },
      body: JSON.stringify({
        code: "123456",
      }),
    }),
    createAdminMfaVerifyDeps({
      createAuditLog: async (entry: Record<string, unknown>) => {
        auditCalls.push(entry);
      },
      enforceRouteRateLimit: async () => {
        throw new RateLimitError("too_many_requests", {
          scope: "auth-admin-mfa-verify",
        });
      },
    }) as any,
  );

  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), {
    error: "too_many_requests",
    code: "RATE_LIMIT",
  });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.rate_limit_exceeded");
  assert.equal(auditCalls[0]?.resource_id, "auth-admin-mfa-verify");
});
