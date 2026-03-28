'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-background">
      <div className="text-center max-w-md">
        {/* Error code */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[120px] font-bold text-accent/30 leading-none">
            404
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-lg text-foreground/60 mb-8">
          The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Return to Home
            </Button>
          </Link>
          <Link href="/templates">
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
              <Search className="w-4 h-4" />
              Browse Templates
            </Button>
          </Link>
        </div>

        {/* Help text */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-foreground/50 mb-4">
            Need help finding something?
          </p>
          <Link href="/support" className="text-accent hover:text-accent/80 transition-colors font-medium">
            Contact our support team →
          </Link>
        </div>
      </div>
    </div>
  );
}
