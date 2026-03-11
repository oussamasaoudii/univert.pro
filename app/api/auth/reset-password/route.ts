import { z } from "zod";
import { NextResponse } from "next/server";
import { resetPasswordUsingToken } from "@/lib/mysql/security";
import { createAuditLog } from "@/lib/utils/audit";
import { assertStrongPassword } from "@/lib/security/password-policy";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  getRequestUserAgent,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

const resetPasswordSchema = z
  .object({
    token: z.string().min(20).max(512),
    password: z.string().min(1).max(256),
  })
  .strict();

export async function POST(request: Request) {
  const ipAddress = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    assertTrustedOrigin(request);
    await enforceRouteRateLimit({
      scope: "auth-reset-password-ip",
      key: ipAddress,
      limit: 10,
      windowMs: 30 * 60 * 1000,
      blockDurationMs: 60 * 60 * 1000,
    });

    const body = await parseJsonBody(request, resetPasswordSchema, {
      maxBytes: 16 * 1024,
      audit: {
        resourceId: "/api/auth/reset-password",
      },
    });
    assertStrongPassword(body.password);

    const result = await resetPasswordUsingToken({
      token: body.token,
      newPassword: body.password,
    });

    if (!result.success || !result.userId) {
      return NextResponse.json(
        { error: "invalid_or_expired_token" },
        { status: 400 },
      );
    }

    await createAuditLog({
      actor_id: result.userId,
      actor_type: "user",
      action: "security.password_reset_completed",
      resource_type: "user",
      resource_id: result.userId,
      changes: {},
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toApiErrorResponse(error, {
      action: "auth.reset_password",
    });
  }
}
