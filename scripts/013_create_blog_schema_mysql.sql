-- MySQL/MariaDB Blog Schema

CREATE TABLE IF NOT EXISTS blog_authors (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  bio TEXT NULL,
  avatar_url TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_categories (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE,
  slug VARCHAR(191) NOT NULL UNIQUE,
  description TEXT NULL,
  color VARCHAR(32) NOT NULL DEFAULT '#3B82F6',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_tags (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE,
  slug VARCHAR(191) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  excerpt TEXT NULL,
  author_id CHAR(36) NOT NULL,
  category_id CHAR(36) NULL,
  featured_image_url TEXT NULL,
  featured_image_alt VARCHAR(255) NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  featured_position INT NULL,
  reading_time_minutes INT NULL,
  view_count INT NOT NULL DEFAULT 0,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  og_image_url TEXT NULL,
  canonical_url TEXT NULL,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_blog_posts_author FOREIGN KEY (author_id) REFERENCES blog_authors(id) ON DELETE CASCADE,
  CONSTRAINT fk_blog_posts_category FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id CHAR(36) NOT NULL,
  tag_id CHAR(36) NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  CONSTRAINT fk_blog_post_tags_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_blog_post_tags_tag FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_post_views (
  id CHAR(36) PRIMARY KEY,
  post_id CHAR(36) NOT NULL,
  viewer_ip VARCHAR(64) NULL,
  viewer_country VARCHAR(64) NULL,
  referrer TEXT NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_blog_post_views_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_is_featured ON blog_posts(is_featured);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX idx_blog_post_views_post_id ON blog_post_views(post_id);

-- Seed baseline content (safe idempotent inserts)
INSERT INTO blog_authors (id, name, email, bio, created_at)
SELECT UUID(), 'Ovmon Team', 'blog@univoo.co', 'Official Ovmon editorial team.', NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_authors WHERE email = 'blog@univoo.co');

INSERT INTO blog_categories (id, name, slug, description, color, created_at, updated_at)
SELECT UUID(), 'Platform', 'platform', 'Updates and guides for the Ovmon platform.', '#3B82F6', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'platform');

INSERT INTO blog_tags (id, name, slug, created_at)
SELECT UUID(), 'Getting Started', 'getting-started', NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_tags WHERE slug = 'getting-started');

INSERT INTO blog_posts (
  id, title, slug, content, excerpt,
  author_id, category_id,
  status, is_featured, featured_position,
  reading_time_minutes, view_count,
  seo_title, seo_description,
  published_at, created_at, updated_at
)
SELECT
  UUID(),
  'Welcome to Ovmon',
  'welcome-to-ovmon',
  '<p>Welcome to Ovmon. This article is served from your MySQL database on aaPanel.</p><p>You can now manage blog content without Supabase for this module.</p>',
  'Welcome to Ovmon. This article is served from your MySQL database on aaPanel.',
  a.id,
  c.id,
  'published',
  1,
  1,
  2,
  0,
  'Welcome to Ovmon',
  'Getting started with Ovmon and MySQL-backed blog.',
  NOW(),
  NOW(),
  NOW()
FROM blog_authors a
JOIN blog_categories c ON c.slug = 'platform'
WHERE a.email = 'blog@univoo.co'
  AND NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'welcome-to-ovmon');

INSERT INTO blog_post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM blog_posts p
JOIN blog_tags t ON t.slug = 'getting-started'
WHERE p.slug = 'welcome-to-ovmon'
  AND NOT EXISTS (
    SELECT 1 FROM blog_post_tags x WHERE x.post_id = p.id AND x.tag_id = t.id
  );
