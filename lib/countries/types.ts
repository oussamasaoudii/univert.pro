export type TextDirection = 'ltr' | 'rtl';
export type BillingPeriod = 'monthly' | 'yearly';

export interface Country {
  id: number;
  isoCode: string;
  slug: string;
  name: string;
  nameNative: string | null;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  textDirection: TextDirection;
  flagEmoji: string | null;
  isDefault: boolean;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CountryPlanPrice {
  id: number;
  countryId: number;
  planId: string;
  billingPeriod: BillingPeriod;
  price: number;
  comparePrice: number | null;
  stripePriceId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CountrySeo {
  id: number;
  countryId: number;
  pageKey: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CountryPricing {
  country: Country;
  prices: Record<string, { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }>;
}

export interface CountryWithPricing extends Country {
  pricing: CountryPricing['prices'];
}

// Database row types (snake_case)
export type CountryRow = {
  id: number;
  iso_code: string;
  slug: string;
  name: string;
  name_native: string | null;
  currency_code: string;
  currency_symbol: string;
  locale: string;
  text_direction: 'ltr' | 'rtl';
  flag_emoji: string | null;
  is_default: number | boolean;
  is_active: number | boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type CountryPlanPriceRow = {
  id: number;
  country_id: number;
  plan_id: string;
  billing_period: 'monthly' | 'yearly';
  price: string | number;
  compare_price: string | number | null;
  stripe_price_id: string | null;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
};

export type CountrySeoRow = {
  id: number;
  country_id: number;
  page_key: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
};
