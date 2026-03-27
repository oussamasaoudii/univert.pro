import { NextResponse, type NextRequest } from "next/server";
import { getAdminDashboardUserIfAuthorized } from "@/lib/security/admin-response";
import {
  getCountryById,
  updateCountry,
  deleteCountry,
  isValidCountrySlug,
} from "@/lib/countries/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminDashboardUserIfAuthorized(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const countryId = parseInt(id, 10);
    
    if (isNaN(countryId)) {
      return NextResponse.json({ error: "Invalid country ID" }, { status: 400 });
    }

    const country = await getCountryById(countryId);
    
    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    return NextResponse.json({ country });
  } catch (error) {
    console.error("[API] Error fetching country:", error);
    return NextResponse.json(
      { error: "Failed to fetch country" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminDashboardUserIfAuthorized(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const countryId = parseInt(id, 10);
    
    if (isNaN(countryId)) {
      return NextResponse.json({ error: "Invalid country ID" }, { status: 400 });
    }

    const body = await request.json();

    // Validate slug if provided
    if (body.slug && !isValidCountrySlug(body.slug)) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 }
      );
    }

    // Validate ISO code if provided
    if (body.isoCode && body.isoCode.length !== 2) {
      return NextResponse.json(
        { error: "ISO code must be exactly 2 characters" },
        { status: 400 }
      );
    }

    // Validate currency code if provided
    if (body.currencyCode && body.currencyCode.length !== 3) {
      return NextResponse.json(
        { error: "Currency code must be exactly 3 characters" },
        { status: 400 }
      );
    }

    const country = await updateCountry(countryId, body);
    
    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    return NextResponse.json({ country });
  } catch (error: unknown) {
    console.error("[API] Error updating country:", error);
    
    const mysqlError = error as { code?: string };
    if (mysqlError.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A country with this ISO code or slug already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update country" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminDashboardUserIfAuthorized(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const countryId = parseInt(id, 10);
    
    if (isNaN(countryId)) {
      return NextResponse.json({ error: "Invalid country ID" }, { status: 400 });
    }

    const deleted = await deleteCountry(countryId);
    
    if (!deleted) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error deleting country:", error);
    return NextResponse.json(
      { error: "Failed to delete country" },
      { status: 500 }
    );
  }
}
