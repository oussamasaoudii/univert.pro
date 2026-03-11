'use client';

import Image from 'next/image';
import { formatDate } from '@/lib/utils/date';
import type { BlogPostWithRelations } from '@/lib/db/types';

interface BlogPostHeroProps {
  post: BlogPostWithRelations;
}

export function BlogPostHero({ post }: BlogPostHeroProps) {
  return (
    <article className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {post.category && (
          <div className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: post.category.color + '20', color: post.category.color }}>
            {post.category.name}
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-4 border-b border-t border-border py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {post.author?.avatar_url && (
            <Image
              src={post.author.avatar_url}
              alt={post.author.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-foreground">{post.author?.name}</p>
            {post.author?.bio && (
              <p className="text-sm text-muted-foreground">{post.author.bio}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatDate(post.published_at || post.created_at)}</span>
          {post.reading_time_minutes && (
            <span>{post.reading_time_minutes} min read</span>
          )}
          <span>{post.view_count} views</span>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          <Image
            src={post.featured_image_url}
            alt={post.featured_image_alt || post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
    </article>
  );
}
