import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getCountryBySlug, getCountryPlanPrices, getCountrySeo, listCountries } from "@/lib/countries/db";
import { listBillingPlans } from "@/lib/mysql/billing";
import { CountryPricingClient } from "./client";
import type { Country, CountryPlanPrice } from "@/lib/countries/types";

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const country = await getCountryBySlug(countrySlug);

  if (!country) {
    return {
      title: "Pricing - Univert",
    };
  }

  const seo = await getCountrySeo(country.id, "pricing");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://univert.pro";

  return {
    title: seo?.metaTitle || `Pricing in ${country.name} - Univert`,
    description:
      seo?.metaDescription ||
      `View our pricing plans in ${country.currencyCode}. Choose the perfect plan for your needs in ${country.name}.`,
    openGraph: {
      title: seo?.ogTitle || `Pricing in ${country.name} - Univert`,
      description:
        seo?.ogDescription ||
        `Explore our hosting plans priced in ${country.currencyCode} for ${country.name}.`,
      url: `${baseUrl}/${country.slug}/pricing`,
    },
    alternates: {
      canonical: seo?.canonicalUrl || `${baseUrl}/${country.slug}/pricing`,
    },
  };
}

export async function generateStaticParams() {
  const countries = await listCountries();
  return countries.map((country) => ({
    country: country.slug,
  }));
}

export default async function CountryPricingPage({ params }: PageProps) {
  const { country: countrySlug } = await params;

  // Validate country slug
  if (!countrySlug || !/^[a-z0-9-]+$/.test(countrySlug)) {
    notFound();
  }

  const country = await getCountryBySlug(countrySlug);

  if (!country) {
    // Redirect to default pricing page if country not found
    redirect("/pricing");
  }

  if (!country.isActive) {
    redirect("/pricing");
  }

  // Fetch pricing data
  const [plans, countryPrices, allCountries] = await Promise.all([
    listBillingPlans(),
    getCountryPlanPrices(country.id),
    listCountries(),
  ]);

  // Build pricing map
  const priceMap: Record<
    string,
    { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }
  > = {};

  for (const plan of plans) {
    priceMap[plan.id] = { monthly: null, yearly: null };
  }

  for (const price of countryPrices) {
    if (priceMap[price.planId]) {
      priceMap[price.planId][price.billingPeriod] = price;
    }
  }

  // Serialize data for client component
  const serializedPlans = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    tier: plan.tier,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    features: plan.features,
    supportLevel: plan.supportLevel,
    countryPricing: {
      monthly: priceMap[plan.id]?.monthly?.price ?? null,
      yearly: priceMap[plan.id]?.yearly?.price ?? null,
    },
  }));

  return (
    <CountryPricingClient
      country={country}
      plans={serializedPlans}
      allCountries={allCountries}
    />
  );
}
