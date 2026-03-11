import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { createUserActivity, createUserNotification } from "@/lib/mysql/platform";
import { getDomain, setPrimaryDomain } from "@/lib/db/domains";
import {
  queueCrossTenantAccessAuditLog,
  toSecurityActorType,
  type CrossTenantAuditLogger,
} from "@/lib/security/audit";
import {
  assignDashboardDomainToWebsiteForUser,
  deleteDashboardDomainForUser,
  getOwnedDashboardDomain,
  listDashboardDomainsForUser,
} from "@/lib/domain/user-domain-service";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const patchDomainSchema = z
  .object({
    websiteId: z.string().trim().min(1).max(64).optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

type DashboardDomainRouteDeps = {
  assignDashboardDomainToWebsiteForUser: typeof assignDashboardDomainToWebsiteForUser;
  createUserActivity: typeof createUserActivity;
  createUserNotification: typeof createUserNotification;
  deleteDashboardDomainForUser: typeof deleteDashboardDomainForUser;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAuthenticatedRequestUser: typeof getAuthenticatedRequestUser;
  getDomain: typeof getDomain;
  getOwnedDashboardDomain: typeof getOwnedDashboardDomain;
  listDashboardDomainsForUser: typeof listDashboardDomainsForUser;
  parseJsonBody: typeof parseJsonBody;
  securityAuditLog: CrossTenantAuditLogger;
  setPrimaryDomain: typeof setPrimaryDomain;
};

const dashboardDomainRouteDeps: DashboardDomainRouteDeps = {
  assignDashboardDomainToWebsiteForUser,
  createUserActivity,
  createUserNotification,
  deleteDashboardDomainForUser,
  enforceRouteRateLimit,
  getAuthenticatedRequestUser,
  getDomain,
  getOwnedDashboardDomain,
  listDashboardDomainsForUser,
  parseJsonBody,
  securityAuditLog: queueCrossTenantAccessAuditLog,
  setPrimaryDomain,
};

async function auditCrossTenantDomainAccess(
  request: Request,
  deps: DashboardDomainRouteDeps,
  input: {
    actorId: string;
    actorRole: string;
    domainId: string;
    statusCode: 404;
  },
) {
  const existingDomain = await deps.getDomain(input.domainId);
  if (!existingDomain || existingDomain.user_id === input.actorId) {
    return;
  }

  await Promise.resolve(
    deps.securityAuditLog(request, {
      actorId: input.actorId,
      actorType: toSecurityActorType(input.actorRole),
      resourceType: "domain",
      targetId: input.domainId,
      routeId: "/api/dashboard/domains/[id]",
      statusCode: input.statusCode,
      relatedResourceType: "user",
      relatedResourceId: existingDomain.user_id,
    }),
  );
}

export async function handleDashboardDomainGet(
  request: Request,
  context: RouteContext,
  deps: DashboardDomainRouteDeps = dashboardDomainRouteDeps,
) {
  try {
    const user = await deps.getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "dashboard-domain-detail",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const { id } = await context.params;
    const domain = await deps.getOwnedDashboardDomain(user.id, id);
    if (!domain) {
      await auditCrossTenantDomainAccess(request, deps, {
        actorId: user.id,
        actorRole: user.role,
        domainId: id,
        statusCode: 404,
      });
      return NextResponse.json({ error: "domain_not_found" }, { status: 404 });
    }

    return NextResponse.json({ domain });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.domains.detail" });
  }
}

export async function handleDashboardDomainPatch(
  request: Request,
  context: RouteContext,
  deps: DashboardDomainRouteDeps = dashboardDomainRouteDeps,
) {
  try {
    assertTrustedOrigin(request);
    const user = await deps.getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "dashboard-domain-update",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const { id } = await context.params;
    const current = await deps.getDomain(id);
    if (!current || current.user_id !== user.id) {
      if (current && current.user_id !== user.id) {
        await Promise.resolve(
          deps.securityAuditLog(request, {
            actorId: user.id,
            actorType: toSecurityActorType(user.role),
            resourceType: "domain",
            targetId: id,
            routeId: "/api/dashboard/domains/[id]",
            statusCode: 404,
            relatedResourceType: "user",
            relatedResourceId: current.user_id,
          }),
        );
      }
      return NextResponse.json({ error: "domain_not_found" }, { status: 404 });
    }

    const body = await deps.parseJsonBody(request, patchDomainSchema, {
      maxBytes: 8 * 1024,
      audit: {
        actorId: user.id,
        actorType: toSecurityActorType(user.role),
        resourceId: `/api/dashboard/domains/${id}`,
      },
    });
    if (typeof body.websiteId === "string" && body.websiteId.trim()) {
      const result = await deps.assignDashboardDomainToWebsiteForUser({
        userId: user.id,
        domainId: current.id,
        websiteId: body.websiteId.trim(),
        isPrimary: body.isPrimary === true,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: result.status || 400 });
      }

      await Promise.all([
        deps.createUserActivity(user.id, {
          activityType: "domain_bound",
          message: `${current.domain} is now bound to a website.`,
        }),
        deps.createUserNotification(user.id, {
          title: "Domain Bound",
          message: result.message,
        }),
      ]);

      return NextResponse.json({ ok: true, domain: result.domain, message: result.message });
    }

    if (body.isPrimary === true) {
      if (!current.website_id) {
        return NextResponse.json({ error: "bind_domain_first" }, { status: 400 });
      }

      await deps.setPrimaryDomain(current.website_id, current.id);

      await deps.createUserActivity(user.id, {
        activityType: "domain_primary_changed",
        message: `${current.domain} is now your primary domain.`,
      });
    }

    const refreshed = await deps.getOwnedDashboardDomain(user.id, current.id);
    if (!refreshed) {
      return NextResponse.json({ error: "domain_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, domain: refreshed });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.domains.update" });
  }
}

export async function handleDashboardDomainDelete(
  request: Request,
  context: RouteContext,
  deps: DashboardDomainRouteDeps = dashboardDomainRouteDeps,
) {
  try {
    assertTrustedOrigin(request);
    const user = await deps.getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "dashboard-domain-delete",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const { id } = await context.params;
    const current = await deps.getOwnedDashboardDomain(user.id, id);
    if (!current) {
      await auditCrossTenantDomainAccess(request, deps, {
        actorId: user.id,
        actorRole: user.role,
        domainId: id,
        statusCode: 404,
      });
      return NextResponse.json({ error: "domain_not_found" }, { status: 404 });
    }

    const result = await deps.deleteDashboardDomainForUser({
      userId: user.id,
      domainId: id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    await Promise.all([
      deps.createUserActivity(user.id, {
        activityType: "domain_removed",
        message: `Domain ${current.domain} was removed.`,
      }),
      deps.createUserNotification(user.id, {
        title: "Domain Removed",
        message: `${current.domain} has been removed from your account.`,
      }),
    ]);

    const remainingDomains = await deps.listDashboardDomainsForUser(user.id);
    return NextResponse.json({ ok: true, domains: remainingDomains });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.domains.delete" });
  }
}

export async function GET(request: Request, context: RouteContext) {
  return handleDashboardDomainGet(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleDashboardDomainPatch(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleDashboardDomainDelete(request, context);
}
