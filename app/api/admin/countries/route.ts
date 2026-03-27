import { NextResponse, type NextRequest } from "next/server";
import { getAdminDashboardUserIfAuthorized } from "@/lib/security/admin-response";
import {
  listCountries,
  createCountry,
  isValidCountrySlug,
} from "@/lib/countries/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getAdminDashboardUserIfAuthorized(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const countries = await listCountries({ includeInactive: true });
    return NextResponse.json({ countries });
  } catch (error) {
    console.error("[API] Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getAdminDashboardUserIfAuthorized(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    const { isoCode, slug, name, currencyCode, currencySymbol, locale } = body;
    
    if (!isoCode || !slug || !name || !currencyCode || !currencySymbol || !locale) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidCountrySlug(slug)) {
      return NextResponse.json(
        { error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only." },
        { status: 400 }
      );
    }

    if (isoCode.length !== 2) {
      return NextResponse.json(
        { error: "ISO code must be exactly 2 characters" },
        { status: 400 }
      );
    }

    if (currencyCode.length !== 3) {
      return NextResponse.json(
        { error: "Currency code must be exactly 3 characters" },
        { status: 400 }
      );
    }

    const country = await createCountry({
      isoCode,
      slug,
      name,
      nameNative: body.nameNative || null,
      currencyCode,
      currencySymbol,
      locale,
      textDirection: body.textDirection || "ltr",
      flagEmoji: body.flagEmoji || null,
      isDefault: body.isDefault === true,
      isActive: body.isActive !== false,
      position: body.position || 0,
    });

    if (!country) {
      return NextResponse.json(
        { error: "Failed to create country" },
        { status: 500 }
      );
    }

    return NextResponse.json({ country }, { status: 201 });
  } catch (error: unknown) {
    console.error("[API] Error creating country:", error);
    
    const mysqlError = error as { code?: string };
    if (mysqlError.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A country with this ISO code or slug already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create country" },
      { status: 500 }
    );
  }
}
