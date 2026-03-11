import { isIP } from "node:net";
import { z } from "zod";
import {
  createServer,
  listServers,
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

const serverStatusSchema = z.enum([
  "healthy",
  "degraded",
  "offline",
  "maintenance",
]);

const createServerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    region: z.string().trim().min(2).max(120),
    provider: z.string().trim().min(2).max(120),
    ipAddress: z
      .string()
      .trim()
      .refine((value) => isIP(value) !== 0, "invalid_ip_address"),
    operatingSystem: z.string().trim().min(2).max(120),
    stackSupport: z.array(z.string().trim().min(1).max(60)).max(10),
    status: serverStatusSchema.optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-servers-read",
      limit: 60,
    });

    const servers = await listServers();
    return adminJson({
      servers: servers.map(sanitizeServerSummaryForAdmin),
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.servers.list" });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-servers-write",
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });
    assertTrustedOrigin(request);

    const body = await parseJsonBody(request, createServerSchema, {
      maxBytes: 16 * 1024,
    });

    const server = await createServer({
      name: body.name,
      region: body.region,
      provider: body.provider,
      ipAddress: body.ipAddress,
      operatingSystem: body.operatingSystem,
      stackSupport: body.stackSupport,
      status: body.status,
    });

    return adminJson(
      {
        ok: true,
        server: sanitizeServerSummaryForAdmin(server),
      },
      { status: 201 },
    );
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.servers.create" });
  }
}
