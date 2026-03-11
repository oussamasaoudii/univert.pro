import { isIP } from "node:net";
import { z } from "zod";
import {
  deleteServer,
  getServerById,
  updateServer,
} from "@/lib/mysql/operations";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import { sanitizeServerSummaryForAdmin } from "@/lib/security/admin-response";
import {
  assertTrustedOrigin,
  parseJsonBody,
} from "@/lib/security/request";

const serverIdSchema = z.string().regex(/^srv-[a-f0-9]{8}$/i, "invalid_server_id");
const serverStatusSchema = z.enum([
  "healthy",
  "degraded",
  "offline",
  "maintenance",
]);

const updateServerSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    region: z.string().trim().min(2).max(120).optional(),
    provider: z.string().trim().min(2).max(120).optional(),
    ipAddress: z
      .string()
      .trim()
      .refine((value) => isIP(value) !== 0, "invalid_ip_address")
      .optional(),
    operatingSystem: z.string().trim().min(2).max(120).optional(),
    stackSupport: z.array(z.string().trim().min(1).max(60)).max(10).optional(),
    status: serverStatusSchema.optional(),
    cpuUsage: z.number().int().min(0).max(100).optional(),
    ramUsage: z.number().int().min(0).max(100).optional(),
    diskUsage: z.number().int().min(0).max(100).optional(),
    provisioningEnabled: z.boolean().optional(),
  })
  .strict();

async function parseServerId(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return serverIdSchema.parse(params.id);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-server-detail-read",
      limit: 60,
    });

    const serverId = await parseServerId(context);
    const server = await getServerById(serverId);

    if (!server) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    return adminJson({ server });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.servers.read" });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-server-write",
      limit: 30,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });
    assertTrustedOrigin(request);

    const serverId = await parseServerId(context);
    const body = await parseJsonBody(request, updateServerSchema, {
      maxBytes: 16 * 1024,
    });

    if (Object.keys(body).length === 0) {
      return adminJson({ error: "no_updates" }, { status: 400 });
    }

    const server = await updateServer(serverId, {
      ...body,
    });
    if (!server) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    return adminJson({ ok: true, server: sanitizeServerSummaryForAdmin(server) });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.servers.update" });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-server-delete",
      limit: 12,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });
    assertTrustedOrigin(request);

    const serverId = await parseServerId(context);
    const deleted = await deleteServer(serverId);
    if (!deleted) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    return adminJson({ ok: true });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.servers.delete" });
  }
}
