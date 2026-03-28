import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import {
  ADMIN_MFA_CHALLENGE_COOKIE_NAME,
  verifyAdminMfaChallengeToken,
  createAdminMfaChallengeToken,
  getAdminMfaChallengeCookieOptions,
} from "@/lib/auth/admin-mfa-challenge";
import { beginAdminMfaEnrollment, getAdminMfaSummary } from "@/lib/mysql/admin-mfa";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";

export async function GET(request: Request) {
  try {
    await enforceRouteRateLimit({
      scope: "auth-admin-mfa-status",
      key: getRequestIp(request),
      limit: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const url = new URL(request.url);
    const requestedMode = url.searchParams.get("mode");
    
    const cookieStore = await cookies();
    let challenge = null;
    
    try {
      challenge = verifyAdminMfaChallengeToken(
        cookieStore.get(ADMIN_MFA_CHALLENGE_COOKIE_NAME)?.value,
      );
    } catch {
      // Challenge token invalid or expired - will handle below
    }

    // If no valid challenge, check if user is authenticated and create a new challenge if needed
    if (!challenge) {
      const adminUser = await getAdminRequestUser();
      
      if (!adminUser) {
        return NextResponse.json({ error: "challenge_required" }, { status: 401 });
      }
      
      // User is authenticated - check their MFA status
      const mfaSummary = await getAdminMfaSummary(adminUser.id);
      const mfaEnabled = mfaSummary?.enabled ?? false;
      
      // If user wants to enroll and MFA is not enabled, create enrollment challenge
      if (requestedMode === "enroll" && !mfaEnabled) {
        const enrollment = await beginAdminMfaEnrollment(adminUser.id);
        
        // Create a new challenge token for enrollment
        const newChallengeToken = createAdminMfaChallengeToken({
          userId: adminUser.id,
          email: adminUser.email,
          purpose: "enroll",
        });
        
        const response = NextResponse.json({
          ok: true,
          authenticated: false,
          email: adminUser.email,
          mode: "enroll",
          enrollment: {
            manualEntryKey: enrollment.manualEntryKey,
            otpAuthUri: enrollment.otpAuthUri,
            issuer: "Univert Admin",
          },
        });
        
        response.cookies.set(
          ADMIN_MFA_CHALLENGE_COOKIE_NAME,
          newChallengeToken,
          getAdminMfaChallengeCookieOptions(),
        );
        
        return response;
      }
      
      // User is already authenticated with MFA or doesn't need enrollment
      return NextResponse.json({ ok: true, authenticated: true, redirectTo: "/admin" });
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
