import { z } from "zod";
import { listAdminNotifications } from "@/lib/mysql/platform";
import { adminJson, requireAdminRouteAccess, toAdminApiErrorResponse } from "@/lib/security/admin-api";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(8),
});

export async function GET(request: Request) {
  try {
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-notifications-read",
      limit: 180,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      limit: searchParams.get("limit") || undefined,
    });

    const notifications = await listAdminNotifications(adminUser.id, query.limit);
    return adminJson({ notifications });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.notifications.read" });
  }
}
