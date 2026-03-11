'use client';

import { BlogPostCard } from './blog-post-card';
import type { BlogPostWithRelations } from '@/lib/db/types';

interface RelatedPostsProps {
  posts: BlogPostWithRelations[];
  title?: string;
}

export function RelatedPosts({ posts, title = 'Related Articles' }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
