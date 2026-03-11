import { createSignedJwt, verifySignedJwt } from "@/lib/auth/jwt";

export const USER_SESSION_COOKIE_NAME = "ovmon_user_session";
export const USER_SESSION_TTL_SECONDS = 60 * 60 * 24;

export type UserSessionPayload = {
  sub: string;
  email: string;
  role: "user" | "admin";
  sid: string;
  ver: number;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_AUTH_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error("AUTH_SECRET or ADMIN_AUTH_SECRET must be configured with at least 32 characters");
  }

  return secret;
}

export function createUserSessionToken(input: {
  id: string;
  email: string;
  role: "user" | "admin";
  sessionId: string;
  sessionVersion: number;
}): string {
  const expiresAt = Math.floor(Date.now() / 1000) + USER_SESSION_TTL_SECONDS;

  return createSignedJwt(
    {
      sub: input.id,
      email: input.email,
      role: input.role,
      sid: input.sessionId,
      ver: input.sessionVersion,
      exp: expiresAt,
      iss: "univert-auth",
      aud: "univert-app",
    } satisfies UserSessionPayload & { iss: string; aud: string },
    getSessionSecret(),
  );
}

export function verifyUserSessionToken(
  token: string | null | undefined,
): UserSessionPayload | null {
  const data = verifySignedJwt<Partial<UserSessionPayload> & { iss?: string; aud?: string }>(
    token,
    getSessionSecret(),
  );

  if (
    !data ||
    !data.sub ||
    !data.email ||
    !data.role ||
    typeof data.exp !== "number" ||
    !data.sid ||
    typeof data.ver !== "number"
  ) {
    return null;
  }

  if (data.role !== "user" && data.role !== "admin") {
    return null;
  }

  if (data.iss !== "univert-auth" || data.aud !== "univert-app") {
    return null;
  }

  return {
    sub: data.sub,
    email: data.email,
    role: data.role,
    sid: data.sid,
    ver: data.ver,
    exp: data.exp,
  };
}

export function getUserSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: USER_SESSION_TTL_SECONDS,
    priority: "high" as const,
  };
}
