import { z } from "zod";
import {
  createProvisioningProfile,
  listProvisioningProfiles,
  type ProfileStatus,
} from "@/lib/mysql/operations";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import {
  queueSecurityRequestAuditLog,
  type SecurityAuditLogger,
} from "@/lib/security/audit";
import { assertTrustedOrigin, parseJsonBody } from "@/lib/security/request";

const VALID_PROFILE_STATUSES: ProfileStatus[] = ["active", "disabled"];

const createProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(191),
    stack: z.string().trim().min(1).max(80),
    method: z.string().trim().min(1).max(80),
    server: z.string().trim().min(1).max(191),
    database: z.string().trim().min(1).max(120),
    domain: z.string().trim().min(1).max(120),
    ssl: z.string().trim().min(1).max(120),
    status: z.enum(VALID_PROFILE_STATUSES).optional(),
  })
  .strict();

type AdminProfilesRouteDeps = {
  createProvisioningProfile: typeof createProvisioningProfile;
  listProvisioningProfiles: typeof listProvisioningProfiles;
  parseJsonBody: typeof parseJsonBody;
  requireAdminRouteAccess: typeof requireAdminRouteAccess;
  securityAuditLog: SecurityAuditLogger;
};

const adminProfilesRouteDeps: AdminProfilesRouteDeps = {
  createProvisioningProfile,
  listProvisioningProfiles,
  parseJsonBody,
  requireAdminRouteAccess,
  securityAuditLog: queueSecurityRequestAuditLog,
};

export async function handleAdminProfilesGet(
  request: Request,
  deps: AdminProfilesRouteDeps = adminProfilesRouteDeps,
) {
  try {
    await deps.requireAdminRouteAccess(request, {
      scope: "admin-profiles-read",
      limit: 40,
      resourceId: "/api/admin/profiles",
      auditLog: deps.securityAuditLog,
    });

    const profiles = await deps.listProvisioningProfiles();
    return adminJson({ profiles });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.profiles.read" });
  }
}

export async function handleAdminProfilesPost(
  request: Request,
  deps: AdminProfilesRouteDeps = adminProfilesRouteDeps,
) {
  try {
    assertTrustedOrigin(request);
    const { adminUser } = await deps.requireAdminRouteAccess(request, {
      scope: "admin-profiles-write",
      limit: 15,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
      resourceId: "/api/admin/profiles",
      auditLog: deps.securityAuditLog,
    });

    const body = await deps.parseJsonBody(request, createProfileSchema, {
      maxBytes: 16 * 1024,
      audit: {
        resourceId: "/api/admin/profiles",
        actorId: adminUser.id,
        actorType: "admin",
        log: deps.securityAuditLog,
      },
    });
    const profile = await deps.createProvisioningProfile(body);
    return adminJson({ ok: true, profile }, { status: 201 });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.profiles.create" });
  }
}

export async function GET(request: Request) {
  return handleAdminProfilesGet(request);
}

export async function POST(request: Request) {
  return handleAdminProfilesPost(request);
}
