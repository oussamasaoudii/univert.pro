import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { listUserActivities } from "@/lib/mysql/platform";
import { getPreviewActivityRecords } from "@/lib/preview-data";
import { isPreviewMode } from "@/lib/preview-mode";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";
import { ValidationError } from "@/lib/utils/errors";

const activityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  try {
    const queryResult = activityQuerySchema.safeParse({
      limit: new URL(request.url).searchParams.get("limit") || undefined,
    });
    if (!queryResult.success) {
      throw new ValidationError("invalid_query_params", {
        issues: queryResult.error.flatten(),
      });
    }

    if (isPreviewMode()) {
      return NextResponse.json({
        activities: getPreviewActivityRecords(queryResult.data.limit),
      });
    }

    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "dashboard-activity-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 180,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const activities = await listUserActivities(user.id, queryResult.data.limit);
    return NextResponse.json({ activities });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.activity" });
  }
}
