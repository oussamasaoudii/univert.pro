import { cookies } from "next/headers";
import {
  USER_SESSION_COOKIE_NAME,
  verifyUserSessionToken,
} from "@/lib/mysql/session";
import {
  getActiveUserSessionRecord,
  touchUserSessionRecord,
  type UserSessionRow,
} from "@/lib/mysql/security";
import { findUserById, type AppUser } from "@/lib/mysql/users";

export type AuthenticatedRequestUser = Pick<
  AppUser,
  "id" | "email" | "role" | "status" | "adminMfaEnabled" | "adminMfaEnrolledAt"
> & {
  source: "mysql" | "local_admin_fallback";
  sessionId: string | null;
  sessionType: "user" | "admin" | null;
  mfaVerifiedAt: string | null;
  stepUpVerifiedAt: string | null;
};

function mapMysqlUser(user: AppUser, session: UserSessionRow): AuthenticatedRequestUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    adminMfaEnabled: user.adminMfaEnabled,
    adminMfaEnrolledAt: user.adminMfaEnrolledAt,
    source: "mysql",
    sessionId: session.id,
    sessionType: session.session_type,
    mfaVerifiedAt: session.mfa_verified_at,
    stepUpVerifiedAt: session.step_up_verified_at,
  };
}

async function getMysqlSessionUser(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): Promise<AuthenticatedRequestUser | null> {
  const sessionToken = cookieStore.get(USER_SESSION_COOKIE_NAME)?.value;
  const payload = verifyUserSessionToken(sessionToken);
  if (!payload) {
    return null;
  }

  const user = await findUserById(payload.sub);
  if (!user || user.status !== "active" || user.sessionVersion !== payload.ver) {
    return null;
  }

  const session = await getActiveUserSessionRecord(payload.sid, user.id);
  if (!session) {
    return null;
  }

  touchUserSessionRecord(payload.sid).catch(() => {});
  return mapMysqlUser(user, session);
}

export async function getAuthenticatedRequestUser(options?: {
  allowLocalAdminFallback?: boolean;
  requiredSessionType?: "user" | "admin";
}): Promise<AuthenticatedRequestUser | null> {
  const cookieStore = await cookies();
  const mysqlUser = await getMysqlSessionUser(cookieStore);
  if (mysqlUser) {
    if (options?.requiredSessionType && mysqlUser.sessionType !== options.requiredSessionType) {
      return null;
    }

    return mysqlUser;
  }

  void options;
  return null;
}

export async function getDashboardRequestUser(): Promise<AuthenticatedRequestUser | null> {
  return getAuthenticatedRequestUser({ requiredSessionType: "user" });
}

export async function getAdminRequestUser(): Promise<AuthenticatedRequestUser | null> {
  const mysqlUser = await getAuthenticatedRequestUser();
  if (!mysqlUser || mysqlUser.role !== "admin") {
    return null;
  }

  if (mysqlUser.sessionType !== "admin") {
    return null;
  }

  if (!mysqlUser.mfaVerifiedAt) {
    return null;
  }

  return mysqlUser;
}
