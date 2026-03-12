import { NextRequest, NextResponse } from "next/server";
import { requireAdminRouteAccess } from "@/lib/security/admin-api";
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialById,
} from "@/lib/mysql/content";
import { z } from "zod";

const testimonialSchema = z.object({
  author_name_en: z.string().min(1),
  author_name_ar: z.string().min(1),
  author_role_en: z.string().min(1),
  author_role_ar: z.string().min(1),
  author_avatar: z.string().optional(),
  quote_en: z.string().min(1),
  quote_ar: z.string().min(1),
  rating: z.number().min(1).max(5).default(5),
  company: z.string().optional(),
  display_order: z.number().default(0),
  is_active: z.boolean().default(true),
  page_key: z.string().default("home"),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request);
    
    const testimonials = await getAllTestimonials(true); // Include inactive for admin
    
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error("[Admin Testimonials] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request);
    
    const body = await request.json();
    const data = testimonialSchema.parse(body);
    
    const testimonial = await createTestimonial(data);
    
    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: "Failed to create testimonial" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Admin Testimonials] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request);
    
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Testimonial ID is required" },
        { status: 400 }
      );
    }
    
    const existing = await getTestimonialById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }
    
    const testimonial = await updateTestimonial(id, data);
    
    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error("[Admin Testimonials] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminRouteAccess(request);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Testimonial ID is required" },
        { status: 400 }
      );
    }
    
    const deleted = await deleteTestimonial(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Testimonials] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
