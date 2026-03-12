import { NextRequest, NextResponse } from "next/server";
import { requireAdminRouteAccess } from "@/lib/security/admin-api";
import {
  getAllPageSections,
  getPageSections,
  upsertPageSection,
  deletePageSection,
  getPageSectionById,
} from "@/lib/mysql/content";
import { z } from "zod";

const pageSectionSchema = z.object({
  page_key: z.string().min(1),
  section_key: z.string().min(1),
  title_en: z.string().min(1),
  title_ar: z.string().min(1),
  subtitle_en: z.string().optional(),
  subtitle_ar: z.string().optional(),
  content_en: z.string().optional(),
  content_ar: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  display_order: z.number().default(0),
  is_active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request, { scope: "admin-content-sections-read" });
    
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("page_key");
    
    const sections = pageKey 
      ? await getPageSections(pageKey)
      : await getAllPageSections();
    
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error("[Admin Page Sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request, { scope: "admin-content-sections-write" });
    
    const body = await request.json();
    const data = pageSectionSchema.parse(body);
    
    const section = await upsertPageSection(data);
    
    if (!section) {
      return NextResponse.json(
        { success: false, error: "Failed to create page section" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Admin Page Sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create page section" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request, { scope: "admin-content-sections-write" });
    
    const body = await request.json();
    const data = pageSectionSchema.parse(body);
    
    const section = await upsertPageSection(data);
    
    if (!section) {
      return NextResponse.json(
        { success: false, error: "Failed to update page section" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Admin Page Sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update page section" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request, { scope: "admin-content-sections-write" });
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Section ID is required" },
        { status: 400 }
      );
    }
    
    const existing = await getPageSectionById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Page section not found" },
        { status: 404 }
      );
    }
    
    const deleted = await deletePageSection(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete page section" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Page Sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete page section" },
      { status: 500 }
    );
  }
}
