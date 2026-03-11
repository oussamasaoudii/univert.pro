import { z } from "zod";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/utils/audit";
import { queueSecurityRequestAuditLog, type SecurityAuditLogger } from "@/lib/security/audit";
import { assertTrustedOrigin, parseJsonBody, getRequestIp, getRequestUserAgent, enforceRouteRateLimit, applyProgressiveDelay, toApiErrorResponse } from "@/lib/security/request";
import { clearRateLimit, consumeRateLimit, createUserSessionRecord } from "@/lib/mysql/security";
import { authenticateUser } from "@/lib/mysql/users";
import {
  LOCAL_ADMIN_COOKIE_NAME,
  getLocalAdminCookieOptions,
} from "@/lib/local-admin-auth";
import {
  USER_SESSION_COOKIE_NAME,
  createUserSessionToken,
  getUserSessionCookieOptions,
} from "@/lib/mysql/session";
import { RateLimitError } from "@/lib/utils/errors";
import { isPreviewMode } from "@/lib/preview-mode";

const loginSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(256),
  })
  .strict();

type LoginRouteDeps = {
  applyProgressiveDelay: typeof applyProgressiveDelay;
  assertTrustedOrigin: typeof assertTrustedOrigin;
  authenticateUser: typeof authenticateUser;
  clearRateLimit: typeof clearRateLimit;
  consumeRateLimit: typeof consumeRateLimit;
  createAuditLog: typeof createAuditLog;
  createUserSessionRecord: typeof createUserSessionRecord;
  createUserSessionToken: typeof createUserSessionToken;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getLocalAdminCookieOptions: typeof getLocalAdminCookieOptions;
  securityAuditLog: SecurityAuditLogger;
  getUserSessionCookieOptions: typeof getUserSessionCookieOptions;
  parseJsonBody: typeof parseJsonBody;
};

const loginRouteDeps: LoginRouteDeps = {
  applyProgressiveDelay,
  assertTrustedOrigin,
  authenticateUser,
  clearRateLimit,
  consumeRateLimit,
  createAuditLog,
  createUserSessionRecord,
  createUserSessionToken,
  enforceRouteRateLimit,
  getLocalAdminCookieOptions,
  securityAuditLog: queueSecurityRequestAuditLog,
  getUserSessionCookieOptions,
  parseJsonBody,
};

export async function handleLoginPost(
  request: Request,
  deps: LoginRouteDeps = loginRouteDeps,
) {
  const ipAddress = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    if (isPreviewMode()) {
      const body = await deps.parseJsonBody(request, loginSchema, {
        maxBytes: 16 * 1024,
      });
      const isAdminPreview = body.email.trim().toLowerCase().includes("admin");

      return NextResponse.json({
        ok: true,
        redirectTo: isAdminPreview ? "/admin" : "/dashboard",
        preview: true,
      });
    }

    deps.assertTrustedOrigin(request);
    await deps.enforceRouteRateLimit({
      scope: "auth-login-ip",
      key: ipAddress,
      limit: 10,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const body = await deps.parseJsonBody(request, loginSchema, {
      maxBytes: 16 * 1024,
      audit: {
        log: deps.securityAuditLog,
        resourceId: "/api/auth/login",
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
        scope: "auth-login-failure",
        key: failureKey,
        limit: 5,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 30 * 60 * 1000,
      });

      await deps.applyProgressiveDelay(failure.attempts);

      if (failure.attempts >= 3) {
        await deps.createAuditLog({
          actor_id: "auth",
          actor_type: "system",
          action: "security.repeated_failed_login_detected",
          resource_type: "auth",
          resource_id: normalizedEmail,
          changes: {
            scope: "auth-login-failure",
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
          actor_id: "auth",
          actor_type: "system",
          action: "security.rate_limit_exceeded",
          resource_type: "auth",
          resource_id: normalizedEmail,
          changes: { scope: "auth-login-failure" },
          status: "failure",
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: "Login rate limit exceeded",
        });

        return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
      }

      const statusCode = authResult.error === "invalid_credentials" ? 401 : 403;
      return NextResponse.json({ error: authResult.error }, { status: statusCode });
    }

    await deps.clearRateLimit("auth-login-failure", failureKey);

    const user = authResult.user;
    const session = await deps.createUserSessionRecord({
      userId: user.id,
      sessionType: user.role === "admin" ? "admin" : "user",
      ttlSeconds: 24 * 60 * 60,
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json({
      ok: true,
      redirectTo: user.role === "admin" ? "/admin" : "/dashboard",
    });

    response.cookies.set(
      USER_SESSION_COOKIE_NAME,
      deps.createUserSessionToken({
        id: user.id,
        email: user.email,
        role: user.role,
        sessionId: session.sessionId,
        sessionVersion: user.sessionVersion,
      }),
      deps.getUserSessionCookieOptions(),
    );

    response.cookies.set(LOCAL_ADMIN_COOKIE_NAME, "", {
      ...deps.getLocalAdminCookieOptions(),
      maxAge: 0,
    });

    await deps.createAuditLog({
      actor_id: user.id,
      actor_type: user.role === "admin" ? "admin" : "user",
      action: user.role === "admin" ? "admin.login" : "user.login",
      resource_type: "session",
      resource_id: session.sessionId,
      changes: {},
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return response;
  } catch (error) {
    if (error instanceof RateLimitError) {
      await deps.createAuditLog({
        actor_id: "auth",
        actor_type: "system",
        action: "security.rate_limit_exceeded",
        resource_type: "auth",
        resource_id: "auth-login-ip",
        changes: {
          scope: "auth-login-ip",
        },
        status: "failure",
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: error.message,
      });
    }

    return toApiErrorResponse(error, { action: "auth.login" });
  }
}

export async function POST(request: Request) {
  return handleLoginPost(request);
}
