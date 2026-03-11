import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { listDomainsByUser } from "@/lib/mysql/domains";
import {
  getUserSubscription,
  listUserActivities,
  listUserNotifications,
  listUserWebsites,
} from "@/lib/mysql/platform";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";
import {
  sanitizeDashboardActivitySummary,
  sanitizeDashboardNotificationSummary,
  sanitizeDashboardOverviewWebsite,
  sanitizeDashboardSubscriptionSummary,
} from "@/lib/security/dashboard-response";

function buildTrafficData(totalViews: number, totalVisits: number) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (totalViews <= 0 && totalVisits <= 0) {
    return labels.map((label) => ({ date: label, views: 0, visits: 0 }));
  }

  return labels.map((label, index) => {
    const viewsWeight = 0.9 + (index % 3) * 0.12;
    const visitsWeight = 0.85 + (index % 4) * 0.1;
    return {
      date: label,
      views: Math.max(0, Math.round((totalViews / 7) * viewsWeight)),
      visits: Math.max(0, Math.round((totalVisits / 7) * visitsWeight)),
    };
  });
}

type DashboardOverviewRouteDeps = {
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAuthenticatedRequestUser: typeof getAuthenticatedRequestUser;
  getUserSubscription: typeof getUserSubscription;
  listDomainsByUser: typeof listDomainsByUser;
  listUserActivities: typeof listUserActivities;
  listUserNotifications: typeof listUserNotifications;
  listUserWebsites: typeof listUserWebsites;
};

const dashboardOverviewRouteDeps: DashboardOverviewRouteDeps = {
  enforceRouteRateLimit,
  getAuthenticatedRequestUser,
  getUserSubscription,
  listDomainsByUser,
  listUserActivities,
  listUserNotifications,
  listUserWebsites,
};

export async function handleDashboardOverviewGet(
  request: Request,
  deps: DashboardOverviewRouteDeps = dashboardOverviewRouteDeps,
) {
  try {
    const user = await deps.getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "dashboard-overview-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const [websites, domains, subscription, activities, notifications] =
      await Promise.all([
        deps.listUserWebsites(user.id),
        deps.listDomainsByUser(user.id),
        deps.getUserSubscription(user.id),
        deps.listUserActivities(user.id, 8),
        deps.listUserNotifications(user.id, 8),
      ]);

    const totals = websites.reduce(
      (acc, website) => {
        acc.views += website.pageViews;
        acc.visits += website.visits;
        return acc;
      },
      { views: 0, visits: 0 },
    );

    return NextResponse.json({
      websites: websites.map(sanitizeDashboardOverviewWebsite),
      domains: domains.map((domain) => ({ id: domain.id, domain: domain.domain })),
      subscription: sanitizeDashboardSubscriptionSummary(subscription),
      activities: activities.map(sanitizeDashboardActivitySummary),
      notifications: notifications.map(sanitizeDashboardNotificationSummary),
      trafficData: buildTrafficData(totals.views, totals.visits),
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.overview" });
  }
}

export async function GET(request: Request) {
  return handleDashboardOverviewGet(request);
}
