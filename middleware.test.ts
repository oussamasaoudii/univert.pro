import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

test("middleware rejects cross-origin mutating API requests", async () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://univert.pro";

  const response = await middleware(
    new NextRequest("https://univert.pro/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
      },
    }),
  );

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "invalid_request_origin" });
});

test("middleware allows preview deployment mutating API requests", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousVercelEnv = process.env.VERCEL_ENV;
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  process.env.NODE_ENV = "production";
  process.env.VERCEL_ENV = "preview";
  process.env.NEXT_PUBLIC_APP_URL = "https://univert.pro";

  try {
    const response = await middleware(
      new NextRequest("https://univert-pro-git-main-oussamasaoudii.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
          origin: "https://univert-pro-git-main-oussamasaoudii.vercel.app",
        },
      }),
    );

    assert.equal(response.status, 200);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    process.env.VERCEL_ENV = previousVercelEnv;
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
  }
});

test("middleware enforces API request body size limits", async () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://univert.pro";

  const response = await middleware(
    new NextRequest("https://univert.pro/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
        "content-length": String(1024 * 1024 + 1),
      },
    }),
  );

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), { error: "request_body_too_large" });
});

test("middleware applies security headers and no-store caching to sensitive routes", async () => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  process.env.NEXT_PUBLIC_APP_URL = "https://univert.pro";

  try {
    const response = await middleware(
      new NextRequest("https://univert.pro/api/admin/overview"),
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
    assert.equal(
      response.headers.get("Strict-Transport-Security"),
      "max-age=31536000; includeSubDomains; preload",
    );
    assert.match(
      response.headers.get("Content-Security-Policy") || "",
      /frame-ancestors 'none'/,
    );
    assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
    assert.equal(response.headers.get("X-Frame-Options"), "DENY");
    assert.equal(
      response.headers.get("Referrer-Policy"),
      "strict-origin-when-cross-origin",
    );
    assert.equal(
      response.headers.get("Permissions-Policy"),
      "camera=(), microphone=(), geolocation=()",
    );
  } finally {
    process.env.NODE_ENV = previousEnv;
  }
});
