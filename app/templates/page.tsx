'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Search, AlertTriangle, Headphones, Globe, Shield, ExternalLink } from 'lucide-react';

type TemplateRecord = {
  id: string;
  name: string;
  description: string;
  category: 'corporate' | 'agency' | 'portfolio' | 'ecommerce' | 'restaurant' | 'saas' | 'marketplace';
  stack: 'Laravel' | 'Next.js' | 'WordPress';
  startingPrice: number;
  performanceScore: number;
  featured: boolean;
};

const categories = [
  { id: 'all', label: 'All Templates' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'agency', label: 'Agency' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'saas', label: 'SaaS' },
  { id: 'marketplace', label: 'Marketplace' },
];

const stacks = [
  { id: 'all', label: 'All Stacks' },
  { id: 'wordpress', label: 'WordPress' },
  { id: 'laravel', label: 'Laravel' },
  { id: 'nextjs', label: 'Next.js' },
];

const categoryHighlights: Record<TemplateRecord['category'], string> = {
  corporate: 'Business website',
  agency: 'Agency website',
  portfolio: 'Portfolio website',
  ecommerce: 'Online store',
  restaurant: 'Restaurant website',
  saas: 'SaaS website',
  marketplace: 'Marketplace website',
};

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedStack, setSelectedStack] = useState(searchParams.get('stack') || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTemplates = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/templates', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_templates'));
      }

      setTemplates(Array.isArray(result?.templates) ? result.templates : []);
    } catch (error) {
      console.error('[templates] failed to load', error);
      setErrorMessage('Failed to load templates from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedStack(searchParams.get('stack') || 'all');
  }, [searchParams]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory =
        selectedCategory === 'all' || template.category === selectedCategory;
      const matchesStack =
        selectedStack === 'all' || template.stack.toLowerCase() === selectedStack.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        categoryHighlights[template.category].toLowerCase().includes(query);
      return matchesCategory && matchesStack && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedStack, templates]);

  const featuredTemplates = filteredTemplates.filter((template) => template.featured);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Website Templates</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Choose a professionally designed template and launch with managed setup, hosting, SSL, backups, and support included. Start fast now, move later if your business needs its own server.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Badge variant="outline" className="gap-2"><Headphones className="w-3.5 h-3.5" /> Support included</Badge>
              <Badge variant="outline" className="gap-2"><Shield className="w-3.5 h-3.5" /> SSL and backups</Badge>
              <Badge variant="outline" className="gap-2"><Globe className="w-3.5 h-3.5" /> Subdomain or custom domain</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                    selectedCategory === category.id
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {stacks.map((stack) => (
                <button
                  key={stack.id}
                  onClick={() => setSelectedStack(stack.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                    selectedStack === stack.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {stack.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Card className="bg-card border-border">
              <CardContent className="py-10 text-center text-muted-foreground">
                Loading templates...
              </CardContent>
            </Card>
          ) : errorMessage ? (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="py-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="space-y-3">
                    <p className="font-medium text-red-500">{errorMessage}</p>
                    <Button size="sm" variant="outline" onClick={loadTemplates}>
                      Retry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {featuredTemplates.length > 0 && selectedCategory === 'all' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Featured</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="h-full bg-card border-accent/30 hover:border-accent/60 transition-smooth overflow-hidden hover-lift"
                      >
                        <div className="aspect-video bg-gradient-to-br from-accent/10 to-accent/5 relative overflow-hidden">
                          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                            <Badge className="gap-1 bg-accent/20 text-accent border-0">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {template.stack}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {categoryHighlights[template.category]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Managed setup, hosting, SSL, backups, and support are included from day one.
                          </p>
                          <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold">${template.startingPrice}</span>
                            <span className="text-xs text-muted-foreground">/month</span>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1 gap-2 group" asChild>
                              <Link href={`/templates/${template.id}`}>
                                View & Launch
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                            <Button variant="outline" className="gap-2" asChild>
                              <Link href={`/demos/${template.id}`}>
                                See Demo
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === 'all'
                    ? 'All Templates'
                    : `${categories.find((item) => item.id === selectedCategory)?.label || ''} Templates`}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="h-full bg-card border-border hover:border-accent/40 transition-smooth overflow-hidden hover-lift"
                    >
                      <div className="aspect-video bg-gradient-to-br from-secondary to-secondary/50 relative overflow-hidden">
                        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {template.stack}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {categoryHighlights[template.category]}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Best for businesses that want a fast launch with ongoing support and future export freedom.
                        </p>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold">${template.startingPrice}</span>
                          <span className="text-xs text-muted-foreground">/month</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 gap-2 group" asChild>
                            <Link href={`/templates/${template.id}`}>
                              View Details
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                          <Button variant="ghost" className="gap-2" asChild>
                            <Link href={`/demos/${template.id}`}>
                              Demo
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No templates found matching your criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
