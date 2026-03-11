import { cookies } from "next/headers";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/utils/audit";
import { queueSecurityRequestAuditLog, type SecurityAuditLogger } from "@/lib/security/audit";
import {
  ADMIN_MFA_CHALLENGE_COOKIE_NAME,
  getAdminMfaChallengeCookieOptions,
  verifyAdminMfaChallengeToken,
} from "@/lib/auth/admin-mfa-challenge";
import {
  USER_SESSION_COOKIE_NAME,
  createUserSessionToken,
  getUserSessionCookieOptions,
} from "@/lib/mysql/session";
import { LOCAL_ADMIN_COOKIE_NAME, getLocalAdminCookieOptions } from "@/lib/local-admin-auth";
import {
  completeAdminMfaEnrollment,
  verifyAdminMfaAssertion,
} from "@/lib/mysql/admin-mfa";
import { findUserById } from "@/lib/mysql/users";
import { createUserSessionRecord } from "@/lib/mysql/security";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  getRequestUserAgent,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";
import { RateLimitError } from "@/lib/utils/errors";

const verifyAdminMfaSchema = z
  .object({
    code: z.string().trim().min(6).max(32),
  })
  .strict();

type AdminMfaVerifyRouteDeps = {
  assertTrustedOrigin: typeof assertTrustedOrigin;
  completeAdminMfaEnrollment: typeof completeAdminMfaEnrollment;
  createAuditLog: typeof createAuditLog;
  createUserSessionRecord: typeof createUserSessionRecord;
  createUserSessionToken: typeof createUserSessionToken;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  findUserById: typeof findUserById;
  getAdminMfaChallengeCookieOptions: typeof getAdminMfaChallengeCookieOptions;
  getChallengeCookieValue: () => Promise<string | undefined>;
  getLocalAdminCookieOptions: typeof getLocalAdminCookieOptions;
  securityAuditLog: SecurityAuditLogger;
  getUserSessionCookieOptions: typeof getUserSessionCookieOptions;
  parseJsonBody: typeof parseJsonBody;
  verifyAdminMfaAssertion: typeof verifyAdminMfaAssertion;
  verifyAdminMfaChallengeToken: typeof verifyAdminMfaChallengeToken;
};

const adminMfaVerifyRouteDeps: AdminMfaVerifyRouteDeps = {
  assertTrustedOrigin,
  completeAdminMfaEnrollment,
  createAuditLog,
  createUserSessionRecord,
  createUserSessionToken,
  enforceRouteRateLimit,
  findUserById,
  getAdminMfaChallengeCookieOptions,
  getChallengeCookieValue: async () => {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_MFA_CHALLENGE_COOKIE_NAME)?.value;
  },
  getLocalAdminCookieOptions,
  securityAuditLog: queueSecurityRequestAuditLog,
  getUserSessionCookieOptions,
  parseJsonBody,
  verifyAdminMfaAssertion,
  verifyAdminMfaChallengeToken,
};

export async function handleAdminMfaVerifyPost(
  request: Request,
  deps: AdminMfaVerifyRouteDeps = adminMfaVerifyRouteDeps,
) {
  const ipAddress = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    deps.assertTrustedOrigin(request);
    await deps.enforceRouteRateLimit({
      scope: "auth-admin-mfa-verify",
      key: ipAddress,
      limit: 10,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const challenge = deps.verifyAdminMfaChallengeToken(
      await deps.getChallengeCookieValue(),
    );
    if (!challenge) {
      return NextResponse.json({ error: "challenge_required" }, { status: 401 });
    }

    const body = await deps.parseJsonBody(request, verifyAdminMfaSchema, {
      maxBytes: 8 * 1024,
      audit: {
        actorId: challenge.sub,
        actorType: "admin",
        log: deps.securityAuditLog,
        resourceId: "/api/auth/admin-mfa/verify",
      },
    });
    const user = await deps.findUserById(challenge.sub);
    if (!user || user.role !== "admin" || user.status !== "active") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const verificationResult =
      challenge.purpose === "enroll"
        ? await deps.completeAdminMfaEnrollment(user.id, body.code)
        : await deps.verifyAdminMfaAssertion(user.id, body.code);

    if (!verificationResult.ok) {
      await deps.createAuditLog({
        actor_id: user.id,
        actor_type: "admin",
        action: "security.admin_mfa_verification_failed",
        resource_type: "auth_challenge",
        resource_id: challenge.purpose,
        changes: { purpose: challenge.purpose },
        status: "failure",
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: verificationResult.error,
      });

      return NextResponse.json({ error: verificationResult.error }, { status: 401 });
    }

    const verifiedAt = new Date();
    const session = await deps.createUserSessionRecord({
      userId: user.id,
      sessionType: "admin",
      ttlSeconds: 4 * 60 * 60,
      mfaVerifiedAt: verifiedAt,
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json({
      ok: true,
      redirectTo: "/admin",
      recoveryCodes:
        challenge.purpose === "enroll" ? verificationResult.recoveryCodes : undefined,
      recoveryCodesRemaining:
        "recoveryCodesRemaining" in verificationResult
          ? verificationResult.recoveryCodesRemaining
          : undefined,
      usedRecoveryCode: verificationResult.method === "recovery_code",
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
      {
        ...deps.getUserSessionCookieOptions(),
        maxAge: 4 * 60 * 60,
      },
    );
    response.cookies.set(ADMIN_MFA_CHALLENGE_COOKIE_NAME, "", {
      ...deps.getAdminMfaChallengeCookieOptions(),
      maxAge: 0,
    });
    response.cookies.set(LOCAL_ADMIN_COOKIE_NAME, "", {
      ...deps.getLocalAdminCookieOptions(),
      maxAge: 0,
    });

    await deps.createAuditLog({
      actor_id: user.id,
      actor_type: "admin",
      action:
        challenge.purpose === "enroll"
          ? "security.admin_mfa_enrolled"
          : "security.admin_mfa_verified",
      resource_type: "session",
      resource_id: session.sessionId,
      changes: {
        method: verificationResult.method ?? "totp",
      },
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (verificationResult.method === "recovery_code") {
      await deps.createAuditLog({
        actor_id: user.id,
        actor_type: "admin",
        action: "security.admin_mfa_recovery_code_used",
        resource_type: "session",
        resource_id: session.sessionId,
        changes: {
          remaining: verificationResult.recoveryCodesRemaining ?? null,
        },
        status: "success",
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    }

    await deps.createAuditLog({
      actor_id: user.id,
      actor_type: "admin",
      action: "admin.login",
      resource_type: "session",
      resource_id: session.sessionId,
      changes: {
        challengePurpose: challenge.purpose,
      },
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
        resource_id: "auth-admin-mfa-verify",
        changes: {
          scope: "auth-admin-mfa-verify",
        },
        status: "failure",
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: error.message,
      });
    }

    return toApiErrorResponse(error, { action: "auth.admin_mfa.verify" });
  }
}

export async function POST(request: Request) {
  return handleAdminMfaVerifyPost(request);
}
