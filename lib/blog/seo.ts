import type { BlogPostWithRelations } from '@/lib/db/types';

/**
 * Generate structured data for a blog post (JSON-LD)
 */
export function generateArticleSchema(post: BlogPostWithRelations, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seo_description,
    image: post.featured_image_url || post.og_image_url,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author?.name,
      image: post.author?.avatar_url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ovmon',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };
}

/**
 * Generate SEO metadata for a blog post
 */
export function generateSEOMetadata(post: BlogPostWithRelations) {
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || post.title;

  return {
    title,
    description,
    keywords: post.tags?.map(t => t.tag?.name).filter(Boolean).join(', '),
    ogTitle: post.title,
    ogDescription: post.excerpt || description,
    ogImage: post.og_image_url || post.featured_image_url,
    ogType: 'article',
    ogUrl: `/blog/${post.slug}`,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: post.og_image_url || post.featured_image_url,
  };
}

/**
 * Calculate estimated reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  // Strip HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate URL-safe slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract excerpt from HTML content
 */
export function extractExcerpt(content: string, length: number = 160): string {
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length).trim() + '...';
}
