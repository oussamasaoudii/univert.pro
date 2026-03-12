import { NextRequest, NextResponse } from "next/server";
import { requireAdminRouteAccess } from "@/lib/security/admin-api";
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQById,
} from "@/lib/mysql/content";
import { z } from "zod";

const faqSchema = z.object({
  question_en: z.string().min(1),
  question_ar: z.string().min(1),
  answer_en: z.string().min(1),
  answer_ar: z.string().min(1),
  category: z.string().default("general"),
  display_order: z.number().default(0),
  is_active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request, { scope: "admin-content-faqs-read" });
    
    const faqs = await getAllFAQs(true); // Include inactive for admin
    
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error("[Admin FAQs] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request, { scope: "admin-content-faqs-write" });
    
    const body = await request.json();
    const data = faqSchema.parse(body);
    
    const faq = await createFAQ(data);
    
    if (!faq) {
      return NextResponse.json(
        { success: false, error: "Failed to create FAQ" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Admin FAQs] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request, { scope: "admin-content-faqs-write" });
    
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "FAQ ID is required" },
        { status: 400 }
      );
    }
    
    const existing = await getFAQById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }
    
    const faq = await updateFAQ(id, data);
    
    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error("[Admin FAQs] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request, { scope: "admin-content-faqs-write" });
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "FAQ ID is required" },
        { status: 400 }
      );
    }
    
    const deleted = await deleteFAQ(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin FAQs] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
