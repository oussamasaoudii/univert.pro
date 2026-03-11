import test from "node:test";
import assert from "node:assert/strict";
import { RateLimitError } from "@/lib/utils/errors";
import { parseJsonBody } from "@/lib/security/request";
import { handleForgotPasswordPost } from "./route";

function createForgotPasswordDeps(overrides: Record<string, unknown> = {}) {
  return {
    assertTrustedOrigin: () => {},
    consumeRateLimit: async () => ({
      allowed: true,
      attempts: 1,
      remaining: 2,
      retryAfterSeconds: 0,
    }),
    createAuditLog: async () => {},
    createPasswordResetToken: async () => ({ token: "reset-token" }),
    enforceRouteRateLimit: async () => ({
      allowed: true,
      attempts: 1,
      remaining: 4,
      retryAfterSeconds: 0,
    }),
    findUserByEmail: async () => null,
    parseJsonBody,
    securityAuditLog: async () => {},
    sendPasswordResetEmail: async () => {},
    ...overrides,
  };
}

test("handleForgotPasswordPost preserves enumeration safety for existing and missing users", async () => {
  let sentEmails = 0;

  const existingUserResponse = await handleForgotPasswordPost(
    new Request("https://univert.pro/api/auth/forgot-password", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        email: "known@example.com",
      }),
    }),
    createForgotPasswordDeps({
      findUserByEmail: async () => ({
        id: "user-1",
        email: "known@example.com",
        role: "user",
      }),
      sendPasswordResetEmail: async () => {
        sentEmails += 1;
      },
    }) as any,
  );

  const missingUserResponse = await handleForgotPasswordPost(
    new Request("https://univert.pro/api/auth/forgot-password", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        email: "missing@example.com",
      }),
    }),
    createForgotPasswordDeps() as any,
  );

  assert.equal(existingUserResponse.status, 202);
  assert.equal(missingUserResponse.status, 202);
  assert.deepEqual(
    await existingUserResponse.json(),
    await missingUserResponse.json(),
  );
  assert.equal(sentEmails, 1);
});

test("handleForgotPasswordPost records a rate-limit audit event for abusive IP traffic", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleForgotPasswordPost(
    new Request("https://univert.pro/api/auth/forgot-password", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "test-agent",
      },
      body: JSON.stringify({
        email: "known@example.com",
      }),
    }),
    createForgotPasswordDeps({
      createAuditLog: async (entry: Record<string, unknown>) => {
        auditCalls.push(entry);
      },
      enforceRouteRateLimit: async () => {
        throw new RateLimitError("too_many_requests", {
          scope: "auth-forgot-password-ip",
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
  assert.equal(auditCalls[0]?.resource_id, "auth-forgot-password-ip");
});
