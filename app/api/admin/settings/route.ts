import { z } from "zod";
import { ADMIN_STEP_UP_WINDOW_MS, assertRecentAdminStepUp } from "@/lib/security/admin-session";
import { getAdminMfaSummary } from "@/lib/mysql/admin-mfa";
import {
  getPlatformSettings,
  resolvePlatformSettings,
  updatePlatformSettings,
} from "@/lib/mysql/settings";
import { createAuditLog } from "@/lib/utils/audit";
import { maskSecret } from "@/lib/security/crypto";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import { queueSecurityRequestAuditLog, type SecurityAuditLogger } from "@/lib/security/audit";
import { assertTrustedOrigin, parseJsonBody } from "@/lib/security/request";

const SECRET_MASK_PATTERN = /^•+/;

const adminSettingsSchema = z
  .object({
    platformName: z.string().trim().min(2).max(120).optional(),
    supportEmail: z.string().trim().email().max(191).optional(),
    maintenanceMode: z.boolean().optional(),
    allowNewSignups: z.boolean().optional(),
    requireEmailVerification: z.boolean().optional(),
    maintenanceMessage: z.string().max(5000).optional(),
    s3Enabled: z.boolean().optional(),
    s3Endpoint: z.string().trim().url().max(255).or(z.literal("")).optional(),
    s3Region: z.string().trim().max(120).optional(),
    s3Bucket: z.string().trim().max(191).optional(),
    s3AccessKey: z.string().trim().max(255).optional(),
    s3SecretKey: z.string().trim().max(255).optional(),
    s3PublicUrl: z.string().trim().url().max(255).or(z.literal("")).optional(),
    s3UsePathStyle: z.boolean().optional(),
    turnstileEnabled: z.boolean().optional(),
    turnstileSiteKey: z.string().trim().max(255).optional(),
    turnstileSecretKey: z.string().trim().max(255).optional(),
  })
  .strict();

export function sanitizeSettingsForClient(
  settings: Awaited<ReturnType<typeof resolvePlatformSettings>>,
) {
  return {
    ...settings,
    s3AccessKey: settings.s3AccessKey ? maskSecret(settings.s3AccessKey) : "",
    s3SecretKey: settings.s3SecretKey ? maskSecret(settings.s3SecretKey) : "",
    turnstileSecretKey: settings.turnstileSecretKey
      ? maskSecret(settings.turnstileSecretKey)
      : "",
    hasS3AccessKey: Boolean(settings.s3AccessKey),
    hasS3SecretKey: Boolean(settings.s3SecretKey),
    hasTurnstileSecretKey: Boolean(settings.turnstileSecretKey),
  };
}

function shouldPreserveSecret(value: string | undefined) {
  return typeof value === "string" && SECRET_MASK_PATTERN.test(value);
}

type AdminSettingsRouteDeps = {
  assertRecentAdminStepUp: typeof assertRecentAdminStepUp;
  assertTrustedOrigin: typeof assertTrustedOrigin;
  createAuditLog: typeof createAuditLog;
  getAdminMfaSummary: typeof getAdminMfaSummary;
  getPlatformSettings: typeof getPlatformSettings;
  parseJsonBody: typeof parseJsonBody;
  requireAdminRouteAccess: typeof requireAdminRouteAccess;
  securityAuditLog: SecurityAuditLogger;
  updatePlatformSettings: typeof updatePlatformSettings;
};

const adminSettingsRouteDeps: AdminSettingsRouteDeps = {
  assertRecentAdminStepUp,
  assertTrustedOrigin,
  createAuditLog,
  getAdminMfaSummary,
  getPlatformSettings,
  parseJsonBody,
  requireAdminRouteAccess,
  securityAuditLog: queueSecurityRequestAuditLog,
  updatePlatformSettings,
};

export async function handleAdminSettingsGet(
  request: Request,
  deps: AdminSettingsRouteDeps = adminSettingsRouteDeps,
) {
  try {
    const { adminUser } = await deps.requireAdminRouteAccess(request, {
      scope: "admin-settings-read",
      limit: 60,
      resourceId: "/api/admin/settings",
    });

    const settings = resolvePlatformSettings(await deps.getPlatformSettings());
    const mfa = await deps.getAdminMfaSummary(adminUser.id);

    return adminJson({
      settings: sanitizeSettingsForClient(settings),
      adminSecurity: {
        mfaRequired: true,
        mfaEnabled: mfa?.enabled ?? false,
        mfaEnrolledAt: mfa?.enrolledAt ?? null,
        recoveryCodesRemaining: mfa?.recoveryCodesRemaining ?? 0,
      },
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.settings.read" });
  }
}

export async function handleAdminSettingsPut(
  request: Request,
  deps: AdminSettingsRouteDeps = adminSettingsRouteDeps,
) {
  try {
    deps.assertTrustedOrigin(request);
    const { adminUser, ipAddress, userAgent } = await deps.requireAdminRouteAccess(request, {
      scope: "admin-settings-write",
      limit: 12,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
      resourceId: "/api/admin/settings",
    });
    deps.assertRecentAdminStepUp(adminUser.stepUpVerifiedAt, ADMIN_STEP_UP_WINDOW_MS);

    const currentSettings = await deps.getPlatformSettings();
    const body = await deps.parseJsonBody(request, adminSettingsSchema, {
      maxBytes: 64 * 1024,
      audit: {
        actorId: adminUser.id,
        actorType: "admin",
        log: deps.securityAuditLog,
        resourceId: "/api/admin/settings",
      },
    });

    const payload = {
      platformName: body.platformName,
      supportEmail: body.supportEmail,
      maintenanceMode: body.maintenanceMode,
      allowNewSignups: body.allowNewSignups,
      requireEmailVerification: body.requireEmailVerification,
      maintenanceMessage: body.maintenanceMessage,
      s3Enabled: body.s3Enabled,
      s3Endpoint: body.s3Endpoint,
      s3Region: body.s3Region,
      s3Bucket: body.s3Bucket,
      s3AccessKey: shouldPreserveSecret(body.s3AccessKey) ? undefined : body.s3AccessKey,
      s3SecretKey: shouldPreserveSecret(body.s3SecretKey) ? undefined : body.s3SecretKey,
      s3PublicUrl: body.s3PublicUrl,
      s3UsePathStyle: body.s3UsePathStyle,
      turnstileEnabled: body.turnstileEnabled,
      turnstileSiteKey: body.turnstileSiteKey,
      turnstileSecretKey: shouldPreserveSecret(body.turnstileSecretKey)
        ? undefined
        : body.turnstileSecretKey,
    };

    const settings = await deps.updatePlatformSettings(payload, adminUser.id);
    await deps.createAuditLog({
      actor_id: adminUser.id,
      actor_type: "admin",
      action: "admin.update_system_settings",
      resource_type: "platform_settings",
      resource_id: "1",
      changes: {
        changedKeys: Object.keys(body),
        sensitiveChanges: {
          s3AccessKey:
            body.s3AccessKey !== undefined &&
            !shouldPreserveSecret(body.s3AccessKey) &&
            body.s3AccessKey !== currentSettings.s3AccessKey,
          s3SecretKey:
            body.s3SecretKey !== undefined &&
            !shouldPreserveSecret(body.s3SecretKey) &&
            body.s3SecretKey !== currentSettings.s3SecretKey,
          turnstileSecretKey:
            body.turnstileSecretKey !== undefined &&
            !shouldPreserveSecret(body.turnstileSecretKey),
        },
      },
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return adminJson({
      ok: true,
      settings: sanitizeSettingsForClient(resolvePlatformSettings(settings)),
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.settings.write" });
  }
}

export async function GET(request: Request) {
  return handleAdminSettingsGet(request);
}

export async function PUT(request: Request) {
  return handleAdminSettingsPut(request);
}
