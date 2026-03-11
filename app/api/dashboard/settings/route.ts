import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { getUserSettings, updateUserSettings } from "@/lib/mysql/operations";
import { createAuditLog } from "@/lib/utils/audit";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  getRequestUserAgent,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

const dashboardSettingsSchema = z
  .object({
    phone: z.string().trim().max(50).optional(),
    firstName: z.string().trim().max(120).optional(),
    lastName: z.string().trim().max(120).optional(),
    company: z.string().trim().max(191).optional(),
    emailNotifications: z.boolean().optional(),
    maintenanceAlerts: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    twoFactor: z.boolean().optional(),
    regenerateApiKey: z.boolean().optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "dashboard-settings-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 5 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const settings = await getUserSettings(user.id);
    if (!settings) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.settings.read" });
  }
}

export async function PATCH(request: Request) {
  const ipAddress = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    assertTrustedOrigin(request);
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "dashboard-settings-write",
      key: `${user.id}:${ipAddress}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const body = await parseJsonBody(request, dashboardSettingsSchema, { maxBytes: 16 * 1024 });
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: "no_updates" }, { status: 400 });
    }

    const settings = await updateUserSettings(user.id, body);
    await createAuditLog({
      actor_id: user.id,
      actor_type: user.role === "admin" ? "admin" : "user",
      action: "user.update_profile",
      resource_type: "user_settings",
      resource_id: user.id,
      changes: { changedKeys: Object.keys(body) },
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.settings.write" });
  }
}
