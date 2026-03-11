import { createSignedJwt, verifySignedJwt } from "@/lib/auth/jwt";

export const LOCAL_ADMIN_COOKIE_NAME = "ovmon_admin_session";

const LOCAL_ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 4;

function getSessionSecret(): string {
  const secret = process.env.ADMIN_AUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error("ADMIN_AUTH_SECRET or AUTH_SECRET must be configured with at least 32 characters");
  }

  return secret;
}

export function getLocalAdminCredentials() {
  const email = process.env.LOCAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.LOCAL_ADMIN_PASSWORD;
  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
  };
}

export function createLocalAdminSessionToken(): string {
  const credentials = getLocalAdminCredentials();
  if (!credentials) {
    throw new Error("Local admin fallback is disabled");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + LOCAL_ADMIN_SESSION_TTL_SECONDS;
  return createSignedJwt(
    {
      sub: "local-admin",
      exp: expiresAt,
      email: credentials.email,
      iss: "univert-auth",
      aud: "univert-admin",
    },
    getSessionSecret(),
  );
}

export function verifyLocalAdminSessionToken(token: string | undefined | null): boolean {
  if (!getLocalAdminCredentials()) {
    return false;
  }

  const data = verifySignedJwt<{ sub?: string; exp?: number; iss?: string; aud?: string }>(
    token,
    getSessionSecret(),
  );
  return Boolean(
    data?.sub === "local-admin" &&
      typeof data.exp === "number" &&
      data.iss === "univert-auth" &&
      data.aud === "univert-admin",
  );
}

export function getLocalAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LOCAL_ADMIN_SESSION_TTL_SECONDS,
    priority: "high" as const,
  };
}
