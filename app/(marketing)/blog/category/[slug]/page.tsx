import { Metadata } from 'next';
import { getBlogCategory, getPostsByCategory } from '@/lib/db/blog';
import { BlogPostCard } from '@/components/blog/blog-post-card';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: CategoryPageProps): Metadata {
  const { slug } = await props.params;
  const category = await getBlogCategory(slug);

  return {
    title: `${category?.name || 'Category'} | Ovmon Blog`,
    description: category?.description || `Articles about ${category?.name}`,
  };
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage(props: CategoryPageProps) {
  const { slug } = await props.params;

  const [category, posts] = await Promise.all([
    getBlogCategory(slug),
    getPostsByCategory(slug),
  ]);

  if (!category) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-foreground">Category not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div
            className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
            style={{ backgroundColor: category.color + '20', color: category.color }}
          >
            {category.name}
          </div>
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-muted-foreground">
              {category.description}
            </p>
          )}
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
              <p className="text-muted-foreground">No articles in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
