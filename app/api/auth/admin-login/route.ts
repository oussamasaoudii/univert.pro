import { z } from "zod";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/utils/audit";
import { queueSecurityRequestAuditLog, type SecurityAuditLogger } from "@/lib/security/audit";
import {
  LOCAL_ADMIN_COOKIE_NAME,
  getLocalAdminCookieOptions,
} from "@/lib/local-admin-auth";
import { authenticateUser } from "@/lib/mysql/users";
import {
  USER_SESSION_COOKIE_NAME,
  getUserSessionCookieOptions,
} from "@/lib/mysql/session";
import { ADMIN_MFA_CHALLENGE_COOKIE_NAME, createAdminMfaChallengeToken, getAdminMfaChallengeCookieOptions } from "@/lib/auth/admin-mfa-challenge";
import { clearRateLimit, consumeRateLimit } from "@/lib/mysql/security";
import { getAdminMfaSummary } from "@/lib/mysql/admin-mfa";
import {
  assertTrustedOrigin,
  parseJsonBody,
  getRequestIp,
  getRequestUserAgent,
  enforceRouteRateLimit,
  applyProgressiveDelay,
  toApiErrorResponse,
} from "@/lib/security/request";
import { RateLimitError } from "@/lib/utils/errors";

const adminLoginSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(256),
  })
  .strict();

type AdminLoginRouteDeps = {
  applyProgressiveDelay: typeof applyProgressiveDelay;
  assertTrustedOrigin: typeof assertTrustedOrigin;
  authenticateUser: typeof authenticateUser;
  clearRateLimit: typeof clearRateLimit;
  consumeRateLimit: typeof consumeRateLimit;
  createAdminMfaChallengeToken: typeof createAdminMfaChallengeToken;
  createAuditLog: typeof createAuditLog;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAdminMfaChallengeCookieOptions: typeof getAdminMfaChallengeCookieOptions;
  getAdminMfaSummary: typeof getAdminMfaSummary;
  getLocalAdminCookieOptions: typeof getLocalAdminCookieOptions;
  securityAuditLog: SecurityAuditLogger;
  getUserSessionCookieOptions: typeof getUserSessionCookieOptions;
  parseJsonBody: typeof parseJsonBody;
};

const adminLoginRouteDeps: AdminLoginRouteDeps = {
  applyProgressiveDelay,
  assertTrustedOrigin,
  authenticateUser,
  clearRateLimit,
  consumeRateLimit,
  createAdminMfaChallengeToken,
  createAuditLog,
  enforceRouteRateLimit,
  getAdminMfaChallengeCookieOptions,
  getAdminMfaSummary,
  getLocalAdminCookieOptions,
  securityAuditLog: queueSecurityRequestAuditLog,
  getUserSessionCookieOptions,
  parseJsonBody,
};

export async function handleAdminLoginPost(
  request: Request,
  deps: AdminLoginRouteDeps = adminLoginRouteDeps,
) {
  const ipAddress = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    deps.assertTrustedOrigin(request);
    await deps.enforceRouteRateLimit({
      scope: "auth-admin-login-ip",
      key: ipAddress,
      limit: 5,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 60 * 60 * 1000,
    });

    const body = await deps.parseJsonBody(request, adminLoginSchema, {
      maxBytes: 16 * 1024,
      audit: {
        log: deps.securityAuditLog,
        resourceId: "/api/auth/admin-login",
      },
    });
    const normalizedEmail = body.email.trim().toLowerCase();
    const failureKey = `${ipAddress}:${normalizedEmail}`;
    const authResult = await deps.authenticateUser({
      email: normalizedEmail,
      password: body.password,
    });

    if ("error" in authResult) {
      const failure = await deps.consumeRateLimit({
        scope: "auth-admin-login-failure",
        key: failureKey,
        limit: 4,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000,
      });

      await deps.applyProgressiveDelay(failure.attempts);

      if (failure.attempts >= 2) {
        await deps.createAuditLog({
          actor_id: "admin-auth",
          actor_type: "system",
          action: "security.repeated_failed_login_detected",
          resource_type: "auth",
          resource_id: normalizedEmail,
          changes: {
            scope: "auth-admin-login-failure",
            attempts: failure.attempts,
          },
          status: "failure",
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: authResult.error,
        });
      }

      if (!failure.allowed) {
        await deps.createAuditLog({
          actor_id: "admin-auth",
          actor_type: "system",
          action: "security.rate_limit_exceeded",
          resource_type: "auth",
          resource_id: normalizedEmail,
          changes: { scope: "auth-admin-login-failure" },
          status: "failure",
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: "Admin login rate limit exceeded",
        });

        return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
      }

      const statusCode = authResult.error === "invalid_credentials" ? 401 : 403;
      return NextResponse.json({ error: authResult.error }, { status: statusCode });
    }

    const user = authResult.user;
    if (user.role !== "admin") {
      const failure = await deps.consumeRateLimit({
        scope: "auth-admin-login-failure",
        key: failureKey,
        limit: 4,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000,
      });

      await deps.applyProgressiveDelay(failure.attempts);
      if (failure.attempts >= 2) {
        await deps.createAuditLog({
          actor_id: "admin-auth",
          actor_type: "system",
          action: "security.repeated_failed_login_detected",
          resource_type: "auth",
          resource_id: normalizedEmail,
          changes: {
            scope: "auth-admin-login-failure",
            attempts: failure.attempts,
            reason: "admin_only",
          },
          status: "failure",
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: "admin_only",
        });
      }
      return NextResponse.json({ error: "admin_only" }, { status: 403 });
    }

    await deps.clearRateLimit("auth-admin-login-failure", failureKey);

    const mfaSummary = await deps.getAdminMfaSummary(user.id);
    const challengePurpose = mfaSummary?.enabled ? "verify" : "enroll";

    const response = NextResponse.json({
      ok: true,
      requiresMfa: true,
      enrollmentRequired: challengePurpose === "enroll",
      redirectTo:
        challengePurpose === "enroll" ? "/admin/mfa?mode=enroll" : "/admin/mfa?mode=verify",
    });

    response.cookies.set(USER_SESSION_COOKIE_NAME, "", {
      ...deps.getUserSessionCookieOptions(),
      maxAge: 0,
    });
    response.cookies.set(
      ADMIN_MFA_CHALLENGE_COOKIE_NAME,
      deps.createAdminMfaChallengeToken({
        userId: user.id,
        email: user.email,
        purpose: challengePurpose,
      }),
      deps.getAdminMfaChallengeCookieOptions(),
    );
    response.cookies.set(LOCAL_ADMIN_COOKIE_NAME, "", {
      ...deps.getLocalAdminCookieOptions(),
      maxAge: 0,
    });

    await deps.createAuditLog({
      actor_id: user.id,
      actor_type: "admin",
      action: "security.admin_mfa_challenge_issued",
      resource_type: "auth_challenge",
      resource_id: user.id,
      changes: { purpose: challengePurpose },
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return response;
  } catch (error) {
    if (error instanceof RateLimitError) {
      await deps.createAuditLog({
        actor_id: "admin-auth",
        actor_type: "system",
        action: "security.rate_limit_exceeded",
        resource_type: "auth",
        resource_id: "auth-admin-login-ip",
        changes: {
          scope: "auth-admin-login-ip",
        },
        status: "failure",
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: error.message,
      });
    }

    return toApiErrorResponse(error, { action: "auth.admin_login" });
  }
}

export async function POST(request: Request) {
  return handleAdminLoginPost(request);
}
