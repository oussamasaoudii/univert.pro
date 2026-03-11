'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface LegalLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, description, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container py-8 md:py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">{title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-invert max-w-none space-y-8">
            {children}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border bg-secondary/30">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Questions or Concerns?</h2>
            <p className="text-muted-foreground">
              If you have any questions about our policies, please don't hesitate to reach out to our team.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/contact">
                <Button variant="default">Contact Us</Button>
              </Link>
              <Link href="/support">
                <Button variant="outline">Visit Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
