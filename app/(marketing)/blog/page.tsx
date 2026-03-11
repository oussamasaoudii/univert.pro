import { Metadata } from 'next';
import { getPublishedPosts, getFeaturedPosts } from '@/lib/db/blog';
import { BlogPostCard } from '@/components/blog/blog-post-card';

export const metadata: Metadata = {
  title: 'Blog | Ovmon',
  description: 'Explore insights and resources about website management, provisioning, and best practices for modern web applications.',
};

export const dynamic = 'force-dynamic';

export default async function BlogHomePage() {
  const [featured, recent] = await Promise.all([
    getFeaturedPosts(3),
    getPublishedPosts(12, 0),
  ]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            Ovmon Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Insights, tutorials, and best practices for managing and provisioning modern websites at scale.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featured.length > 0 && (
        <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured</h2>
              <p className="text-muted-foreground">Our most important articles and resources</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map(post => (
                <BlogPostCard key={post.id} post={post} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
            <p className="text-muted-foreground">Everything you need to know about website management</p>
          </div>
          
          {recent.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recent.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card/50 py-12 text-center">
              <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
