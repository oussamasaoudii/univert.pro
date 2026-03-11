import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getRelatedPosts, trackPostView } from '@/lib/db/blog';
import { BlogPostHero } from '@/components/blog/blog-post-hero';
import { BlogContent } from '@/components/blog/blog-content';
import { RelatedPosts } from '@/components/blog/related-posts';
import { Separator } from '@/components/ui/separator';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Ovmon Blog',
    };
  }

  return {
    title: `${post.seo_title || post.title} | Ovmon Blog`,
    description: post.seo_description || post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
      url: `https://ovmon.com/blog/${post.slug}`,
      images: post.og_image_url ? [{ url: post.og_image_url }] : undefined,
    },
    alternates: {
      canonical: post.canonical_url || `https://ovmon.com/blog/${post.slug}`,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Track view
  await trackPostView(post.id);

  // Get related posts
  const related = await getRelatedPosts(post.id, 3);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <BlogPostHero post={post} />
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <BlogContent content={post.content} />
        </div>
      </section>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <>
          <Separator className="mx-auto max-w-3xl" />
          <section className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <a
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="inline-flex items-center rounded-full bg-card px-3 py-1 text-sm font-medium text-foreground hover:bg-card/80"
                >
                  #{tag.name}
                </a>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Related Posts */}
      {related.length > 0 && (
        <>
          <Separator className="mx-auto max-w-6xl" />
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <RelatedPosts posts={related} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
