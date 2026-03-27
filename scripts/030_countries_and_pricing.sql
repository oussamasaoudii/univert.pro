-- Multi-Country Pricing Schema for MySQL/TiDB
-- Run this migration to add country-specific pricing support

-- ============================================
-- Countries Table
-- ============================================
CREATE TABLE IF NOT EXISTS countries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  iso_code CHAR(2) NOT NULL COMMENT 'ISO 3166-1 alpha-2 code (MA, US, FR)',
  slug VARCHAR(32) NOT NULL COMMENT 'URL-friendly identifier (morocco, usa, france)',
  name VARCHAR(120) NOT NULL COMMENT 'Display name in English',
  name_native VARCHAR(120) NULL COMMENT 'Name in native language',
  currency_code CHAR(3) NOT NULL COMMENT 'ISO 4217 currency code (MAD, USD, EUR)',
  currency_symbol VARCHAR(8) NOT NULL DEFAULT '$' COMMENT 'Currency symbol for display',
  locale VARCHAR(16) NOT NULL DEFAULT 'en-US' COMMENT 'Locale code for formatting',
  text_direction ENUM('ltr', 'rtl') NOT NULL DEFAULT 'ltr' COMMENT 'Text direction for RTL languages',
  flag_emoji VARCHAR(8) NULL COMMENT 'Country flag emoji',
  is_default TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Default country for undetected visitors',
  is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether country is enabled',
  position INT NOT NULL DEFAULT 0 COMMENT 'Sort order in country selector',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_countries_iso_code (iso_code),
  UNIQUE KEY uk_countries_slug (slug),
  INDEX idx_countries_active (is_active),
  INDEX idx_countries_default (is_default),
  INDEX idx_countries_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Country Plan Prices Table
-- ============================================
CREATE TABLE IF NOT EXISTS country_plan_prices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  country_id BIGINT UNSIGNED NOT NULL,
  plan_id CHAR(36) NOT NULL COMMENT 'References billing_plans.id',
  billing_period ENUM('monthly', 'yearly') NOT NULL,
  price DECIMAL(12, 2) NOT NULL COMMENT 'Price in local currency',
  compare_price DECIMAL(12, 2) NULL COMMENT 'Original price for strikethrough display',
  stripe_price_id VARCHAR(255) NULL COMMENT 'Stripe Price ID for this country/plan/period',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_country_plan_price (country_id, plan_id, billing_period),
  INDEX idx_cpp_country (country_id),
  INDEX idx_cpp_plan (plan_id),
  INDEX idx_cpp_active (is_active),
  
  CONSTRAINT fk_cpp_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
  CONSTRAINT fk_cpp_plan FOREIGN KEY (plan_id) REFERENCES billing_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Country SEO Metadata Table (for localized SEO)
-- ============================================
CREATE TABLE IF NOT EXISTS country_seo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  country_id BIGINT UNSIGNED NOT NULL,
  page_key VARCHAR(64) NOT NULL COMMENT 'Page identifier (pricing, home, features)',
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  og_title VARCHAR(255) NULL,
  og_description TEXT NULL,
  canonical_url VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_country_seo_page (country_id, page_key),
  INDEX idx_country_seo_country (country_id),
  
  CONSTRAINT fk_country_seo_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Seed Default Countries
-- ============================================
INSERT INTO countries (iso_code, slug, name, name_native, currency_code, currency_symbol, locale, text_direction, flag_emoji, is_default, is_active, position)
VALUES
  ('US', 'usa', 'United States', 'United States', 'USD', '$', 'en-US', 'ltr', '🇺🇸', 1, 1, 1),
  ('MA', 'morocco', 'Morocco', 'المغرب', 'MAD', 'DH', 'ar-MA', 'rtl', '🇲🇦', 0, 1, 2),
  ('FR', 'france', 'France', 'France', 'EUR', '€', 'fr-FR', 'ltr', '🇫🇷', 0, 1, 3),
  ('GB', 'uk', 'United Kingdom', 'United Kingdom', 'GBP', '£', 'en-GB', 'ltr', '🇬🇧', 0, 1, 4),
  ('SA', 'saudi-arabia', 'Saudi Arabia', 'السعودية', 'SAR', 'ر.س', 'ar-SA', 'rtl', '🇸🇦', 0, 1, 5),
  ('AE', 'uae', 'United Arab Emirates', 'الإمارات', 'AED', 'د.إ', 'ar-AE', 'rtl', '🇦🇪', 0, 1, 6),
  ('DE', 'germany', 'Germany', 'Deutschland', 'EUR', '€', 'de-DE', 'ltr', '🇩🇪', 0, 1, 7),
  ('ES', 'spain', 'Spain', 'España', 'EUR', '€', 'es-ES', 'ltr', '🇪🇸', 0, 1, 8)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  name_native = VALUES(name_native),
  currency_code = VALUES(currency_code),
  currency_symbol = VALUES(currency_symbol),
  locale = VALUES(locale),
  text_direction = VALUES(text_direction),
  flag_emoji = VALUES(flag_emoji);

-- Note: Country plan prices should be seeded separately via admin interface
-- or by running the seed script after plans are created
