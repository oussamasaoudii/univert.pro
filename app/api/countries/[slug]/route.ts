import { NextResponse, type NextRequest } from "next/server";
import { getCountryWithPricing, isValidCountrySlug } from "@/lib/countries/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!isValidCountrySlug(slug)) {
      return NextResponse.json(
        { error: "Invalid country slug" },
        { status: 400 }
      );
    }

    const result = await getCountryWithPricing(slug);

    if (!result) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Error fetching country:", error);
    return NextResponse.json(
      { error: "Failed to fetch country" },
      { status: 500 }
    );
  }
}
