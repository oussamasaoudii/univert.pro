import { z } from "zod";
import {
  createDomain,
  listDomains,
  resolveUserIdByEmail,
} from "@/lib/mysql/domains";
import {
  adminJson,
  parseSearchParams,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import { parseJsonBody } from "@/lib/security/request";

const domainStatusSchema = z.enum(["pending", "verified", "failed"]);
const sslStatusSchema = z.enum(["pending", "active", "expired"]);

const listDomainsQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
  })
  .strict();

const createDomainSchema = z
  .object({
    domain: z.string().trim().min(1).max(255),
    ownerEmail: z.string().trim().email().max(191).optional().or(z.literal("")),
    websiteName: z.string().trim().max(191).optional().nullable(),
    verificationStatus: domainStatusSchema.optional(),
    sslStatus: sslStatusSchema.optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-domains-read",
      limit: 60,
      resourceId: "/api/admin/domains",
    });

    const query = parseSearchParams(request, listDomainsQuerySchema, {
      actorId: adminUser.id,
      actorType: "admin",
      resourceId: "/api/admin/domains",
    });
    const domains = await listDomains(query.search);

    return adminJson({ domains });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.domains.list" });
  }
}

export async function POST(request: Request) {
  try {
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-domains-write",
      limit: 20,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
      resourceId: "/api/admin/domains",
    });

    const body = await parseJsonBody(request, createDomainSchema, {
      maxBytes: 8 * 1024,
      audit: {
        actorId: adminUser.id,
        actorType: "admin",
        resourceId: "/api/admin/domains",
      },
    });
    const domain = body.domain;
    const ownerEmail = body.ownerEmail?.trim().toLowerCase() || "";
    const websiteName = body.websiteName?.trim() || "";

    let userId: string | null = null;
    if (ownerEmail) {
      userId = await resolveUserIdByEmail(ownerEmail);
      if (!userId) {
        return adminJson({ error: "owner_not_found" }, { status: 400 });
      }
    }

    const result = await createDomain({
      domain,
      userId,
      websiteName: websiteName || null,
      verificationStatus: body.verificationStatus,
      sslStatus: body.sslStatus,
      isPrimary: body.isPrimary ?? false,
    });

    if (result.error) {
      const statusCode =
        result.error === "already_exists"
          ? 409
          : result.error === "invalid_domain"
            ? 422
            : 400;

      return adminJson({ error: result.error }, { status: statusCode });
    }

    return adminJson({ ok: true, domain: result.domain }, { status: 201 });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.domains.create" });
  }
}
