import { Metadata } from 'next';
import { getBlogTag, getPostsByTag } from '@/lib/db/blog';
import { BlogPostCard } from '@/components/blog/blog-post-card';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: TagPageProps): Metadata {
  const { slug } = await props.params;
  const tag = await getBlogTag(slug);

  return {
    title: `#${tag?.name || 'Tag'} | Ovmon Blog`,
    description: `Articles tagged with ${tag?.name}`,
  };
}

export const dynamic = 'force-dynamic';

export default async function TagPage(props: TagPageProps) {
  const { slug } = await props.params;

  const [tag, posts] = await Promise.all([
    getBlogTag(slug),
    getPostsByTag(slug),
  ]);

  if (!tag) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-foreground">Tag not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            #{tag.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore articles tagged with {tag.name}
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card/50 py-12 text-center">
              <p className="text-muted-foreground">No articles with this tag yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
