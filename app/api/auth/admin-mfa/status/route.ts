import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import {
  ADMIN_MFA_CHALLENGE_COOKIE_NAME,
  verifyAdminMfaChallengeToken,
} from "@/lib/auth/admin-mfa-challenge";
import { beginAdminMfaEnrollment } from "@/lib/mysql/admin-mfa";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";

export async function GET(request: Request) {
  try {
    // [DEBUG] Check environment variables
    const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;
    const encryptionKeyLength = process.env.ENCRYPTION_KEY?.length || 0;
    const hasAdminAuthSecret = !!process.env.ADMIN_AUTH_SECRET;
    const adminAuthSecretLength = process.env.ADMIN_AUTH_SECRET?.length || 0;
    const hasAuthSecret = !!process.env.AUTH_SECRET;
    const authSecretLength = process.env.AUTH_SECRET?.length || 0;

    console.log("[MFA Status] Environment check:", {
      hasEncryptionKey,
      encryptionKeyLength,
      hasAdminAuthSecret,
      adminAuthSecretLength,
      hasAuthSecret,
      authSecretLength,
    });

    await enforceRouteRateLimit({
      scope: "auth-admin-mfa-status",
      key: getRequestIp(request),
      limit: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const cookieStore = await cookies();
    let challenge;
    try {
      challenge = verifyAdminMfaChallengeToken(
        cookieStore.get(ADMIN_MFA_CHALLENGE_COOKIE_NAME)?.value,
      );
      console.log("[MFA Status] Challenge verified:", {
        hasChallengeToken: !!challenge,
        ...(challenge && { sub: challenge.sub, purpose: challenge.purpose }),
      });
    } catch (challengeError) {
      console.log("[MFA Status] Challenge verification error:", {
        error: challengeError instanceof Error ? challengeError.message : String(challengeError),
      });
      throw challengeError;
    }

    if (!challenge) {
      const adminUser = await getAdminRequestUser();
      if (adminUser) {
        return NextResponse.json({ ok: true, authenticated: true, redirectTo: "/admin" });
      }

      return NextResponse.json({ error: "challenge_required" }, { status: 401 });
    }

    const responseBody: Record<string, unknown> = {
      ok: true,
      authenticated: false,
      email: challenge.email,
      mode: challenge.purpose,
    };

    if (challenge.purpose === "enroll") {
      const enrollment = await beginAdminMfaEnrollment(challenge.sub);
      responseBody.enrollment = {
        manualEntryKey: enrollment.manualEntryKey,
        otpAuthUri: enrollment.otpAuthUri,
        issuer: "Univert Admin",
      };
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    console.log("[MFA Status] Error caught:", {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return toApiErrorResponse(error, { action: "auth.admin_mfa.status" });
  }
}
