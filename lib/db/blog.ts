import { randomUUID } from "crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import type {
  BlogPostRow,
  BlogPostWithRelations,
  BlogAuthorRow,
  BlogCategoryRow,
  BlogTagRow,
} from "./types";

type JoinedPostRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_id: string;
  category_id: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  status: "draft" | "published" | "archived";
  is_featured: number | boolean;
  featured_position: number | null;
  reading_time_minutes: number | null;
  view_count: number;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_rel_id: string | null;
  author_rel_name: string | null;
  author_rel_email: string | null;
  author_rel_bio: string | null;
  author_rel_avatar_url: string | null;
  author_rel_created_at: string | null;
  category_rel_id: string | null;
  category_rel_name: string | null;
  category_rel_slug: string | null;
  category_rel_description: string | null;
  category_rel_color: string | null;
  category_rel_created_at: string | null;
  category_rel_updated_at: string | null;
};

type TagRow = {
  post_id: string;
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

function normalizePost(row: JoinedPostRow): BlogPostWithRelations {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    author_id: row.author_id,
    category_id: row.category_id,
    featured_image_url: row.featured_image_url,
    featured_image_alt: row.featured_image_alt,
    status: row.status,
    is_featured: row.is_featured === true || row.is_featured === 1,
    featured_position: row.featured_position,
    reading_time_minutes: row.reading_time_minutes,
    view_count: row.view_count,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    og_image_url: row.og_image_url,
    canonical_url: row.canonical_url,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: row.author_rel_id
      ? {
          id: row.author_rel_id,
          name: row.author_rel_name || "",
          email: row.author_rel_email || "",
          bio: row.author_rel_bio,
          avatar_url: row.author_rel_avatar_url,
          created_at: row.author_rel_created_at || row.created_at,
        }
      : undefined,
    category: row.category_rel_id
      ? {
          id: row.category_rel_id,
          name: row.category_rel_name || "",
          slug: row.category_rel_slug || "",
          description: row.category_rel_description,
          color: row.category_rel_color || "#3B82F6",
          created_at: row.category_rel_created_at || row.created_at,
          updated_at: row.category_rel_updated_at || row.updated_at,
        }
      : undefined,
    tags: [],
  };
}

async function enrichTags(posts: BlogPostWithRelations[]): Promise<BlogPostWithRelations[]> {
  if (posts.length === 0) return posts;

  const pool = getMySQLPool();
  if (!pool) return posts;
  
  const postIds = posts.map((p) => p.id);
  const placeholders = postIds.map(() => "?").join(",");

  const [rows] = await pool.query<TagRow[]>(
    `
      SELECT pt.post_id, t.id, t.name, t.slug, t.created_at
      FROM blog_post_tags pt
      INNER JOIN blog_tags t ON t.id = pt.tag_id
      WHERE pt.post_id IN (${placeholders})
      ORDER BY t.name ASC
    `,
    postIds,
  );

  const tagsByPost = new Map<string, BlogTagRow[]>();
  for (const row of rows) {
    const arr = tagsByPost.get(row.post_id) || [];
    arr.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      created_at: row.created_at,
    });
    tagsByPost.set(row.post_id, arr);
  }

  return posts.map((post) => ({
    ...post,
    tags: tagsByPost.get(post.id) || [],
  }));
}

async function runPostsQuery(whereSql: string, params: unknown[], suffixSql: string = ""): Promise<BlogPostWithRelations[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  const [rows] = await pool.query<JoinedPostRow[]>(
    `
      SELECT
        p.*,
        a.id AS author_rel_id,
        a.name AS author_rel_name,
        a.email AS author_rel_email,
        a.bio AS author_rel_bio,
        a.avatar_url AS author_rel_avatar_url,
        a.created_at AS author_rel_created_at,
        c.id AS category_rel_id,
        c.name AS category_rel_name,
        c.slug AS category_rel_slug,
        c.description AS category_rel_description,
        c.color AS category_rel_color,
        c.created_at AS category_rel_created_at,
        c.updated_at AS category_rel_updated_at
      FROM blog_posts p
      LEFT JOIN blog_authors a ON a.id = p.author_id
      LEFT JOIN blog_categories c ON c.id = p.category_id
      ${whereSql}
      ${suffixSql}
    `,
    params,
  );

  const normalized = rows.map(normalizePost);
  return enrichTags(normalized);
}

// ========== Blog Posts ==========

export async function getPublishedPosts(limit?: number, offset?: number): Promise<BlogPostWithRelations[]> {
  const params: unknown[] = [];
  let suffix = "ORDER BY p.published_at DESC";

  if (typeof limit === "number") {
    suffix += " LIMIT ?";
    params.push(limit);

    if (typeof offset === "number") {
      suffix += " OFFSET ?";
      params.push(offset);
    }
  }

  try {
    return await runPostsQuery("WHERE p.status = 'published'", params, suffix);
  } catch (error) {
    console.error("[db] Error fetching published posts:", error);
    return [];
  }
}

export async function getFeaturedPosts(limit: number = 3): Promise<BlogPostWithRelations[]> {
  try {
    return await runPostsQuery(
      "WHERE p.status = 'published' AND p.is_featured = 1",
      [limit],
      "ORDER BY p.featured_position ASC, p.published_at DESC LIMIT ?",
    );
  } catch (error) {
    console.error("[db] Error fetching featured posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPostWithRelations | null> {
  try {
    const posts = await runPostsQuery(
      "WHERE p.slug = ? AND p.status = 'published'",
      [slug],
      "LIMIT 1",
    );
    return posts[0] || null;
  } catch (error) {
    console.error("[db] Error fetching post:", error);
    return null;
  }
}

export async function getPostsByCategory(categorySlug: string, limit?: number): Promise<BlogPostWithRelations[]> {
  const params: unknown[] = [categorySlug];
  let suffix = "ORDER BY p.published_at DESC";

  if (typeof limit === "number") {
    suffix += " LIMIT ?";
    params.push(limit);
  }

  try {
    return await runPostsQuery(
      "WHERE p.status = 'published' AND c.slug = ?",
      params,
      suffix,
    );
  } catch (error) {
    console.error("[db] Error fetching posts by category:", error);
    return [];
  }
}

export async function getPostsByTag(tagSlug: string, limit?: number): Promise<BlogPostWithRelations[]> {
  const params: unknown[] = [tagSlug];
  let suffix = "ORDER BY p.published_at DESC";

  if (typeof limit === "number") {
    suffix += " LIMIT ?";
    params.push(limit);
  }

  try {
    return await runPostsQuery(
      `
      WHERE p.status = 'published'
        AND EXISTS (
          SELECT 1
          FROM blog_post_tags pt
          INNER JOIN blog_tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id
            AND t.slug = ?
        )
      `,
      params,
      suffix,
    );
  } catch (error) {
    console.error("[db] Error fetching posts by tag:", error);
    return [];
  }
}

export async function getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPostWithRelations[]> {
  try {
    return await runPostsQuery(
      "WHERE p.status = 'published' AND p.id <> ?",
      [postId, limit],
      "ORDER BY p.published_at DESC LIMIT ?",
    );
  } catch (error) {
    console.error("[db] Error fetching related posts:", error);
    return [];
  }
}

// ========== Authors ==========

export async function getBlogAuthors(): Promise<BlogAuthorRow[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  try {
    const [rows] = await pool.query<BlogAuthorRow[]>(
      "SELECT id, name, email, bio, avatar_url, created_at FROM blog_authors ORDER BY name ASC",
    );
    return rows;
  } catch (error) {
    console.error("[db] Error fetching authors:", error);
    return [];
  }
}

export async function getBlogAuthor(id: string): Promise<BlogAuthorRow | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  try {
    const [rows] = await pool.query<BlogAuthorRow[]>(
      "SELECT id, name, email, bio, avatar_url, created_at FROM blog_authors WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("[db] Error fetching author:", error);
    return null;
  }
}

// ========== Categories ==========

export async function getBlogCategories(): Promise<BlogCategoryRow[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  try {
    const [rows] = await pool.query<BlogCategoryRow[]>(
      "SELECT id, name, slug, description, color, created_at, updated_at FROM blog_categories ORDER BY name ASC",
    );
    return rows;
  } catch (error) {
    console.error("[db] Error fetching categories:", error);
    return [];
  }
}

export async function getBlogCategory(slug: string): Promise<BlogCategoryRow | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  try {
    const [rows] = await pool.query<BlogCategoryRow[]>(
      "SELECT id, name, slug, description, color, created_at, updated_at FROM blog_categories WHERE slug = ? LIMIT 1",
      [slug],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("[db] Error fetching category:", error);
    return null;
  }
}

// ========== Tags ==========

export async function getBlogTags(): Promise<BlogTagRow[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  try {
    const [rows] = await pool.query<BlogTagRow[]>(
      "SELECT id, name, slug, created_at FROM blog_tags ORDER BY name ASC",
    );
    return rows;
  } catch (error) {
    console.error("[db] Error fetching tags:", error);
    return [];
  }
}

export async function getBlogTag(slug: string): Promise<BlogTagRow | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  try {
    const [rows] = await pool.query<BlogTagRow[]>(
      "SELECT id, name, slug, created_at FROM blog_tags WHERE slug = ? LIMIT 1",
      [slug],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("[db] Error fetching tag:", error);
    return null;
  }
}

// ========== Admin Operations ==========

export async function createBlogPost(post: Partial<BlogPostRow>): Promise<BlogPostRow | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const id = post.id || randomUUID();
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    await pool.execute(
      `
        INSERT INTO blog_posts (
          id, title, slug, content, excerpt, author_id, category_id,
          featured_image_url, featured_image_alt, status, is_featured,
          featured_position, reading_time_minutes, view_count,
          seo_title, seo_description, og_image_url, canonical_url,
          published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        post.title || "",
        post.slug || "",
        post.content || "",
        post.excerpt || null,
        post.author_id || null,
        post.category_id || null,
        post.featured_image_url || null,
        post.featured_image_alt || null,
        post.status || "draft",
        post.is_featured ? 1 : 0,
        post.featured_position || null,
        post.reading_time_minutes || null,
        post.view_count || 0,
        post.seo_title || null,
        post.seo_description || null,
        post.og_image_url || null,
        post.canonical_url || null,
        post.published_at || null,
        post.created_at || now,
        post.updated_at || now,
      ],
    );

    const [rows] = await pool.query<BlogPostRow[]>(
      "SELECT * FROM blog_posts WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("[db] Error creating post:", error);
    return null;
  }
}

export async function updateBlogPost(id: string, updates: Partial<BlogPostRow>): Promise<BlogPostRow | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const entries = Object.entries(updates).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return null;

  const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
  const values = entries.map(([, value]) => (typeof value === "boolean" ? (value ? 1 : 0) : value));

  try {
    await pool.execute(
      `UPDATE blog_posts SET ${setSql} WHERE id = ?`,
      [...values, id],
    );

    const [rows] = await pool.query<BlogPostRow[]>(
      "SELECT * FROM blog_posts WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("[db] Error updating post:", error);
    return null;
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  try {
    await pool.execute("DELETE FROM blog_posts WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("[db] Error deleting post:", error);
    return false;
  }
}

export async function trackPostView(
  postId: string,
  viewerIp?: string,
  viewerCountry?: string,
  referrer?: string,
): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  try {
    await pool.execute(
      `
        INSERT INTO blog_post_views (
          id, post_id, viewer_ip, viewer_country, referrer, viewed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [randomUUID(), postId, viewerIp || null, viewerCountry || null, referrer || null],
    );

    await pool.execute(
      "UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?",
      [postId],
    );

    return true;
  } catch (error) {
    console.error("[db] Error tracking view:", error);
    return false;
  }
}
