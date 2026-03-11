import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  assertTrustedOrigin,
  getRequestIp,
  hasValidInternalBearer,
  parseJsonBody,
} from "./request.ts";

test("assertTrustedOrigin allows same-origin mutating requests", () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://univert.pro";

  const request = new Request("https://univert.pro/api/auth/login", {
    method: "POST",
    headers: {
      origin: "https://univert.pro",
    },
  });

  assert.doesNotThrow(() => assertTrustedOrigin(request));
});

test("assertTrustedOrigin rejects cross-origin mutating requests", () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://univert.pro";

  const request = new Request("https://univert.pro/api/auth/login", {
    method: "POST",
    headers: {
      origin: "https://evil.example",
    },
  });

  assert.throws(() => assertTrustedOrigin(request), {
    message: "invalid_request_origin",
  });
});

test("assertTrustedOrigin allows preview deployment origins", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousVercelEnv = process.env.VERCEL_ENV;
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  process.env.NODE_ENV = "production";
  process.env.VERCEL_ENV = "preview";
  process.env.NEXT_PUBLIC_APP_URL = "https://univert.pro";

  try {
    const request = new Request("https://univert-pro-git-main-oussamasaoudii.vercel.app/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://univert-pro-git-main-oussamasaoudii.vercel.app",
      },
    });

    assert.doesNotThrow(() => assertTrustedOrigin(request));
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    process.env.VERCEL_ENV = previousVercelEnv;
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
  }
});

test("assertTrustedOrigin allows explicitly configured additional origins", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousAllowedOrigins = process.env.ALLOWED_REQUEST_ORIGINS;
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  process.env.NODE_ENV = "production";
  process.env.NEXT_PUBLIC_APP_URL = "https://univert.pro";
  process.env.ALLOWED_REQUEST_ORIGINS = "https://preview.v0.dev, preview.vusercontent.net";

  try {
    const request = new Request("https://univert.pro/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://preview.v0.dev",
      },
    });

    assert.doesNotThrow(() => assertTrustedOrigin(request));
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    process.env.ALLOWED_REQUEST_ORIGINS = previousAllowedOrigins;
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
  }
});

test("hasValidInternalBearer accepts configured internal secrets", () => {
  process.env.CRON_SECRET = "cron-secret";

  const request = new Request("https://univert.pro/api/queue/worker", {
    method: "POST",
    headers: {
      authorization: "Bearer cron-secret",
    },
  });

  assert.equal(hasValidInternalBearer(request), true);
});

test("parseJsonBody rejects unexpected fields for strict schemas", async () => {
  const request = new Request("https://univert.pro/api/test", {
    method: "POST",
    body: JSON.stringify({
      allowed: "value",
      unexpected: "field",
    }),
  });

  await assert.rejects(
    () =>
      parseJsonBody(
        request,
        z
          .object({
            allowed: z.string(),
          })
          .strict(),
      ),
    {
      message: "invalid_request_body",
    },
  );
});

test("parseJsonBody records an audit event for malformed JSON", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const request = new Request("https://univert.pro/api/test", {
    method: "POST",
    body: '{"email":"test@example.com"',
  });

  await assert.rejects(
    () =>
      parseJsonBody(
        request,
        z
          .object({
            email: z.string().email(),
          })
          .strict(),
        {
          audit: {
            resourceId: "/api/test",
            log: async (_auditRequest, input) => {
              auditCalls.push(input as unknown as Record<string, unknown>);
            },
          },
        },
      ),
    {
      message: "invalid_json",
    },
  );

  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.invalid_json_rejected");
  assert.equal(auditCalls[0]?.resourceId, "/api/test");
});

test("parseJsonBody records an audit event for invalid request bodies", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const request = new Request("https://univert.pro/api/test", {
    method: "POST",
    body: JSON.stringify({
      email: 123,
      extra: "field",
    }),
  });

  await assert.rejects(
    () =>
      parseJsonBody(
        request,
        z
          .object({
            email: z.string().email(),
          })
          .strict(),
        {
          audit: {
            resourceId: "/api/test",
            log: async (_auditRequest, input) => {
              auditCalls.push(input as unknown as Record<string, unknown>);
            },
          },
        },
      ),
    {
      message: "invalid_request_body",
    },
  );

  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.invalid_schema_rejected");
  assert.equal(auditCalls[0]?.resourceId, "/api/test");
});

test("getRequestIp prefers x-forwarded-for and trims whitespace", () => {
  const request = new Request("https://univert.pro/api/test", {
    headers: {
      "x-forwarded-for": "203.0.113.10, 198.51.100.2",
      "x-real-ip": "198.51.100.2",
    },
  });

  assert.equal(getRequestIp(request), "203.0.113.10");
});
