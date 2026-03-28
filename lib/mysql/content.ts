import { getMySQLPool } from "./pool";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ============================================================================
// TYPES
// ============================================================================

export interface SiteContent {
  id: string;
  page_key: string;
  section_key: string;
  language: string;
  content_type: "text" | "html" | "json" | "image";
  content: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  version: number;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

export interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Testimonial {
  id: string;
  author_name_en: string;
  author_name_ar: string;
  author_role_en: string;
  author_role_ar: string;
  author_avatar?: string;
  quote_en: string;
  quote_ar: string;
  rating: number;
  company?: string;
  display_order: number;
  is_active: boolean;
  page_key: string;
  created_at: Date;
  updated_at: Date;
}

export interface PageSection {
  id: string;
  page_key: string;
  section_key: string;
  title_en: string;
  title_ar: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  content_en?: string;
  content_ar?: string;
  metadata?: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// SITE CONTENT CRUD
// ============================================================================

export async function getSiteContent(
  pageKey: string,
  sectionKey?: string,
  language?: string
): Promise<SiteContent[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  let query = `SELECT * FROM site_content WHERE page_key = ? AND is_active = TRUE`;
  const params: string[] = [pageKey];

  if (sectionKey) {
    query += ` AND section_key = ?`;
    params.push(sectionKey);
  }

  if (language) {
    query += ` AND language = ?`;
    params.push(language);
  }

  query += ` ORDER BY section_key, language`;

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows.map(parseContentRow);
}

export async function getAllSiteContent(): Promise<SiteContent[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM site_content ORDER BY page_key, section_key, language`
  );
  return rows.map(parseContentRow);
}

export async function upsertSiteContent(
  data: Omit<SiteContent, "id" | "created_at" | "updated_at" | "version">
): Promise<SiteContent | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const id = crypto.randomUUID();
  
  // Check if exists
  const [existing] = await pool.query<RowDataPacket[]>(
    `SELECT id, version FROM site_content WHERE page_key = ? AND section_key = ? AND language = ?`,
    [data.page_key, data.section_key, data.language]
  );

  if (existing.length > 0) {
    // Update existing
    const newVersion = (existing[0].version || 0) + 1;
    await pool.query(
      `UPDATE site_content SET 
        content_type = ?, content = ?, metadata = ?, is_active = ?, 
        version = ?, updated_at = NOW(), updated_by = ?
       WHERE id = ?`,
      [
        data.content_type,
        data.content,
        JSON.stringify(data.metadata || {}),
        data.is_active,
        newVersion,
        data.updated_by || null,
        existing[0].id,
      ]
    );
    return getSiteContentById(existing[0].id);
  } else {
    // Insert new
    await pool.query(
      `INSERT INTO site_content (id, page_key, section_key, language, content_type, content, metadata, is_active, version, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        data.page_key,
        data.section_key,
        data.language,
        data.content_type,
        data.content,
        JSON.stringify(data.metadata || {}),
        data.is_active,
        data.created_by || null,
        data.updated_by || null,
      ]
    );
    return getSiteContentById(id);
  }
}

export async function getSiteContentById(id: string): Promise<SiteContent | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM site_content WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? parseContentRow(rows[0]) : null;
}

export async function deleteSiteContent(id: string): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM site_content WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

function parseContentRow(row: RowDataPacket): SiteContent {
  return {
    id: row.id,
    page_key: row.page_key,
    section_key: row.section_key,
    language: row.language,
    content_type: row.content_type,
    content: row.content,
    metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata,
    is_active: Boolean(row.is_active),
    version: row.version,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
    updated_by: row.updated_by,
  };
}

// ============================================================================
// FAQ CRUD
// ============================================================================

export async function getAllFAQs(includeInactive = false): Promise<FAQ[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  const query = includeInactive
    ? `SELECT * FROM faqs ORDER BY category, display_order`
    : `SELECT * FROM faqs WHERE is_active = TRUE ORDER BY category, display_order`;

  const [rows] = await pool.query<RowDataPacket[]>(query);
  return rows.map(parseFAQRow);
}

export async function getFAQsByCategory(category: string): Promise<FAQ[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM faqs WHERE category = ? AND is_active = TRUE ORDER BY display_order`,
    [category]
  );
  return rows.map(parseFAQRow);
}

export async function getFAQById(id: string): Promise<FAQ | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM faqs WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? parseFAQRow(rows[0]) : null;
}

export async function createFAQ(
  data: Omit<FAQ, "id" | "created_at" | "updated_at">
): Promise<FAQ | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const id = crypto.randomUUID();

  await pool.query(
    `INSERT INTO faqs (id, question_en, question_ar, answer_en, answer_ar, category, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.question_en,
      data.question_ar,
      data.answer_en,
      data.answer_ar,
      data.category,
      data.display_order,
      data.is_active,
    ]
  );

  return getFAQById(id);
}

export async function updateFAQ(
  id: string,
  data: Partial<Omit<FAQ, "id" | "created_at" | "updated_at">>
): Promise<FAQ | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.question_en !== undefined) {
    fields.push("question_en = ?");
    values.push(data.question_en);
  }
  if (data.question_ar !== undefined) {
    fields.push("question_ar = ?");
    values.push(data.question_ar);
  }
  if (data.answer_en !== undefined) {
    fields.push("answer_en = ?");
    values.push(data.answer_en);
  }
  if (data.answer_ar !== undefined) {
    fields.push("answer_ar = ?");
    values.push(data.answer_ar);
  }
  if (data.category !== undefined) {
    fields.push("category = ?");
    values.push(data.category);
  }
  if (data.display_order !== undefined) {
    fields.push("display_order = ?");
    values.push(data.display_order);
  }
  if (data.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(data.is_active);
  }

  if (fields.length === 0) return getFAQById(id);

  fields.push("updated_at = NOW()");
  values.push(id);

  await pool.query(
    `UPDATE faqs SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getFAQById(id);
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM faqs WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

function parseFAQRow(row: RowDataPacket): FAQ {
  return {
    id: row.id,
    question_en: row.question_en,
    question_ar: row.question_ar,
    answer_en: row.answer_en,
    answer_ar: row.answer_ar,
    category: row.category,
    display_order: row.display_order,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ============================================================================
// TESTIMONIAL CRUD
// ============================================================================

export async function getAllTestimonials(includeInactive = false): Promise<Testimonial[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  const query = includeInactive
    ? `SELECT * FROM testimonials ORDER BY page_key, display_order`
    : `SELECT * FROM testimonials WHERE is_active = TRUE ORDER BY page_key, display_order`;

  const [rows] = await pool.query<RowDataPacket[]>(query);
  return rows.map(parseTestimonialRow);
}

export async function getTestimonialsByPage(pageKey: string): Promise<Testimonial[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM testimonials WHERE page_key = ? AND is_active = TRUE ORDER BY display_order`,
    [pageKey]
  );
  return rows.map(parseTestimonialRow);
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM testimonials WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? parseTestimonialRow(rows[0]) : null;
}

export async function createTestimonial(
  data: Omit<Testimonial, "id" | "created_at" | "updated_at">
): Promise<Testimonial | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const id = crypto.randomUUID();

  await pool.query(
    `INSERT INTO testimonials (id, author_name_en, author_name_ar, author_role_en, author_role_ar, author_avatar, quote_en, quote_ar, rating, company, display_order, is_active, page_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.author_name_en,
      data.author_name_ar,
      data.author_role_en,
      data.author_role_ar,
      data.author_avatar || null,
      data.quote_en,
      data.quote_ar,
      data.rating,
      data.company || null,
      data.display_order,
      data.is_active,
      data.page_key,
    ]
  );

  return getTestimonialById(id);
}

export async function updateTestimonial(
  id: string,
  data: Partial<Omit<Testimonial, "id" | "created_at" | "updated_at">>
): Promise<Testimonial | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  const fieldMap: Record<string, keyof typeof data> = {
    author_name_en: "author_name_en",
    author_name_ar: "author_name_ar",
    author_role_en: "author_role_en",
    author_role_ar: "author_role_ar",
    author_avatar: "author_avatar",
    quote_en: "quote_en",
    quote_ar: "quote_ar",
    rating: "rating",
    company: "company",
    display_order: "display_order",
    is_active: "is_active",
    page_key: "page_key",
  };

  for (const [column, key] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return getTestimonialById(id);

  fields.push("updated_at = NOW()");
  values.push(id);

  await pool.query(
    `UPDATE testimonials SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getTestimonialById(id);
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM testimonials WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

function parseTestimonialRow(row: RowDataPacket): Testimonial {
  return {
    id: row.id,
    author_name_en: row.author_name_en,
    author_name_ar: row.author_name_ar,
    author_role_en: row.author_role_en,
    author_role_ar: row.author_role_ar,
    author_avatar: row.author_avatar,
    quote_en: row.quote_en,
    quote_ar: row.quote_ar,
    rating: row.rating,
    company: row.company,
    display_order: row.display_order,
    is_active: Boolean(row.is_active),
    page_key: row.page_key,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ============================================================================
// PAGE SECTIONS CRUD
// ============================================================================

export async function getPageSections(pageKey: string): Promise<PageSection[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM page_sections WHERE page_key = ? AND is_active = TRUE ORDER BY display_order`,
      [pageKey]
    );
    return rows.map(parsePageSectionRow);
  } catch (error: any) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      console.warn(`[Content] Table page_sections does not exist yet. Returning empty array.`);
      return [];
    }
    throw error;
  }
}

export async function getAllPageSections(): Promise<PageSection[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM page_sections ORDER BY page_key, display_order`
    );
    return rows.map(parsePageSectionRow);
  } catch (error: any) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      console.warn(`[Content] Table page_sections does not exist yet. Returning empty array.`);
      return [];
    }
    throw error;
  }
}

export async function getPageSectionById(id: string): Promise<PageSection | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM page_sections WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? parsePageSectionRow(rows[0]) : null;
  } catch (error: any) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      console.warn(`[Content] Table page_sections does not exist yet. Returning null.`);
      return null;
    }
    throw error;
  }
}

export async function upsertPageSection(
  data: Omit<PageSection, "id" | "created_at" | "updated_at">
): Promise<PageSection | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  try {
    // Check if exists
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM page_sections WHERE page_key = ? AND section_key = ?`,
      [data.page_key, data.section_key]
    );

    if (existing.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE page_sections SET 
          title_en = ?, title_ar = ?, subtitle_en = ?, subtitle_ar = ?,
          content_en = ?, content_ar = ?, metadata = ?, display_order = ?,
          is_active = ?, updated_at = NOW()
          WHERE id = ?`,
        [
          data.title_en,
          data.title_ar,
          data.subtitle_en,
          data.subtitle_ar,
          data.content_en,
          data.content_ar,
          data.metadata ? JSON.stringify(data.metadata) : null,
          data.display_order,
          data.is_active ? 1 : 0,
          existing[0].id,
        ]
      );
      return getPageSectionById(existing[0].id);
    } else {
      // Insert new
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO page_sections (
          page_key, section_key, title_en, title_ar, subtitle_en, subtitle_ar,
          content_en, content_ar, metadata, display_order, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          data.page_key,
          data.section_key,
          data.title_en,
          data.title_ar,
          data.subtitle_en,
          data.subtitle_ar,
          data.content_en,
          data.content_ar,
          data.metadata ? JSON.stringify(data.metadata) : null,
          data.display_order,
          data.is_active ? 1 : 0,
        ]
      );
      return getPageSectionById(result.insertId.toString());
    }
  } catch (error: any) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      console.warn(`[Content] Table page_sections does not exist yet. Cannot upsert section.`);
      return null;
    }
    throw error;
  }
}
       WHERE id = ?`,
      [
        data.title_en,
        data.title_ar,
        data.subtitle_en || null,
        data.subtitle_ar || null,
        data.content_en || null,
        data.content_ar || null,
        JSON.stringify(data.metadata || {}),
        data.display_order,
        data.is_active,
        existing[0].id,
      ]
    );
    return getPageSectionById(existing[0].id);
  } else {
    // Insert new
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO page_sections (id, page_key, section_key, title_en, title_ar, subtitle_en, subtitle_ar, content_en, content_ar, metadata, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.page_key,
        data.section_key,
        data.title_en,
        data.title_ar,
        data.subtitle_en || null,
        data.subtitle_ar || null,
        data.content_en || null,
        data.content_ar || null,
        JSON.stringify(data.metadata || {}),
        data.display_order,
        data.is_active,
      ]
    );
    return getPageSectionById(id);
  }
}

export async function deletePageSection(id: string): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM page_sections WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

function parsePageSectionRow(row: RowDataPacket): PageSection {
  return {
    id: row.id,
    page_key: row.page_key,
    section_key: row.section_key,
    title_en: row.title_en,
    title_ar: row.title_ar,
    subtitle_en: row.subtitle_en,
    subtitle_ar: row.subtitle_ar,
    content_en: row.content_en,
    content_ar: row.content_ar,
    metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata,
    display_order: row.display_order,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
