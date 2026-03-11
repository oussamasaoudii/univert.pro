import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import { regenerateAdminRecoveryCodes } from "@/lib/mysql/admin-mfa";
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
      scope: "auth-admin-mfa-recovery-regenerate",
      key: `${adminUser.id}:${ipAddress}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const recoveryCodes = await regenerateAdminRecoveryCodes(adminUser.id);
    if (!recoveryCodes) {
      return NextResponse.json({ error: "mfa_not_enabled" }, { status: 400 });
    }

    await createAuditLog({
      actor_id: adminUser.id,
      actor_type: "admin",
      action: "security.admin_mfa_recovery_codes_regenerated",
      resource_type: "admin_mfa",
      resource_id: adminUser.id,
      changes: { count: recoveryCodes.length },
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true, recoveryCodes });
  } catch (error) {
    return toApiErrorResponse(error, { action: "auth.admin_mfa.recovery_codes" });
  }
}
