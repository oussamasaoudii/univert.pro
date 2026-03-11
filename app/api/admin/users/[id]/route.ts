import { z } from "zod";
import { ADMIN_STEP_UP_WINDOW_MS, assertRecentAdminStepUp } from "@/lib/security/admin-session";
import {
  countActiveAdmins,
  findUserById,
  sanitizeAdminUserForClient,
  updateUserAdminFields,
} from "@/lib/mysql/users";
import { createAuditLog } from "@/lib/utils/audit";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import { assertTrustedOrigin, parseJsonBody } from "@/lib/security/request";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateAdminUserSchema = z
  .object({
    role: z.enum(["user", "admin"]).optional(),
    status: z.enum(["pending", "active", "suspended"]).optional(),
    emailVerified: z.boolean().optional(),
  })
  .strict();

export async function PATCH(request: Request, context: RouteContext) {
  try {
    assertTrustedOrigin(request);
    const { adminUser, ipAddress, userAgent } = await requireAdminRouteAccess(request, {
      scope: "admin-user-update",
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
      resourceId: "/api/admin/users/[id]",
    });
    assertRecentAdminStepUp(adminUser.stepUpVerifiedAt, ADMIN_STEP_UP_WINDOW_MS);

    const { id } = await context.params;
    if (!id) {
      return adminJson({ error: "invalid_user_id" }, { status: 400 });
    }

    const targetUser = await findUserById(id);
    if (!targetUser) {
      return adminJson({ error: "user_not_found" }, { status: 404 });
    }

    const body = await parseJsonBody(request, updateAdminUserSchema, {
      maxBytes: 8 * 1024,
      audit: {
        actorId: adminUser.id,
        actorType: "admin",
        resourceId: `/api/admin/users/${id}`,
      },
    });
    const targetIsActiveAdmin =
      targetUser.role === "admin" && targetUser.status === "active";

    if (
      adminUser.id === targetUser.id &&
      ((body.role && body.role !== "admin") || body.status === "suspended")
    ) {
      return adminJson(
        { error: "cannot_modify_own_admin_access" },
        { status: 400 },
      );
    }

    if (
      targetIsActiveAdmin &&
      ((body.role && body.role !== "admin") || body.status === "suspended")
    ) {
      const activeAdmins = await countActiveAdmins();
      if (activeAdmins <= 1) {
        return adminJson(
          { error: "cannot_remove_last_active_admin" },
          { status: 400 },
        );
      }
    }

    const user = await updateUserAdminFields(
      id,
      {
        role: body.role,
        status: body.status,
        emailVerified: body.emailVerified,
      },
      adminUser.id,
    );

    if (!user) {
      return adminJson({ error: "user_not_found" }, { status: 404 });
    }

    await createAuditLog({
      actor_id: adminUser.id,
      actor_type: "admin",
      action: "admin.update_user_access",
      resource_type: "user",
      resource_id: user.id,
      changes: {
        before: {
          role: targetUser.role,
          status: targetUser.status,
          emailVerified: targetUser.emailVerified,
        },
        after: {
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        },
      },
      status: "success",
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return adminJson({ ok: true, user: sanitizeAdminUserForClient(user) });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.users.patch" });
  }
}
