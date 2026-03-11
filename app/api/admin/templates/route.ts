import { z } from "zod";
import {
  createTemplate,
  listTemplates,
  type TemplateCategory,
  type TemplateStack,
} from "@/lib/mysql/platform";
import {
  adminJson,
  parseSearchParams,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import {
  parseJsonBody,
} from "@/lib/security/request";

const CATEGORIES = [
  "corporate",
  "agency",
  "portfolio",
  "ecommerce",
  "restaurant",
  "saas",
  "marketplace",
 ] as const satisfies readonly TemplateCategory[];

const STACKS = ["Laravel", "Next.js", "WordPress"] as const satisfies readonly TemplateStack[];

function parseCategory(value: unknown): TemplateCategory | undefined {
  return typeof value === "string" && CATEGORIES.includes(value as TemplateCategory)
    ? (value as TemplateCategory)
    : undefined;
}

function parseStack(value: unknown): TemplateStack | undefined {
  return typeof value === "string" && STACKS.includes(value as TemplateStack)
    ? (value as TemplateStack)
    : undefined;
}

const listTemplatesQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    includeInactive: z.enum(["true", "false"]).optional(),
  })
  .strict();

const createTemplateSchema = z
  .object({
    name: z.string().trim().min(1).max(191),
    description: z.string().trim().min(1).max(2000),
    category: z.enum(CATEGORIES),
    stack: z.enum(STACKS),
    startingPrice: z.coerce.number().finite().min(0).max(1000000),
    performanceScore: z.coerce.number().finite().min(0).max(5).optional(),
    featured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    liveDemoUrl: z.string().trim().url().max(500).optional().or(z.literal("")).nullable(),
    previewImageUrl: z.string().trim().url().max(500).optional().or(z.literal("")).nullable(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-templates-read",
      limit: 60,
      resourceId: "/api/admin/templates",
    });

    const query = parseSearchParams(request, listTemplatesQuerySchema, {
      actorId: adminUser.id,
      actorType: "admin",
      resourceId: "/api/admin/templates",
    });
    const includeInactive = query.includeInactive === "true";

    const templates = await listTemplates({
      search: query.search,
      includeInactive,
    });

    return adminJson({ templates });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.templates.list" });
  }
}

export async function POST(request: Request) {
  try {
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-templates-write",
      limit: 20,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
      resourceId: "/api/admin/templates",
    });

    const body = await parseJsonBody(request, createTemplateSchema, {
      maxBytes: 16 * 1024,
      audit: {
        actorId: adminUser.id,
        actorType: "admin",
        resourceId: "/api/admin/templates",
      },
    });
    const category = parseCategory(body.category);
    const stack = parseStack(body.stack);
    if (!category || !stack) {
      return adminJson({ error: "invalid_payload" }, { status: 400 });
    }

    const template = await createTemplate({
      name: body.name,
      description: body.description,
      category,
      stack,
      startingPrice: body.startingPrice,
      performanceScore: body.performanceScore ?? 4.5,
      featured: body.featured ?? false,
      isActive: body.isActive ?? true,
      liveDemoUrl: body.liveDemoUrl?.trim() ? body.liveDemoUrl.trim() : null,
      previewImageUrl: body.previewImageUrl?.trim() ? body.previewImageUrl.trim() : null,
    });

    return adminJson({ ok: true, template }, { status: 201 });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.templates.create" });
  }
}
