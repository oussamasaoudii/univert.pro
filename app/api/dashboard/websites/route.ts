import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { listDomainsByUser } from "@/lib/mysql/domains";
import {
  listTemplates,
  listUserActivities,
  listUserWebsites,
} from "@/lib/mysql/platform";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";
import {
  sanitizeDashboardActivitySummary,
  sanitizeDashboardDomainSummary,
  sanitizeDashboardWebsiteSummary,
} from "@/lib/security/dashboard-response";

type DashboardWebsitesRouteDeps = {
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAuthenticatedRequestUser: typeof getAuthenticatedRequestUser;
  listDomainsByUser: typeof listDomainsByUser;
  listTemplates: typeof listTemplates;
  listUserActivities: typeof listUserActivities;
  listUserWebsites: typeof listUserWebsites;
};

const dashboardWebsitesRouteDeps: DashboardWebsitesRouteDeps = {
  enforceRouteRateLimit,
  getAuthenticatedRequestUser,
  listDomainsByUser,
  listTemplates,
  listUserActivities,
  listUserWebsites,
};

export async function handleDashboardWebsitesGet(
  request: Request,
  deps: DashboardWebsitesRouteDeps = dashboardWebsitesRouteDeps,
) {
  try {
    const user = await deps.getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "dashboard-websites-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 180,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const [websites, domains, activities, templates] = await Promise.all([
      deps.listUserWebsites(user.id),
      deps.listDomainsByUser(user.id),
      deps.listUserActivities(user.id, 12),
      deps.listTemplates({ includeInactive: false }),
    ]);

    return NextResponse.json({
      websites: websites.map(sanitizeDashboardWebsiteSummary),
      domains: domains.map(sanitizeDashboardDomainSummary),
      activities: activities.map(sanitizeDashboardActivitySummary),
      templates,
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.websites" });
  }
}

export async function GET(request: Request) {
  return handleDashboardWebsitesGet(request);
}
