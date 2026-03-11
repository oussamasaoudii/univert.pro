'use client';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="space-y-6 text-foreground"
      />
    </div>
  );
}
