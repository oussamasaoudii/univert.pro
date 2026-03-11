import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { createUserActivity, createUserNotification } from "@/lib/mysql/platform";
import { getDomain } from "@/lib/db/domains";
import { verifyDashboardDomainForUser } from "@/lib/domain/user-domain-service";
import {
  queueCrossTenantAccessAuditLog,
  toSecurityActorType,
  type CrossTenantAuditLogger,
} from "@/lib/security/audit";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  toApiErrorResponse,
} from "@/lib/security/request";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DashboardDomainVerifyRouteDeps = {
  createUserActivity: typeof createUserActivity;
  createUserNotification: typeof createUserNotification;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAuthenticatedRequestUser: typeof getAuthenticatedRequestUser;
  getDomain: typeof getDomain;
  securityAuditLog: CrossTenantAuditLogger;
  verifyDashboardDomainForUser: typeof verifyDashboardDomainForUser;
};

const dashboardDomainVerifyRouteDeps: DashboardDomainVerifyRouteDeps = {
  createUserActivity,
  createUserNotification,
  enforceRouteRateLimit,
  getAuthenticatedRequestUser,
  getDomain,
  securityAuditLog: queueCrossTenantAccessAuditLog,
  verifyDashboardDomainForUser,
};

export async function handleDashboardDomainVerifyPost(
  request: Request,
  context: RouteContext,
  deps: DashboardDomainVerifyRouteDeps = dashboardDomainVerifyRouteDeps,
) {
  try {
    assertTrustedOrigin(request);
    const user = await deps.getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "dashboard-domain-verify",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const { id } = await context.params;
    const domain = await deps.getDomain(id);
    if (domain && domain.user_id !== user.id) {
      await Promise.resolve(
        deps.securityAuditLog(request, {
          actorId: user.id,
          actorType: toSecurityActorType(user.role),
          resourceType: "domain",
          targetId: id,
          routeId: "/api/dashboard/domains/[id]/verify",
          statusCode: 404,
          relatedResourceType: "user",
          relatedResourceId: domain.user_id,
        }),
      );
      return NextResponse.json(
        { error: "domain_not_found", pending: false },
        { status: 404 },
      );
    }

    const result = await deps.verifyDashboardDomainForUser({
      userId: user.id,
      domainId: id,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          pending: result.pending ?? false,
          domain: result.domain,
        },
        { status: result.status || 400 },
      );
    }

    await Promise.all([
      deps.createUserActivity(user.id, {
        activityType: "domain_verified",
        message: result.message,
      }),
      deps.createUserNotification(user.id, {
        title: result.domain.websiteId ? "Domain Connected" : "Domain Verified",
        message: result.message,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: result.message,
      domain: result.domain,
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.domains.verify" });
  }
}

export async function POST(request: Request, context: RouteContext) {
  return handleDashboardDomainVerifyPost(request, context);
}
