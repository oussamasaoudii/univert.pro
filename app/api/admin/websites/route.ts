import { z } from "zod";
import { listWebsitesForAdmin } from "@/lib/mysql/platform";
import {
  adminJson,
  parseSearchParams,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";

const listWebsitesQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-websites-read",
      limit: 60,
      resourceId: "/api/admin/websites",
    });

    const query = parseSearchParams(request, listWebsitesQuerySchema, {
      actorId: adminUser.id,
      actorType: "admin",
      resourceId: "/api/admin/websites",
    });

    const websites = await listWebsitesForAdmin(query.search);
    return adminJson({ websites });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.websites.list" });
  }
}
