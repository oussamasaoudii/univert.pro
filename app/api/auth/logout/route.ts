import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import {
  ADMIN_MFA_CHALLENGE_COOKIE_NAME,
  getAdminMfaChallengeCookieOptions,
} from "@/lib/auth/admin-mfa-challenge";
import { createAuditLog } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/errors";
import {
  LOCAL_ADMIN_COOKIE_NAME,
  getLocalAdminCookieOptions,
} from "@/lib/local-admin-auth";
import {
  USER_SESSION_COOKIE_NAME,
  getUserSessionCookieOptions,
  verifyUserSessionToken,
} from "@/lib/mysql/session";
import { revokeUserSessionRecord } from "@/lib/mysql/security";

async function clearSessionCookies(request: Request, redirect: boolean) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url;
  const response = redirect
    ? NextResponse.redirect(new URL("/auth/login", baseUrl))
    : NextResponse.json({ ok: true });

  response.cookies.set(USER_SESSION_COOKIE_NAME, "", {
    ...getUserSessionCookieOptions(),
    maxAge: 0,
  });

  response.cookies.set(LOCAL_ADMIN_COOKIE_NAME, "", {
    ...getLocalAdminCookieOptions(),
    maxAge: 0,
  });

  response.cookies.set(ADMIN_MFA_CHALLENGE_COOKIE_NAME, "", {
    ...getAdminMfaChallengeCookieOptions(),
    maxAge: 0,
  });

  return response;
}

async function performLogout(request: Request) {
  const currentUser = await getAuthenticatedRequestUser();
  const sessionToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${USER_SESSION_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  const payload = verifyUserSessionToken(sessionToken);
  if (payload?.sid) {
    await revokeUserSessionRecord(payload.sid, "logout");
  }

  if (currentUser) {
    await createAuditLog({
      actor_id: currentUser.id,
      actor_type: currentUser.role === "admin" ? "admin" : "user",
      action: currentUser.role === "admin" ? "admin.logout" : "user.logout",
      resource_type: "session",
      resource_id: payload?.sid || "unknown",
      changes: {},
      status: "success",
    });
  }
}

export async function GET(request: Request) {
  try {
    await performLogout(request);
  } catch (error) {
    logger.error("[auth/logout][GET] Error", error);
  }

  return clearSessionCookies(request, true);
}

export async function POST(request: Request) {
  try {
    await performLogout(request);
  } catch (error) {
    logger.error("[auth/logout][POST] Error", error);
  }

  return clearSessionCookies(request, false);
}
