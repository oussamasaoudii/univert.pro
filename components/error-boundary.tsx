'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[v0] ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback component for sections
export function SectionErrorFallback({ title = 'Section' }: { title?: string }) {
  return (
    <div className="p-6 border border-border/50 rounded-lg bg-muted/20 text-center">
      <p className="text-muted-foreground text-sm">
        Unable to load {title}. Please refresh the page.
      </p>
    </div>
  );
}

// Safe wrapper for rendering potentially undefined data
export function SafeRender<T>({ 
  data, 
  render, 
  fallback = null 
}: { 
  data: T | null | undefined; 
  render: (data: T) => ReactNode; 
  fallback?: ReactNode;
}) {
  if (data === null || data === undefined) {
    return <>{fallback}</>;
  }
  
  try {
    return <>{render(data)}</>;
  } catch {
    return <>{fallback}</>;
  }
}
