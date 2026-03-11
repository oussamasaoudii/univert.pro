import { z } from "zod";
import { listUsersForAdmin, sanitizeAdminUserForClient } from "@/lib/mysql/users";
import {
  adminJson,
  parseSearchParams,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";

const listUsersQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
  })
  .strict();

type AdminUsersRouteDeps = {
  listUsersForAdmin: typeof listUsersForAdmin;
  parseSearchParams: typeof parseSearchParams;
  requireAdminRouteAccess: typeof requireAdminRouteAccess;
};

const adminUsersRouteDeps: AdminUsersRouteDeps = {
  listUsersForAdmin,
  parseSearchParams,
  requireAdminRouteAccess,
};

export async function handleAdminUsersGet(
  request: Request,
  deps: AdminUsersRouteDeps = adminUsersRouteDeps,
) {
  try {
    const { adminUser } = await deps.requireAdminRouteAccess(request, {
      scope: "admin-users-read",
      limit: 60,
      resourceId: "/api/admin/users",
    });

    const query = deps.parseSearchParams(request, listUsersQuerySchema, {
      actorId: adminUser.id,
      actorType: "admin",
      resourceId: "/api/admin/users",
    });

    const users = await deps.listUsersForAdmin(query.search);
    return adminJson({ users: users.map(sanitizeAdminUserForClient) });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.users.list" });
  }
}

export async function GET(request: Request) {
  return handleAdminUsersGet(request);
}
