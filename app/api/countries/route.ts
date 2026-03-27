import { NextResponse } from "next/server";
import { listCountries, getDefaultCountry } from "@/lib/countries/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [countries, defaultCountry] = await Promise.all([
      listCountries(),
      getDefaultCountry(),
    ]);

    return NextResponse.json({
      countries,
      defaultCountry,
    });
  } catch (error) {
    console.error("[API] Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
