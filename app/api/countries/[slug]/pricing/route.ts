import { NextResponse, type NextRequest } from "next/server";
import { getCountryBySlug, getCountryPlanPrices, isValidCountrySlug } from "@/lib/countries/db";
import { listBillingPlans } from "@/lib/mysql/billing";

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

    const country = await getCountryBySlug(slug);

    if (!country) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      );
    }

    const [plans, countryPrices] = await Promise.all([
      listBillingPlans(),
      getCountryPlanPrices(country.id),
    ]);

    // Build pricing map
    const priceMap: Record<string, { monthly: number | null; yearly: number | null; stripePriceIdMonthly: string | null; stripePriceIdYearly: string | null }> = {};
    
    for (const plan of plans) {
      priceMap[plan.id] = {
        monthly: null,
        yearly: null,
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
      };
    }

    for (const price of countryPrices) {
      if (priceMap[price.planId]) {
        if (price.billingPeriod === "monthly") {
          priceMap[price.planId].monthly = price.price;
          priceMap[price.planId].stripePriceIdMonthly = price.stripePriceId;
        } else {
          priceMap[price.planId].yearly = price.price;
          priceMap[price.planId].stripePriceIdYearly = price.stripePriceId;
        }
      }
    }

    return NextResponse.json({
      country,
      plans: plans.map((plan) => ({
        ...plan,
        countryPricing: priceMap[plan.id] || null,
      })),
    });
  } catch (error) {
    console.error("[API] Error fetching country pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing" },
      { status: 500 }
    );
  }
}
