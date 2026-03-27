import { getMySQLPool } from "@/lib/mysql/pool";
import type {
  Country,
  CountryRow,
  CountryPlanPrice,
  CountryPlanPriceRow,
  CountrySeo,
  CountrySeoRow,
  BillingPeriod,
} from "./types";

// ============================================
// Row Normalizers
// ============================================

function normalizeCountry(row: CountryRow): Country {
  return {
    id: row.id,
    isoCode: row.iso_code,
    slug: row.slug,
    name: row.name,
    nameNative: row.name_native,
    currencyCode: row.currency_code,
    currencySymbol: row.currency_symbol,
    locale: row.locale,
    textDirection: row.text_direction,
    flagEmoji: row.flag_emoji,
    isDefault: row.is_default === 1 || row.is_default === true,
    isActive: row.is_active === 1 || row.is_active === true,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeCountryPlanPrice(row: CountryPlanPriceRow): CountryPlanPrice {
  return {
    id: row.id,
    countryId: row.country_id,
    planId: row.plan_id,
    billingPeriod: row.billing_period,
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : null,
    stripePriceId: row.stripe_price_id,
    isActive: row.is_active === 1 || row.is_active === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeCountrySeo(row: CountrySeoRow): CountrySeo {
  return {
    id: row.id,
    countryId: row.country_id,
    pageKey: row.page_key,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    canonicalUrl: row.canonical_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// Country Operations
// ============================================

export async function listCountries(options?: {
  includeInactive?: boolean;
}): Promise<Country[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  const includeInactive = options?.includeInactive === true;

  const [rows] = await pool.query<CountryRow[]>(
    `
      SELECT * FROM countries
      ${includeInactive ? "" : "WHERE is_active = 1"}
      ORDER BY position ASC, name ASC
    `
  );

  return rows.map(normalizeCountry);
}

export async function getCountryBySlug(slug: string): Promise<Country | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<CountryRow[]>(
    `SELECT * FROM countries WHERE slug = ? LIMIT 1`,
    [slug]
  );

  return rows[0] ? normalizeCountry(rows[0]) : null;
}

export async function getCountryByIsoCode(isoCode: string): Promise<Country | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<CountryRow[]>(
    `SELECT * FROM countries WHERE iso_code = ? LIMIT 1`,
    [isoCode.toUpperCase()]
  );

  return rows[0] ? normalizeCountry(rows[0]) : null;
}

export async function getCountryById(id: number): Promise<Country | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<CountryRow[]>(
    `SELECT * FROM countries WHERE id = ? LIMIT 1`,
    [id]
  );

  return rows[0] ? normalizeCountry(rows[0]) : null;
}

export async function getDefaultCountry(): Promise<Country | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<CountryRow[]>(
    `SELECT * FROM countries WHERE is_default = 1 AND is_active = 1 LIMIT 1`
  );

  if (rows[0]) {
    return normalizeCountry(rows[0]);
  }

  // Fallback to first active country
  const [fallback] = await pool.query<CountryRow[]>(
    `SELECT * FROM countries WHERE is_active = 1 ORDER BY position ASC LIMIT 1`
  );

  return fallback[0] ? normalizeCountry(fallback[0]) : null;
}

export async function createCountry(input: {
  isoCode: string;
  slug: string;
  name: string;
  nameNative?: string | null;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  textDirection?: 'ltr' | 'rtl';
  flagEmoji?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  position?: number;
}): Promise<Country | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [result] = await pool.query(
    `
      INSERT INTO countries (
        iso_code, slug, name, name_native, currency_code, currency_symbol,
        locale, text_direction, flag_emoji, is_default, is_active, position
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.isoCode.toUpperCase(),
      input.slug.toLowerCase(),
      input.name,
      input.nameNative || null,
      input.currencyCode.toUpperCase(),
      input.currencySymbol,
      input.locale,
      input.textDirection || 'ltr',
      input.flagEmoji || null,
      input.isDefault ? 1 : 0,
      input.isActive !== false ? 1 : 0,
      input.position || 0,
    ]
  );

  const insertId = (result as { insertId: number }).insertId;
  return getCountryById(insertId);
}

export async function updateCountry(
  id: number,
  input: Partial<{
    isoCode: string;
    slug: string;
    name: string;
    nameNative: string | null;
    currencyCode: string;
    currencySymbol: string;
    locale: string;
    textDirection: 'ltr' | 'rtl';
    flagEmoji: string | null;
    isDefault: boolean;
    isActive: boolean;
    position: number;
  }>
): Promise<Country | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.isoCode !== undefined) {
    fields.push("iso_code = ?");
    values.push(input.isoCode.toUpperCase());
  }
  if (input.slug !== undefined) {
    fields.push("slug = ?");
    values.push(input.slug.toLowerCase());
  }
  if (input.name !== undefined) {
    fields.push("name = ?");
    values.push(input.name);
  }
  if (input.nameNative !== undefined) {
    fields.push("name_native = ?");
    values.push(input.nameNative);
  }
  if (input.currencyCode !== undefined) {
    fields.push("currency_code = ?");
    values.push(input.currencyCode.toUpperCase());
  }
  if (input.currencySymbol !== undefined) {
    fields.push("currency_symbol = ?");
    values.push(input.currencySymbol);
  }
  if (input.locale !== undefined) {
    fields.push("locale = ?");
    values.push(input.locale);
  }
  if (input.textDirection !== undefined) {
    fields.push("text_direction = ?");
    values.push(input.textDirection);
  }
  if (input.flagEmoji !== undefined) {
    fields.push("flag_emoji = ?");
    values.push(input.flagEmoji);
  }
  if (input.isDefault !== undefined) {
    fields.push("is_default = ?");
    values.push(input.isDefault ? 1 : 0);
    
    // If setting as default, unset other defaults
    if (input.isDefault) {
      await pool.query(`UPDATE countries SET is_default = 0 WHERE id != ?`, [id]);
    }
  }
  if (input.isActive !== undefined) {
    fields.push("is_active = ?");
    values.push(input.isActive ? 1 : 0);
  }
  if (input.position !== undefined) {
    fields.push("position = ?");
    values.push(input.position);
  }

  if (fields.length === 0) {
    return getCountryById(id);
  }

  values.push(id);
  await pool.query(
    `UPDATE countries SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getCountryById(id);
}

export async function deleteCountry(id: number): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  const [result] = await pool.query(
    `DELETE FROM countries WHERE id = ?`,
    [id]
  );

  return (result as { affectedRows: number }).affectedRows > 0;
}

// ============================================
// Country Plan Price Operations
// ============================================

export async function getCountryPlanPrices(
  countryId: number,
  options?: { includeInactive?: boolean }
): Promise<CountryPlanPrice[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  const includeInactive = options?.includeInactive === true;

  const [rows] = await pool.query<CountryPlanPriceRow[]>(
    `
      SELECT * FROM country_plan_prices
      WHERE country_id = ?
      ${includeInactive ? "" : "AND is_active = 1"}
      ORDER BY plan_id ASC, billing_period ASC
    `,
    [countryId]
  );

  return rows.map(normalizeCountryPlanPrice);
}

export async function getCountryPlanPrice(
  countryId: number,
  planId: string,
  billingPeriod: BillingPeriod
): Promise<CountryPlanPrice | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<CountryPlanPriceRow[]>(
    `
      SELECT * FROM country_plan_prices
      WHERE country_id = ? AND plan_id = ? AND billing_period = ?
      LIMIT 1
    `,
    [countryId, planId, billingPeriod]
  );

  return rows[0] ? normalizeCountryPlanPrice(rows[0]) : null;
}

export async function upsertCountryPlanPrice(input: {
  countryId: number;
  planId: string;
  billingPeriod: BillingPeriod;
  price: number;
  comparePrice?: number | null;
  stripePriceId?: string | null;
  isActive?: boolean;
}): Promise<CountryPlanPrice | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  await pool.query(
    `
      INSERT INTO country_plan_prices (
        country_id, plan_id, billing_period, price, compare_price, stripe_price_id, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        price = VALUES(price),
        compare_price = VALUES(compare_price),
        stripe_price_id = VALUES(stripe_price_id),
        is_active = VALUES(is_active)
    `,
    [
      input.countryId,
      input.planId,
      input.billingPeriod,
      input.price,
      input.comparePrice ?? null,
      input.stripePriceId ?? null,
      input.isActive !== false ? 1 : 0,
    ]
  );

  return getCountryPlanPrice(input.countryId, input.planId, input.billingPeriod);
}

export async function deleteCountryPlanPrice(
  countryId: number,
  planId: string,
  billingPeriod: BillingPeriod
): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  const [result] = await pool.query(
    `DELETE FROM country_plan_prices WHERE country_id = ? AND plan_id = ? AND billing_period = ?`,
    [countryId, planId, billingPeriod]
  );

  return (result as { affectedRows: number }).affectedRows > 0;
}

// ============================================
// Country SEO Operations
// ============================================

export async function getCountrySeo(
  countryId: number,
  pageKey: string
): Promise<CountrySeo | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<CountrySeoRow[]>(
    `SELECT * FROM country_seo WHERE country_id = ? AND page_key = ? LIMIT 1`,
    [countryId, pageKey]
  );

  return rows[0] ? normalizeCountrySeo(rows[0]) : null;
}

export async function upsertCountrySeo(input: {
  countryId: number;
  pageKey: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
}): Promise<CountrySeo | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  await pool.query(
    `
      INSERT INTO country_seo (
        country_id, page_key, meta_title, meta_description, og_title, og_description, canonical_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        meta_title = VALUES(meta_title),
        meta_description = VALUES(meta_description),
        og_title = VALUES(og_title),
        og_description = VALUES(og_description),
        canonical_url = VALUES(canonical_url)
    `,
    [
      input.countryId,
      input.pageKey,
      input.metaTitle ?? null,
      input.metaDescription ?? null,
      input.ogTitle ?? null,
      input.ogDescription ?? null,
      input.canonicalUrl ?? null,
    ]
  );

  return getCountrySeo(input.countryId, input.pageKey);
}

// ============================================
// Aggregation Helpers
// ============================================

export async function getCountryWithPricing(slug: string): Promise<{
  country: Country;
  prices: Record<string, { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }>;
} | null> {
  const country = await getCountryBySlug(slug);
  if (!country) return null;

  const priceRows = await getCountryPlanPrices(country.id);
  
  const prices: Record<string, { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }> = {};
  
  for (const price of priceRows) {
    if (!prices[price.planId]) {
      prices[price.planId] = { monthly: null, yearly: null };
    }
    prices[price.planId][price.billingPeriod] = price;
  }

  return { country, prices };
}

export async function getAllCountriesWithPricing(): Promise<Array<{
  country: Country;
  prices: Record<string, { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }>;
}>> {
  const countries = await listCountries();
  const result = [];

  for (const country of countries) {
    const priceRows = await getCountryPlanPrices(country.id);
    
    const prices: Record<string, { monthly: CountryPlanPrice | null; yearly: CountryPlanPrice | null }> = {};
    
    for (const price of priceRows) {
      if (!prices[price.planId]) {
        prices[price.planId] = { monthly: null, yearly: null };
      }
      prices[price.planId][price.billingPeriod] = price;
    }

    result.push({ country, prices });
  }

  return result;
}

export function isValidCountrySlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length <= 32;
}
