import type { Country, CountryPlanPrice, BillingPeriod } from "./types";

/**
 * Format a price amount for a specific country
 */
export function formatCountryPrice(
  amount: number,
  country: Country,
  options?: {
    showSymbol?: boolean;
    showCurrencyCode?: boolean;
  }
): string {
  const showSymbol = options?.showSymbol !== false;
  const showCurrencyCode = options?.showCurrencyCode === true;

  try {
    const formatter = new Intl.NumberFormat(country.locale, {
      style: showSymbol ? "currency" : "decimal",
      currency: showSymbol ? country.currencyCode : undefined,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    let formatted = formatter.format(amount);
    
    if (showCurrencyCode && !formatted.includes(country.currencyCode)) {
      formatted = `${formatted} ${country.currencyCode}`;
    }
    
    return formatted;
  } catch {
    // Fallback for unsupported locales
    const formatted = amount.toFixed(2);
    if (showSymbol) {
      return showCurrencyCode
        ? `${country.currencySymbol}${formatted} ${country.currencyCode}`
        : `${country.currencySymbol}${formatted}`;
    }
    return formatted;
  }
}

/**
 * Get the yearly discount percentage compared to monthly pricing
 */
export function getYearlyDiscountPercent(
  monthlyPrice: number,
  yearlyPrice: number
): number {
  if (monthlyPrice <= 0 || yearlyPrice <= 0) return 0;
  const yearlyEquivalent = monthlyPrice * 12;
  const savings = yearlyEquivalent - yearlyPrice;
  return Math.round((savings / yearlyEquivalent) * 100);
}

/**
 * Get monthly equivalent price from yearly price
 */
export function getMonthlyEquivalent(yearlyPrice: number): number {
  return Math.round((yearlyPrice / 12) * 100) / 100;
}

/**
 * Get the Stripe price ID for a country/plan/period combination
 */
export function getStripePriceId(
  prices: Record<string, { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }>,
  planId: string,
  billingPeriod: BillingPeriod
): string | null {
  const planPrices = prices[planId];
  if (!planPrices) return null;
  
  const price = planPrices[billingPeriod];
  return price?.stripePriceId ?? null;
}

/**
 * Get the price amount for a country/plan/period combination
 */
export function getPriceAmount(
  prices: Record<string, { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }>,
  planId: string,
  billingPeriod: BillingPeriod
): number | null {
  const planPrices = prices[planId];
  if (!planPrices) return null;
  
  const price = planPrices[billingPeriod];
  return price?.price ?? null;
}

/**
 * Get compare (original) price for strikethrough display
 */
export function getComparePrice(
  prices: Record<string, { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }>,
  planId: string,
  billingPeriod: BillingPeriod
): number | null {
  const planPrices = prices[planId];
  if (!planPrices) return null;
  
  const price = planPrices[billingPeriod];
  return price?.comparePrice ?? null;
}

/**
 * Check if a country has RTL text direction
 */
export function isRtlCountry(country: Country): boolean {
  return country.textDirection === "rtl";
}

/**
 * Get the HTML dir attribute value for a country
 */
export function getCountryDir(country: Country | null): "ltr" | "rtl" {
  return country?.textDirection ?? "ltr";
}

/**
 * Get the HTML lang attribute value for a country
 */
export function getCountryLang(country: Country | null): string {
  if (!country?.locale) return "en";
  return country.locale.split("-")[0];
}

/**
 * Validate a country slug format
 */
export function isValidCountrySlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 2 && slug.length <= 32;
}

/**
 * Normalize a country slug (lowercase, remove invalid chars)
 */
export function normalizeCountrySlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

/**
 * Build a country-specific URL path
 */
export function buildCountryPath(
  country: Country | string,
  path: string
): string {
  const slug = typeof country === "string" ? country : country.slug;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${slug}${normalizedPath}`;
}

/**
 * Extract country slug from a URL path
 */
export function extractCountrySlugFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  
  const potentialSlug = segments[0];
  return isValidCountrySlug(potentialSlug) ? potentialSlug : null;
}

/**
 * Get the canonical URL for a country-specific page
 */
export function getCanonicalUrl(
  baseUrl: string,
  country: Country,
  path: string
): string {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const countryPath = buildCountryPath(country, path);
  return `${normalizedBase}${countryPath}`;
}

/**
 * Get hreflang alternates for SEO
 */
export function getHrefLangAlternates(
  baseUrl: string,
  countries: Country[],
  path: string
): Array<{ hrefLang: string; href: string }> {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  
  return countries
    .filter((c) => c.isActive)
    .map((country) => ({
      hrefLang: country.locale.toLowerCase(),
      href: `${normalizedBase}${buildCountryPath(country, path)}`,
    }));
}

/**
 * Sort countries by position, then by name
 */
export function sortCountries(countries: Country[]): Country[] {
  return [...countries].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filter active countries only
 */
export function getActiveCountries(countries: Country[]): Country[] {
  return countries.filter((c) => c.isActive);
}

/**
 * Find default country from list
 */
export function findDefaultCountry(countries: Country[]): Country | null {
  return countries.find((c) => c.isDefault && c.isActive) || 
         countries.find((c) => c.isActive) || 
         null;
}
