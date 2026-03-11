import {
  createTemplate,
  getTemplateById as getPlatformTemplateById,
  listTemplates,
  updateTemplate,
} from "@/lib/mysql/platform";
import type { TemplateRow } from "./types";

function mapTemplate(row: Awaited<ReturnType<typeof getPlatformTemplateById>>): TemplateRow | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    stack: row.stack,
    category: row.category,
    image_url: row.previewImageUrl,
    featured: row.featured,
    is_public: row.isActive,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function getAllTemplates(): Promise<TemplateRow[]> {
  const templates = await listTemplates();
  return templates.map((template) => mapTemplate(template)).filter(Boolean) as TemplateRow[];
}

export async function getTemplateById(templateId: string): Promise<TemplateRow | null> {
  return mapTemplate(await getPlatformTemplateById(templateId));
}

export async function getTemplatesByStack(stack: string): Promise<TemplateRow[]> {
  const templates = await listTemplates();
  return templates
    .filter((template) => template.stack === stack)
    .map((template) => mapTemplate(template))
    .filter(Boolean) as TemplateRow[];
}

export async function getTemplatesByCategory(category: string): Promise<TemplateRow[]> {
  const templates = await listTemplates();
  return templates
    .filter((template) => template.category === category)
    .map((template) => mapTemplate(template))
    .filter(Boolean) as TemplateRow[];
}

export async function getFeaturedTemplates(): Promise<TemplateRow[]> {
  const templates = await listTemplates();
  return templates
    .filter((template) => template.featured)
    .slice(0, 6)
    .map((template) => mapTemplate(template))
    .filter(Boolean) as TemplateRow[];
}

export async function upsertTemplate(
  template: Partial<TemplateRow> & { id: string; name: string; slug: string },
): Promise<TemplateRow | null> {
  try {
    const existing = await getPlatformTemplateById(template.id, { includeInactive: true });
    const saved = existing
      ? await updateTemplate(template.id, {
          name: template.name,
          description: template.description ?? undefined,
          category: template.category as any,
          stack: template.stack as any,
          featured: typeof template.featured === "boolean" ? template.featured : undefined,
          isActive: typeof template.is_public === "boolean" ? template.is_public : undefined,
          previewImageUrl: template.image_url ?? undefined,
        })
      : await createTemplate({
          name: template.name,
          description: template.description || "",
          category: (template.category as any) || "saas",
          stack: (template.stack as any) || "Next.js",
          featured: template.featured,
          isActive: template.is_public,
          previewImageUrl: template.image_url || null,
          startingPrice: 29,
        });

    return mapTemplate(saved);
  } catch (error) {
    console.error("[db] Error upserting template:", error);
    return null;
  }
}
