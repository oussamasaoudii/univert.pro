import { z } from "zod";
import {
  deleteProvisioningProfile,
  getProvisioningProfileById,
  updateProvisioningProfile,
  type ProfileStatus,
} from "@/lib/mysql/operations";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import { assertTrustedOrigin, parseJsonBody } from "@/lib/security/request";
import { ValidationError } from "@/lib/utils/errors";

const VALID_PROFILE_STATUSES: ProfileStatus[] = ["active", "disabled"];
const routeParamsSchema = z.object({ id: z.string().trim().min(1).max(191) });

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(191).optional(),
    stack: z.string().trim().min(1).max(80).optional(),
    method: z.string().trim().min(1).max(80).optional(),
    server: z.string().trim().min(1).max(191).optional(),
    database: z.string().trim().min(1).max(120).optional(),
    domain: z.string().trim().min(1).max(120).optional(),
    ssl: z.string().trim().min(1).max(120).optional(),
    status: z.enum(VALID_PROFILE_STATUSES).optional(),
  })
  .strict();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-profiles-read",
      limit: 40,
    });

    const params = routeParamsSchema.parse(await context.params);
    const profile = await getProvisioningProfileById(params.id);
    if (!profile) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    return adminJson({ profile });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.profile.read" });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertTrustedOrigin(request);
    await requireAdminRouteAccess(request, {
      scope: "admin-profiles-write",
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const params = routeParamsSchema.parse(await context.params);
    const updates = await parseJsonBody(request, updateProfileSchema, { maxBytes: 16 * 1024 });

    if (Object.keys(updates).length === 0) {
      throw new ValidationError("no_updates");
    }

    const profile = await updateProvisioningProfile(params.id, updates);
    if (!profile) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    return adminJson({ ok: true, profile });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.profile.update" });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertTrustedOrigin(request);
    await requireAdminRouteAccess(request, {
      scope: "admin-profiles-write",
      limit: 10,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const params = routeParamsSchema.parse(await context.params);
    const deleted = await deleteProvisioningProfile(params.id);
    if (!deleted) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    return adminJson({ ok: true });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.profile.delete" });
  }
}
