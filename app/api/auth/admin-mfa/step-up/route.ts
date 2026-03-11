import { z } from "zod";
import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import { createAuditLog } from "@/lib/utils/audit";
import { verifyAdminMfaAssertion, verifyAdminPassword } from "@/lib/mysql/admin-mfa";
import { markUserSessionStepUpVerified } from "@/lib/mysql/security";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  getRequestUserAgent,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

const stepUpSchema = z
  .object({
    password: z.string().min(1).max(256),
    code: z.string().trim().min(6).max(32),
  })
  .strict();

export async function POST(request: Request) {
  const ipAddress = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    assertTrustedOrigin(request);
    const adminUser = await getAdminRequestUser();
    if (!adminUser || !adminUser.sessionId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "auth-admin-step-up",
      key: `${adminUser.id}:${ipAddress}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const body = await parseJsonBody(request, stepUpSchema, { maxBytes: 8 * 1024 });
    const passwordValid = await verifyAdminPassword(adminUser.id, body.password);
    if (!passwordValid) {
      await createAuditLog({
        actor_id: adminUser.id,
        actor_type: "admin",
        action: "security.admin_mfa_verification_failed",
        resource_type: "step_up",
        resource_id: adminUser.sessionId,
        changes: { reason: "invalid_password" },
        status: "failure",
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: "invalid_password",
      });
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const verification = await verifyAdminMfaAssertion(adminUser.id, body.code);
    if (!verification.ok) {
      await createAuditLog({
        actor_id: adminUser.id,
        actor_type: "admin",
        action: "security.admin_mfa_verification_failed",
        resource_type: "step_up",
        resource_id: adminUser.sessionId,
        changes: { reason: verification.error },
        status: "failure",
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: verification.error,
      });
      return NextResponse.json({ error: verification.error }, { status: 401 });
    }

    await markUserSessionStepUpVerified(adminUser.sessionId);
    await createAuditLog({
      actor_id: adminUser.id,
      actor_type: "admin",
      action: "security.admin_step_up_verified",
      resource_type: "session",
      resource_id: adminUser.sessionId,
      changes: { method: verification.method },
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (verification.method === "recovery_code") {
      await createAuditLog({
        actor_id: adminUser.id,
        actor_type: "admin",
        action: "security.admin_mfa_recovery_code_used",
        resource_type: "step_up",
        resource_id: adminUser.sessionId,
        changes: {
          remaining: verification.recoveryCodesRemaining ?? null,
        },
        status: "success",
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toApiErrorResponse(error, { action: "auth.admin_mfa.step_up" });
  }
}
