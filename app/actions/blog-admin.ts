'use server';

import { getAdminRequestUser } from '@/lib/api-auth';
import { createBlogPost, updateBlogPost, deleteBlogPost, getBlogAuthors, getBlogCategories, getBlogTags } from '@/lib/db/blog';
import { calculateReadingTime, generateSlug, extractExcerpt } from '@/lib/blog/seo';
import type { BlogPostRow } from '@/lib/db/types';

async function ensureAdmin() {
  const adminUser = await getAdminRequestUser();
  if (!adminUser) {
    throw new Error("Unauthorized");
  }
}

/**
 * Create a new blog post
 */
export async function createBlogPostAction(
  title: string,
  content: string,
  authorId: string,
  categoryId?: string,
  excerpt?: string,
  featuredImageUrl?: string,
  seoTitle?: string,
  seoDescription?: string
): Promise<{ success: boolean; post?: BlogPostRow; error?: string }> {
  await ensureAdmin();

  try {
    const slug = generateSlug(title);
    const autoExcerpt = excerpt || extractExcerpt(content);
    const readingTime = calculateReadingTime(content);

    const post = await createBlogPost({
      title,
      slug,
      content,
      excerpt: autoExcerpt,
      author_id: authorId,
      category_id: categoryId,
      featured_image_url: featuredImageUrl,
      reading_time_minutes: readingTime,
      seo_title: seoTitle,
      seo_description: seoDescription,
      status: 'draft',
    });

    if (!post) {
      return { success: false, error: 'Failed to create post' };
    }

    return { success: true, post };
  } catch (error) {
    console.error('[admin-blog] Error creating post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

/**
 * Publish a blog post
 */
export async function publishBlogPostAction(postId: string): Promise<{ success: boolean; error?: string }> {
  await ensureAdmin();

  try {
    const updated = await updateBlogPost(postId, {
      status: 'published',
      published_at: new Date().toISOString(),
    });

    if (!updated) {
      return { success: false, error: 'Failed to publish post' };
    }

    return { success: true };
  } catch (error) {
    console.error('[admin-blog] Error publishing post:', error);
    return { success: false, error: 'Failed to publish post' };
  }
}

/**
 * Update a blog post
 */
export async function updateBlogPostAction(
  postId: string,
  updates: Partial<BlogPostRow>
): Promise<{ success: boolean; error?: string }> {
  await ensureAdmin();

  try {
    // Recalculate reading time if content changed
    if (updates.content && !updates.reading_time_minutes) {
      updates.reading_time_minutes = calculateReadingTime(updates.content);
    }

    // Auto-generate excerpt if content changed
    if (updates.content && !updates.excerpt) {
      updates.excerpt = extractExcerpt(updates.content);
    }

    const updated = await updateBlogPost(postId, {
      ...updates,
      updated_at: new Date().toISOString(),
    });

    if (!updated) {
      return { success: false, error: 'Failed to update post' };
    }

    return { success: true };
  } catch (error) {
    console.error('[admin-blog] Error updating post:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPostAction(postId: string): Promise<{ success: boolean; error?: string }> {
  await ensureAdmin();

  try {
    const deleted = await deleteBlogPost(postId);

    if (!deleted) {
      return { success: false, error: 'Failed to delete post' };
    }

    return { success: true };
  } catch (error) {
    console.error('[admin-blog] Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

/**
 * Set post as featured
 */
export async function setFeaturedPostAction(
  postId: string,
  featured: boolean,
  position?: number
): Promise<{ success: boolean; error?: string }> {
  await ensureAdmin();

  try {
    const updated = await updateBlogPost(postId, {
      is_featured: featured,
      featured_position: position,
    });

    if (!updated) {
      return { success: false, error: 'Failed to update post' };
    }

    return { success: true };
  } catch (error) {
    console.error('[admin-blog] Error setting featured post:', error);
    return { success: false, error: 'Failed to set featured post' };
  }
}

/**
 * Get available blog metadata for admin
 */
export async function getBlogMetadata(): Promise<{
  authors: any[];
  categories: any[];
  tags: any[];
}> {
  await ensureAdmin();

  try {
    const [authors, categories, tags] = await Promise.all([
      getBlogAuthors(),
      getBlogCategories(),
      getBlogTags(),
    ]);

    return { authors, categories, tags };
  } catch (error) {
    console.error('[admin-blog] Error fetching metadata:', error);
    return { authors: [], categories: [], tags: [] };
  }
}
