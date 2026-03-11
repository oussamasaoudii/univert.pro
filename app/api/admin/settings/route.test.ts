import test from "node:test";
import assert from "node:assert/strict";
import { AuthenticationError } from "@/lib/utils/errors";
import { assertRecentAdminStepUp } from "@/lib/security/admin-session";
import { parseJsonBody } from "@/lib/security/request";
import { handleAdminSettingsGet, handleAdminSettingsPut } from "./route";

function createAdminSettingsDeps(overrides: Record<string, unknown> = {}) {
  return {
    assertRecentAdminStepUp,
    assertTrustedOrigin: () => {},
    createAuditLog: async () => {},
    getAdminMfaSummary: async () => ({
      enabled: true,
      enrolledAt: "2026-03-09T00:00:00.000Z",
      recoveryCodesRemaining: 5,
    }),
    getPlatformSettings: async () => ({
      platformName: "Univert",
      supportEmail: "support@univert.pro",
      maintenanceMode: false,
      allowNewSignups: true,
      requireEmailVerification: true,
      maintenanceMessage: "",
      s3Enabled: true,
      s3Endpoint: "https://s3.example.com",
      s3Region: "eu-west-1",
      s3Bucket: "uploads",
      s3AccessKey: "AKIA-SECRET-KEY",
      s3SecretKey: "very-secret-value",
      s3PublicUrl: "https://cdn.univert.pro",
      s3UsePathStyle: false,
      turnstileEnabled: true,
      turnstileSiteKey: "site-key",
      turnstileSecretKey: "turnstile-secret",
      createdAt: "2026-03-08T00:00:00.000Z",
      updatedAt: "2026-03-09T00:00:00.000Z",
    }),
    parseJsonBody,
    requireAdminRouteAccess: async () => ({
      adminUser: {
        id: "admin-1",
        stepUpVerifiedAt: new Date().toISOString(),
      },
      ipAddress: "203.0.113.10",
      userAgent: "test-agent",
    }),
    securityAuditLog: async () => {},
    updatePlatformSettings: async (payload: Record<string, unknown>) => ({
      platformName: "Univert",
      supportEmail: "support@univert.pro",
      maintenanceMode: false,
      allowNewSignups: true,
      requireEmailVerification: true,
      maintenanceMessage: "",
      s3Enabled: payload.s3Enabled ?? true,
      s3Endpoint: payload.s3Endpoint ?? "https://s3.example.com",
      s3Region: payload.s3Region ?? "eu-west-1",
      s3Bucket: payload.s3Bucket ?? "uploads",
      s3AccessKey: "AKIA-SECRET-KEY",
      s3SecretKey: "very-secret-value",
      s3PublicUrl: payload.s3PublicUrl ?? "https://cdn.univert.pro",
      s3UsePathStyle: payload.s3UsePathStyle ?? false,
      turnstileEnabled: true,
      turnstileSiteKey: "site-key",
      turnstileSecretKey: "turnstile-secret",
      createdAt: "2026-03-08T00:00:00.000Z",
      updatedAt: "2026-03-09T00:00:00.000Z",
    }),
    ...overrides,
  };
}

test("handleAdminSettingsGet masks secrets and disables caching on admin responses", async () => {
  const response = await handleAdminSettingsGet(
    new Request("https://univert.pro/api/admin/settings"),
    createAdminSettingsDeps() as any,
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store, max-age=0, must-revalidate");
  assert.equal(response.headers.get("Pragma"), "no-cache");
  assert.equal(response.headers.get("Expires"), "0");
  assert.match(payload.settings.s3SecretKey, /^•+/);
  assert.match(payload.settings.turnstileSecretKey, /^•+/);
  assert.equal(payload.settings.hasS3SecretKey, true);
  assert.equal(payload.settings.hasTurnstileSecretKey, true);
  assert.equal(payload.settings.s3SecretKey === "very-secret-value", false);
});

test("handleAdminSettingsGet falls back to S3-compatible .env aliases when storage fields are missing", async () => {
  const previousEnv = {
    AWS_BUCKET: process.env.AWS_BUCKET,
    AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION,
    AWS_ENDPOINT: process.env.AWS_ENDPOINT,
    AWS_URL: process.env.AWS_URL,
    AWS_USE_PATH_STYLE_ENDPOINT: process.env.AWS_USE_PATH_STYLE_ENDPOINT,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  };

  process.env.AWS_BUCKET = "ovmon-cdn";
  process.env.AWS_DEFAULT_REGION = "auto";
  process.env.AWS_ENDPOINT = "https://example.r2.cloudflarestorage.com";
  process.env.AWS_URL = "https://cdn.univert.pro";
  process.env.AWS_USE_PATH_STYLE_ENDPOINT = "false";
  process.env.AWS_ACCESS_KEY_ID = "r2-access-key";
  process.env.AWS_SECRET_ACCESS_KEY = "r2-secret-key";

  try {
    const response = await handleAdminSettingsGet(
      new Request("https://univert.pro/api/admin/settings"),
      createAdminSettingsDeps({
        getPlatformSettings: async () => ({
          platformName: "Univert",
          supportEmail: "support@univert.pro",
          maintenanceMode: false,
          allowNewSignups: true,
          requireEmailVerification: true,
          maintenanceMessage: "",
          s3Enabled: false,
          s3Endpoint: "",
          s3Region: "",
          s3Bucket: "",
          s3AccessKey: "",
          s3SecretKey: "",
          s3PublicUrl: "",
          s3UsePathStyle: false,
          turnstileEnabled: true,
          turnstileSiteKey: "site-key",
          turnstileSecretKey: "turnstile-secret",
          createdAt: "2026-03-08T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
        }),
      }) as any,
    );

    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.settings.s3Endpoint, "https://example.r2.cloudflarestorage.com");
    assert.equal(payload.settings.s3Region, "auto");
    assert.equal(payload.settings.s3Bucket, "ovmon-cdn");
    assert.equal(payload.settings.s3PublicUrl, "https://cdn.univert.pro");
    assert.equal(payload.settings.s3UsePathStyle, false);
    assert.equal(payload.settings.s3ConfigSource, "env");
    assert.equal(payload.settings.s3EnvFallbackActive, true);
    assert.match(payload.settings.s3AccessKey, /^•+/);
    assert.match(payload.settings.s3SecretKey, /^•+/);
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (typeof value === "undefined") {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});

test("handleAdminSettingsGet returns a safe 401 when admin access is rejected", async () => {
  const response = await handleAdminSettingsGet(
    new Request("https://univert.pro/api/admin/settings"),
    createAdminSettingsDeps({
      requireAdminRouteAccess: async () => {
        throw new AuthenticationError("unauthorized");
      },
    }) as any,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    error: "unauthorized",
    code: "AUTH_ERROR",
  });
  assert.equal(response.headers.get("Cache-Control"), "private, no-store, max-age=0, must-revalidate");
});

test("handleAdminSettingsPut requires recent admin step-up for privileged changes", async () => {
  const response = await handleAdminSettingsPut(
    new Request("https://univert.pro/api/admin/settings", {
      method: "PUT",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        maintenanceMode: true,
      }),
    }),
    createAdminSettingsDeps({
      requireAdminRouteAccess: async () => ({
        adminUser: {
          id: "admin-1",
          stepUpVerifiedAt: new Date(Date.now() - 20 * 60_000).toISOString(),
        },
        ipAddress: "203.0.113.10",
        userAgent: "test-agent",
      }),
      updatePlatformSettings: async () => {
        throw new Error("updatePlatformSettings should not run");
      },
    }) as any,
  );

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: "step_up_required",
    code: "PERMISSION_ERROR",
  });
  assert.equal(response.headers.get("Cache-Control"), "private, no-store, max-age=0, must-revalidate");
});

test("handleAdminSettingsPut forwards extra S3-compatible fields", async () => {
  let receivedPayload: Record<string, unknown> | null = null;

  const response = await handleAdminSettingsPut(
    new Request("https://univert.pro/api/admin/settings", {
      method: "PUT",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        s3Endpoint: "https://example.r2.cloudflarestorage.com",
        s3Region: "auto",
        s3Bucket: "ovmon-cdn",
        s3PublicUrl: "https://cdn.univert.pro",
        s3UsePathStyle: false,
      }),
    }),
    createAdminSettingsDeps({
      updatePlatformSettings: async (payload: Record<string, unknown>) => {
        receivedPayload = payload;
        return {
          platformName: "Univert",
          supportEmail: "support@univert.pro",
          maintenanceMode: false,
          allowNewSignups: true,
          requireEmailVerification: true,
          maintenanceMessage: "",
          s3Enabled: true,
          s3Endpoint: String(payload.s3Endpoint || ""),
          s3Region: String(payload.s3Region || ""),
          s3Bucket: String(payload.s3Bucket || ""),
          s3AccessKey: "AKIA-SECRET-KEY",
          s3SecretKey: "very-secret-value",
          s3PublicUrl: String(payload.s3PublicUrl || ""),
          s3UsePathStyle: Boolean(payload.s3UsePathStyle),
          turnstileEnabled: true,
          turnstileSiteKey: "site-key",
          turnstileSecretKey: "turnstile-secret",
          createdAt: "2026-03-08T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
        };
      },
    }) as any,
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal((receivedPayload as Record<string, unknown> | null)?.["s3PublicUrl"], "https://cdn.univert.pro");
  assert.equal((receivedPayload as Record<string, unknown> | null)?.["s3UsePathStyle"], false);
  assert.equal(payload.settings.s3PublicUrl, "https://cdn.univert.pro");
  assert.equal(payload.settings.s3UsePathStyle, false);
});
