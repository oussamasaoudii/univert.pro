import { NextResponse, type NextRequest } from "next/server";
import { getAdminDashboardUserIfAuthorized } from "@/lib/security/admin-response";
import { listCountries, getCountryPlanPrices, upsertCountryPlanPrice } from "@/lib/countries/db";
import { listBillingPlans } from "@/lib/mysql/billing";
import type { BillingPeriod } from "@/lib/countries/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getAdminDashboardUserIfAuthorized(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [countries, plans] = await Promise.all([
      listCountries({ includeInactive: true }),
      listBillingPlans({ includeInactive: true }),
    ]);

    // Get pricing for all countries
    const pricingByCountry: Record<
      number,
      Record<string, { monthly: number | null; yearly: number | null; stripePriceIdMonthly: string | null; stripePriceIdYearly: string | null }>
    > = {};

    for (const country of countries) {
      const prices = await getCountryPlanPrices(country.id, { includeInactive: true });
      pricingByCountry[country.id] = {};

      for (const plan of plans) {
        pricingByCountry[country.id][plan.id] = {
          monthly: null,
          yearly: null,
          stripePriceIdMonthly: null,
          stripePriceIdYearly: null,
        };
      }

      for (const price of prices) {
        if (pricingByCountry[country.id][price.planId]) {
          if (price.billingPeriod === "monthly") {
            pricingByCountry[country.id][price.planId].monthly = price.price;
            pricingByCountry[country.id][price.planId].stripePriceIdMonthly = price.stripePriceId;
          } else {
            pricingByCountry[country.id][price.planId].yearly = price.price;
            pricingByCountry[country.id][price.planId].stripePriceIdYearly = price.stripePriceId;
          }
        }
      }
    }

    return NextResponse.json({
      countries,
      plans,
      pricingByCountry,
    });
  } catch (error) {
    console.error("[API] Error fetching pricing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing data" },
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
    const { countryId, planId, billingPeriod, price, comparePrice, stripePriceId, isActive } = body;

    if (!countryId || !planId || !billingPeriod) {
      return NextResponse.json(
        { error: "Missing required fields: countryId, planId, billingPeriod" },
        { status: 400 }
      );
    }

    if (!["monthly", "yearly"].includes(billingPeriod)) {
      return NextResponse.json(
        { error: "billingPeriod must be 'monthly' or 'yearly'" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    const result = await upsertCountryPlanPrice({
      countryId: parseInt(countryId, 10),
      planId,
      billingPeriod: billingPeriod as BillingPeriod,
      price,
      comparePrice: comparePrice ?? null,
      stripePriceId: stripePriceId ?? null,
      isActive: isActive !== false,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to save pricing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ price: result });
  } catch (error) {
    console.error("[API] Error saving pricing:", error);
    return NextResponse.json(
      { error: "Failed to save pricing" },
      { status: 500 }
    );
  }
}
