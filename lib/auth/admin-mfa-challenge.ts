import { createSignedJwt, verifySignedJwt } from "@/lib/auth/jwt";

export const ADMIN_MFA_CHALLENGE_COOKIE_NAME = "ovmon_admin_mfa_challenge";

const ADMIN_MFA_CHALLENGE_TTL_SECONDS = 10 * 60;

export type AdminMfaChallengePayload = {
  sub: string;
  email: string;
  purpose: "enroll" | "verify";
  exp: number;
};

function getAdminChallengeSecret() {
  const adminSecret = process.env.ADMIN_AUTH_SECRET?.trim();
  const authSecret = process.env.AUTH_SECRET?.trim();
  
  const secret = adminSecret || authSecret;
  
  // Debug logging
  console.log("[AdminMFA] Secret check:", {
    hasAdminSecret: !!adminSecret,
    adminSecretLength: adminSecret?.length || 0,
    hasAuthSecret: !!authSecret,
    authSecretLength: authSecret?.length || 0,
    selectedSecretLength: secret?.length || 0,
  });

  if (!secret || secret.length < 32) {
    const details = {
      hasAdminSecret: !!process.env.ADMIN_AUTH_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      adminSecretLength: process.env.ADMIN_AUTH_SECRET?.length || 0,
      authSecretLength: process.env.AUTH_SECRET?.length || 0,
    };
    console.error("[AdminMFA] Secret validation failed:", details);
    throw new Error(
      `ADMIN_AUTH_SECRET or AUTH_SECRET must be configured with at least 32 characters. Details: ${JSON.stringify(details)}`
    );
  }

  return secret;
}

export function createAdminMfaChallengeToken(input: {
  userId: string;
  email: string;
  purpose: "enroll" | "verify";
}) {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_MFA_CHALLENGE_TTL_SECONDS;
  return createSignedJwt(
    {
      sub: input.userId,
      email: input.email,
      purpose: input.purpose,
      exp: expiresAt,
      iss: "univert-auth",
      aud: "univert-admin-mfa",
    } satisfies AdminMfaChallengePayload & { iss: string; aud: string },
    getAdminChallengeSecret(),
  );
}

export function verifyAdminMfaChallengeToken(
  token: string | null | undefined,
): AdminMfaChallengePayload | null {
  const payload = verifySignedJwt<
    Partial<AdminMfaChallengePayload> & { iss?: string; aud?: string }
  >(token, getAdminChallengeSecret());

  if (
    !payload ||
    !payload.sub ||
    !payload.email ||
    !payload.purpose ||
    typeof payload.exp !== "number"
  ) {
    return null;
  }

  if (payload.purpose !== "enroll" && payload.purpose !== "verify") {
    return null;
  }

  if (payload.iss !== "univert-auth" || payload.aud !== "univert-admin-mfa") {
    return null;
  }

  return {
    sub: payload.sub,
    email: payload.email,
    purpose: payload.purpose,
    exp: payload.exp,
  };
}

export function getAdminMfaChallengeCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MFA_CHALLENGE_TTL_SECONDS,
    priority: "high" as const,
  };
}
