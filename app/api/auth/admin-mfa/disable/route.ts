import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import { USER_SESSION_COOKIE_NAME, getUserSessionCookieOptions } from "@/lib/mysql/session";
import { disableAdminMfa } from "@/lib/mysql/admin-mfa";
import { revokeAllUserSessionRecords } from "@/lib/mysql/security";
import { createAuditLog } from "@/lib/utils/audit";
import { ADMIN_MFA_MANAGEMENT_WINDOW_MS, assertRecentAdminStepUp } from "@/lib/security/admin-session";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  getRequestUserAgent,
  toApiErrorResponse,
} from "@/lib/security/request";

export async function POST(request: Request) {
  const ipAddress = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    assertTrustedOrigin(request);
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    assertRecentAdminStepUp(adminUser.stepUpVerifiedAt, ADMIN_MFA_MANAGEMENT_WINDOW_MS);

    await enforceRouteRateLimit({
      scope: "auth-admin-mfa-disable",
      key: `${adminUser.id}:${ipAddress}`,
      limit: 3,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 4 * 60 * 60 * 1000,
    });

    await createAuditLog({
      actor_id: adminUser.id,
      actor_type: "admin",
      action: "security.admin_mfa_disable_attempted",
      resource_type: "admin_mfa",
      resource_id: adminUser.id,
      changes: {},
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    const disabled = await disableAdminMfa(adminUser.id);
    if (!disabled) {
      return NextResponse.json({ error: "mfa_not_enabled" }, { status: 400 });
    }

    await revokeAllUserSessionRecords(adminUser.id, "admin_mfa_disabled");

    const response = NextResponse.json({ ok: true, redirectTo: "/admin/login" });
    response.cookies.set(USER_SESSION_COOKIE_NAME, "", {
      ...getUserSessionCookieOptions(),
      maxAge: 0,
    });

    await createAuditLog({
      actor_id: adminUser.id,
      actor_type: "admin",
      action: "security.admin_mfa_disabled",
      resource_type: "admin_mfa",
      resource_id: adminUser.id,
      changes: {},
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return response;
  } catch (error) {
    return toApiErrorResponse(error, { action: "auth.admin_mfa.disable" });
  }
}
