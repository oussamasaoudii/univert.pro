import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardRequestUser } from "@/lib/api-auth";
import { listUserNotifications } from "@/lib/mysql/platform";
import { sanitizeDashboardNotificationSummary } from "@/lib/security/dashboard-response";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(8),
});

export async function GET(request: Request) {
  try {
    const user = await getDashboardRequestUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "dashboard-notifications-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 180,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      limit: searchParams.get("limit") || undefined,
    });

    const notifications = await listUserNotifications(user.id, query.limit);
    return NextResponse.json({
      notifications: notifications.map(sanitizeDashboardNotificationSummary),
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.notifications.read" });
  }
}
