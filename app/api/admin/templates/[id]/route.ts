import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import {
  deleteTemplate,
  updateTemplate,
  type TemplateCategory,
  type TemplateStack,
} from "@/lib/mysql/platform";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const CATEGORIES: TemplateCategory[] = [
  "corporate",
  "agency",
  "portfolio",
  "ecommerce",
  "restaurant",
  "saas",
  "marketplace",
];

const STACKS: TemplateStack[] = ["Laravel", "Next.js", "WordPress"];

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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "invalid_template_id" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const updates: Partial<{
      name: string;
      description: string;
      category: TemplateCategory;
      stack: TemplateStack;
      startingPrice: number;
      performanceScore: number;
      featured: boolean;
      isActive: boolean;
      liveDemoUrl: string | null;
      previewImageUrl: string | null;
    }> = {};

    if (typeof body.name === "string") {
      updates.name = body.name.trim();
    }

    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }

    const category = parseCategory(body.category);
    if (category) {
      updates.category = category;
    }

    const stack = parseStack(body.stack);
    if (stack) {
      updates.stack = stack;
    }

    if (typeof body.startingPrice === "number" && !Number.isNaN(body.startingPrice)) {
      updates.startingPrice = body.startingPrice;
    }

    if (
      typeof body.performanceScore === "number" &&
      !Number.isNaN(body.performanceScore)
    ) {
      updates.performanceScore = body.performanceScore;
    }

    if (typeof body.featured === "boolean") {
      updates.featured = body.featured;
    }

    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }

    if (Object.prototype.hasOwnProperty.call(body, "liveDemoUrl")) {
      updates.liveDemoUrl =
        typeof body.liveDemoUrl === "string" && body.liveDemoUrl.trim()
          ? body.liveDemoUrl.trim()
          : null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "previewImageUrl")) {
      updates.previewImageUrl =
        typeof body.previewImageUrl === "string" && body.previewImageUrl.trim()
          ? body.previewImageUrl.trim()
          : null;
    }

    const template = await updateTemplate(id, updates);
    if (!template) {
      return NextResponse.json({ error: "template_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, template });
  } catch (error) {
    console.error("[api/admin/templates/:id][PATCH] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "invalid_template_id" }, { status: 400 });
    }

    const deleted = await deleteTemplate(id);
    if (!deleted) {
      return NextResponse.json({ error: "template_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/templates/:id][DELETE] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
