import { NextResponse, type NextRequest } from "next/server";
import { getAdminDashboardUserIfAuthorized } from "@/lib/security/admin-response";
import { upsertCountryPlanPrice } from "@/lib/countries/db";
import type { BillingPeriod } from "@/lib/countries/types";

export const dynamic = "force-dynamic";

type PriceUpdate = {
  countryId: number;
  planId: string;
  billingPeriod: BillingPeriod;
  price: number;
  comparePrice?: number | null;
  stripePriceId?: string | null;
  isActive?: boolean;
};

export async function POST(request: NextRequest) {
  const user = await getAdminDashboardUserIfAuthorized(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prices } = body as { prices: PriceUpdate[] };

    if (!Array.isArray(prices) || prices.length === 0) {
      return NextResponse.json(
        { error: "prices must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate all prices first
    for (const price of prices) {
      if (!price.countryId || !price.planId || !price.billingPeriod) {
        return NextResponse.json(
          { error: "Each price must have countryId, planId, and billingPeriod" },
          { status: 400 }
        );
      }

      if (!["monthly", "yearly"].includes(price.billingPeriod)) {
        return NextResponse.json(
          { error: "billingPeriod must be 'monthly' or 'yearly'" },
          { status: 400 }
        );
      }

      if (typeof price.price !== "number" || price.price < 0) {
        return NextResponse.json(
          { error: "Price must be a non-negative number" },
          { status: 400 }
        );
      }
    }

    // Process all price updates
    const results = [];
    const errors = [];

    for (const price of prices) {
      try {
        const result = await upsertCountryPlanPrice({
          countryId: price.countryId,
          planId: price.planId,
          billingPeriod: price.billingPeriod,
          price: price.price,
          comparePrice: price.comparePrice ?? null,
          stripePriceId: price.stripePriceId ?? null,
          isActive: price.isActive !== false,
        });

        if (result) {
          results.push(result);
        } else {
          errors.push({
            countryId: price.countryId,
            planId: price.planId,
            billingPeriod: price.billingPeriod,
            error: "Failed to save",
          });
        }
      } catch (error) {
        errors.push({
          countryId: price.countryId,
          planId: price.planId,
          billingPeriod: price.billingPeriod,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      saved: results.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[API] Error bulk saving pricing:", error);
    return NextResponse.json(
      { error: "Failed to save pricing" },
      { status: 500 }
    );
  }
}
