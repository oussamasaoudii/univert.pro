'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface MarketingLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showBackButton?: boolean;
}

export function MarketingLayout({
  title,
  description,
  children,
  showBackButton = true
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container py-8 md:py-12">
          {showBackButton && (
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          )}

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">{title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
