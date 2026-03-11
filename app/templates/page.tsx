'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Search, AlertTriangle } from 'lucide-react';

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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory =
        selectedCategory === 'all' || template.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, templates]);

  const featuredTemplates = filteredTemplates.filter((template) => template.featured);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Website Templates</h1>
            <p className="text-lg text-muted-foreground">
              Launch your website in minutes from our managed template catalog.
            </p>
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
                      <Link key={template.id} href={`/templates/${template.id}`}>
                        <Card className="h-full bg-card border-accent/30 hover:border-accent/60 transition-smooth cursor-pointer group overflow-hidden hover-lift">
                          <div className="aspect-video bg-gradient-to-br from-accent/10 to-accent/5 relative overflow-hidden">
                            <div className="absolute top-3 right-3">
                              <Badge className="gap-1 bg-accent/20 text-accent border-0">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                              </Badge>
                            </div>
                          </div>
                          <CardHeader>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                              {template.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-bold">${template.startingPrice}</span>
                              <span className="text-xs text-muted-foreground">/month</span>
                            </div>
                            <Button className="w-full gap-2 group">
                              View & Launch
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
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
                    <Link key={template.id} href={`/templates/${template.id}`}>
                      <Card className="h-full bg-card border-border hover:border-accent/40 transition-smooth cursor-pointer group overflow-hidden hover-lift">
                        <div className="aspect-video bg-gradient-to-br from-secondary to-secondary/50 relative overflow-hidden">
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="text-xs">
                              {template.stack}
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
                          <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold">${template.startingPrice}</span>
                            <span className="text-xs text-muted-foreground">/month</span>
                          </div>
                          <Button variant="outline" className="w-full gap-2 group">
                            View Details
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
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
