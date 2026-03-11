import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import { getAdminMfaSummary } from "@/lib/mysql/admin-mfa";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";

export async function GET(request: Request) {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "auth-admin-mfa-manage-read",
      key: `${adminUser.id}:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const summary = await getAdminMfaSummary(adminUser.id);
    return NextResponse.json({
      ok: true,
      mfa: {
        required: true,
        enabled: summary?.enabled ?? false,
        enrolledAt: summary?.enrolledAt ?? null,
        recoveryCodesRemaining: summary?.recoveryCodesRemaining ?? 0,
      },
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "auth.admin_mfa.manage" });
  }
}
