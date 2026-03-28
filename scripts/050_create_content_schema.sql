-- Content Management Schema (FAQs, Testimonials, Page Sections)
-- Creates tables for managing website content including testimonials, FAQs, and page sections

CREATE TABLE IF NOT EXISTS testimonials (
  id CHAR(36) PRIMARY KEY,
  author_name_en VARCHAR(191) NOT NULL,
  author_name_ar VARCHAR(191) NOT NULL,
  author_role_en VARCHAR(191) NOT NULL,
  author_role_ar VARCHAR(191) NOT NULL,
  author_avatar TEXT NULL,
  quote_en LONGTEXT NOT NULL,
  quote_ar LONGTEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  company VARCHAR(191) NULL,
  page_key VARCHAR(100) NOT NULL DEFAULT 'home',
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_testimonials_page_key (page_key),
  INDEX idx_testimonials_is_active (is_active),
  INDEX idx_testimonials_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faqs (
  id CHAR(36) PRIMARY KEY,
  question_en LONGTEXT NOT NULL,
  question_ar LONGTEXT NOT NULL,
  answer_en LONGTEXT NOT NULL,
  answer_ar LONGTEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_faqs_category (category),
  INDEX idx_faqs_is_active (is_active),
  INDEX idx_faqs_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_content (
  id CHAR(36) PRIMARY KEY,
  page_key VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  content_type ENUM('text', 'html', 'json', 'image') NOT NULL DEFAULT 'text',
  content LONGTEXT NOT NULL,
  metadata JSON NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  version INT NOT NULL DEFAULT 1,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_page_section_lang (page_key, section_key, language),
  INDEX idx_site_content_page_key (page_key),
  INDEX idx_site_content_section_key (section_key),
  INDEX idx_site_content_language (language),
  INDEX idx_site_content_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_sections (
  id CHAR(36) PRIMARY KEY,
  page_key VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  subtitle_en TEXT NULL,
  subtitle_ar TEXT NULL,
  content_en LONGTEXT NULL,
  content_ar LONGTEXT NULL,
  metadata JSON NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_page_section (page_key, section_key),
  INDEX idx_page_sections_page_key (page_key),
  INDEX idx_page_sections_is_active (is_active),
  INDEX idx_page_sections_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed sample testimonials for demonstration
INSERT INTO testimonials (id, author_name_en, author_name_ar, author_role_en, author_role_ar, quote_en, quote_ar, rating, company, page_key, display_order, is_active)
SELECT 
  UUID(),
  'Ahmed Hassan',
  'أحمد حسن',
  'CEO, Tech Solutions',
  'المدير التنفيذي، حلول التكنولوجيا',
  'Univert has transformed our business. The platform is intuitive and powerful.',
  'غيرت Univert أعمالنا. المنصة بديهية وقوية.',
  5,
  'Tech Solutions',
  'home',
  1,
  1
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE author_name_en = 'Ahmed Hassan');

INSERT INTO testimonials (id, author_name_en, author_name_ar, author_role_en, author_role_ar, quote_en, quote_ar, rating, company, page_key, display_order, is_active)
SELECT 
  UUID(),
  'Fatima Al-Rashid',
  'فاطمة الرشيد',
  'Marketing Director, Digital Agency',
  'مديرة التسويق، وكالة رقمية',
  'Excellent support team and fantastic features. Highly recommended!',
  'فريق دعم ممتاز وميزات رائعة. موصى به للغاية!',
  5,
  'Digital Agency',
  'home',
  2,
  1
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE author_name_en = 'Fatima Al-Rashid');

INSERT INTO testimonials (id, author_name_en, author_name_ar, author_role_en, author_role_ar, quote_en, quote_ar, rating, company, page_key, display_order, is_active)
SELECT 
  UUID(),
  'Mohammed Karim',
  'محمد كريم',
  'Product Manager, E-commerce',
  'مدير المنتج، التجارة الإلكترونية',
  'Best investment we made this year. ROI exceeded expectations.',
  'أفضل استثمار قمنا به هذا العام. تجاوز العائد على الاستثمار التوقعات.',
  5,
  'E-commerce Plus',
  'home',
  3,
  1
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE author_name_en = 'Mohammed Karim');
