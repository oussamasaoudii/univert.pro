# Ovmon Blog System

A production-ready SaaS blog system with CMS, SEO optimization, and premium design for marketing and thought leadership.

## Architecture

### Database Schema
- **blog_authors**: Author profiles with bios and avatars
- **blog_categories**: Content organization with custom colors
- **blog_tags**: Flexible tagging system
- **blog_posts**: Core post table with draft/published/archived states
- **blog_post_tags**: Junction table for post-tag relationships
- **blog_post_views**: View tracking with IP, country, referrer, and timestamps

### Key Features
- Full-text search support via PostgreSQL
- Automatic reading time calculation
- View count tracking and analytics
- Featured post positioning (up to 3 featured posts)
- SEO metadata with Open Graph support
- Structured article schema (JSON-LD)
- Automatic excerpt generation
- Slug generation and canonicalization

## Data Layer (lib/db/blog.ts)

### Public Functions
- `getPublishedPosts(limit?, offset?)` - Paginated published posts
- `getFeaturedPosts(limit)` - Get featured posts ordered by position
- `getPostBySlug(slug)` - Single post with relations (author, category, tags)
- `getPostsByCategory(slug, limit?)` - Filter by category
- `getPostsByTag(slug, limit?)` - Filter by tag
- `getRelatedPosts(postId, limit)` - Related content
- `getBlogAuthors()` - All authors
- `getBlogCategories()` - All categories with color codes
- `getBlogTags()` - All tags

### Admin Functions
- `createBlogPost()` - Create new post
- `updateBlogPost(id, updates)` - Modify post
- `deleteBlogPost(id)` - Remove post
- `trackPostView()` - Record view analytics

## Pages

### Public Pages
- `/blog` - Homepage with featured and latest posts
- `/blog/[slug]` - Individual post page with hero, content, tags, related articles
- `/blog/category/[slug]` - Category archive page
- `/blog/tag/[slug]` - Tag archive page

### Features per Page
- **Blog Homepage**: Featured posts grid + paginated latest articles
- **Post Page**: Hero section, author info, reading time, view count, related articles, tag links
- **Category/Tag Pages**: Filtered article listings with category/tag header

## UI Components (components/blog/)

- `blog-post-card.tsx` - Reusable article card with image, excerpt, metadata
- `blog-post-hero.tsx` - Post header with title, excerpt, author, meta
- `blog-content.tsx` - HTML content renderer with prose styling
- `related-posts.tsx` - Grid of related article recommendations

## Admin Management (app/actions/blog-admin.ts)

### Server Actions
- `createBlogPostAction()` - Create post with auto slug/reading time
- `publishBlogPostAction()` - Set status to published with timestamp
- `updateBlogPostAction()` - Update post (auto recalculates metrics)
- `deleteBlogPostAction()` - Permanent deletion
- `setFeaturedPostAction()` - Toggle featured status with ordering
- `getBlogMetadata()` - Fetch authors, categories, tags for forms

All admin actions require `requireAdmin()` middleware and include error handling.

## SEO Optimization (lib/blog/seo.ts)

### Features
- `generateArticleSchema()` - JSON-LD structured data for search engines
- `generateSEOMetadata()` - Title, description, OG tags, Twitter cards
- `calculateReadingTime()` - Auto-estimate based on word count
- `generateSlug()` - URL-safe slug from title
- `extractExcerpt()` - Auto-generate 160-char excerpt from HTML

### Meta Data Fields
- `seo_title` - Custom title for search results (overrides post title)
- `seo_description` - Meta description (recommended 160 chars)
- `og_image_url` - Share image (separate from featured image)
- `canonical_url` - Prevent duplicate content issues

## Usage

### Create a Blog Post (Admin)
```typescript
const result = await createBlogPostAction(
  'My Post Title',
  '<h2>Heading</h2><p>Content here...</p>',
  authorId,
  categoryId,
  undefined, // auto excerpt
  'https://example.com/image.jpg',
  'Custom SEO Title',
  'Custom SEO description'
);
```

### Publish Post
```typescript
await publishBlogPostAction(postId);
```

### Get Featured Posts
```typescript
const featured = await getFeaturedPosts(3);
featured.map(post => (
  <BlogPostCard key={post.id} post={post} featured />
))
```

### Get Single Post with Relations
```typescript
const post = await getPostBySlug('my-post-slug');
// post.author, post.category, post.tags all loaded
```

## Performance

- Indexed queries on slug, status, published_at, category_id, author_id
- Featured positions for quick filtering
- Image lazy loading via Next.js Image component
- Paginated lists (12 posts per page default)
- View count optimization (incremental updates via RPC)

## Security

- RLS policies: Public reads for published posts only
- Admin-only writes for posts, authors, categories, tags
- Input validation on slug generation
- HTML sanitization recommended for user-submitted content

## Future Enhancements

- Comments/discussion system
- Email subscriptions
- Social share tracking
- Full-text search with Algolia/Typesense
- Draft sharing via secret links
- Scheduled publishing
- Post analytics dashboard
