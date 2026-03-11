import { z } from "zod";
import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/mysql/users";
import { createPasswordResetToken, consumeRateLimit } from "@/lib/mysql/security";
import { createAuditLog } from "@/lib/utils/audit";
import { queueSecurityRequestAuditLog, type SecurityAuditLogger } from "@/lib/security/audit";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  getRequestUserAgent,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";
import { RateLimitError } from "@/lib/utils/errors";

const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email().max(254),
  })
  .strict();

type ForgotPasswordRouteDeps = {
  assertTrustedOrigin: typeof assertTrustedOrigin;
  consumeRateLimit: typeof consumeRateLimit;
  createAuditLog: typeof createAuditLog;
  createPasswordResetToken: typeof createPasswordResetToken;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  findUserByEmail: typeof findUserByEmail;
  parseJsonBody: typeof parseJsonBody;
  securityAuditLog: SecurityAuditLogger;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
};

const forgotPasswordRouteDeps: ForgotPasswordRouteDeps = {
  assertTrustedOrigin,
  consumeRateLimit,
  createAuditLog,
  createPasswordResetToken,
  enforceRouteRateLimit,
  findUserByEmail,
  parseJsonBody,
  securityAuditLog: queueSecurityRequestAuditLog,
  sendPasswordResetEmail,
};

const ENUMERATION_SAFE_RESPONSE = {
  ok: true,
  message: "If the account exists, a reset link will be sent shortly.",
} as const;

export async function handleForgotPasswordPost(
  request: Request,
  deps: ForgotPasswordRouteDeps = forgotPasswordRouteDeps,
) {
  const ipAddress = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    deps.assertTrustedOrigin(request);
    await deps.enforceRouteRateLimit({
      scope: "auth-forgot-password-ip",
      key: ipAddress,
      limit: 5,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 60 * 60 * 1000,
    });

    const body = await deps.parseJsonBody(request, forgotPasswordSchema, {
      maxBytes: 8 * 1024,
      audit: {
        log: deps.securityAuditLog,
        resourceId: "/api/auth/forgot-password",
      },
    });
    const normalizedEmail = body.email.trim().toLowerCase();

    const user = await deps.findUserByEmail(normalizedEmail);
    if (user) {
      const failureWindow = await deps.consumeRateLimit({
        scope: "auth-forgot-password-account",
        key: normalizedEmail,
        limit: 3,
        windowMs: 30 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000,
      });

      if (failureWindow.allowed) {
        const resetToken = await deps.createPasswordResetToken({
          userId: user.id,
          ttlMinutes: 30,
          ipAddress,
          userAgent,
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://univert.pro"}/auth/reset-password?token=${encodeURIComponent(resetToken.token)}`;
        await deps.sendPasswordResetEmail({
          email: normalizedEmail,
          resetUrl,
          expiresInMinutes: 30,
        });

        await deps.createAuditLog({
          actor_id: user.id,
          actor_type: user.role === "admin" ? "admin" : "user",
          action: "security.password_reset_requested",
          resource_type: "user",
          resource_id: user.id,
          changes: {},
          status: "success",
          ip_address: ipAddress,
          user_agent: userAgent,
        });
      }
    }

    return NextResponse.json(ENUMERATION_SAFE_RESPONSE, { status: 202 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      await deps.createAuditLog({
        actor_id: "auth",
        actor_type: "system",
        action: "security.rate_limit_exceeded",
        resource_type: "auth",
        resource_id: "auth-forgot-password-ip",
        changes: {
          scope: "auth-forgot-password-ip",
        },
        status: "failure",
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: error.message,
      });
    }

    const response = toApiErrorResponse(error, { action: "auth.forgot_password" });
    if (response.status >= 500) {
      return NextResponse.json(ENUMERATION_SAFE_RESPONSE, { status: 202 });
    }
    return response;
  }
}

export async function POST(request: Request) {
  return handleForgotPasswordPost(request);
}
