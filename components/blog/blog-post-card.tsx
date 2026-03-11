'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/date';
import type { BlogPostWithRelations } from '@/lib/db/types';

interface BlogPostCardProps {
  post: BlogPostWithRelations;
  featured?: boolean;
}

export function BlogPostCard({ post, featured }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className={`group flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg ${featured ? 'col-span-full md:col-span-2 lg:col-span-3' : ''}`}>
        {post.featured_image_url && (
          <div className={`relative overflow-hidden rounded-md bg-muted ${featured ? 'aspect-video' : 'aspect-square'}`}>
            <Image
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {post.category && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`} style={{ backgroundColor: post.category.color + '20', color: post.category.color }}>
                {post.category.name}
              </span>
            )}
            {post.reading_time_minutes && (
              <span className="text-xs text-muted-foreground">
                {post.reading_time_minutes} min read
              </span>
            )}
          </div>

          <h3 className={`font-bold text-foreground transition-colors group-hover:text-accent ${featured ? 'text-2xl' : 'text-lg'}`}>
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              {post.author?.avatar_url && (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-foreground">
                  {post.author?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.published_at || post.created_at)}
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {post.view_count} views
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
