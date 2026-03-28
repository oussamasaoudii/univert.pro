'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LaunchTemplateButton } from '@/components/provisioning/launch-template-button';
import { ArrowLeft, Check, Globe, Layers, AlertTriangle } from 'lucide-react';

type TemplateRecord = {
  id: string;
  name: string;
  description: string;
  category: 'corporate' | 'agency' | 'portfolio' | 'ecommerce' | 'restaurant' | 'saas' | 'marketplace';
  stack: 'Laravel' | 'Next.js' | 'WordPress';
  liveDemoUrl: string | null;
  startingPrice: number;
  performanceScore: number;
  featured: boolean;
};

const categoryAudience: Record<TemplateRecord['category'], string[]> = {
  corporate: ['Professional service providers', 'Local businesses', 'Consultancies and teams'],
  agency: ['Creative agencies', 'Freelancers', 'Studios showcasing client work'],
  portfolio: ['Personal brands', 'Designers and developers', 'Photographers and creators'],
  ecommerce: ['Online shops', 'Retail brands', 'Catalog-based businesses'],
  restaurant: ['Restaurants and cafes', 'Food delivery brands', 'Hospitality businesses'],
  saas: ['Software businesses', 'Startups validating a product', 'Subscription-based offers'],
  marketplace: ['Service directories', 'Multi-vendor ideas', 'Booking and listing platforms'],
};

const launchTimeline = [
  'Choose the template and submit your launch details.',
  'We prepare the website, hosting, and SSL for your chosen domain or subdomain.',
  'You receive the live link, access details, and support options when setup is complete.',
];

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [template, setTemplate] = useState<TemplateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch(`/api/templates/${id}`, { cache: 'no-store' });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(result?.error || 'template_not_found'));
        }
        setTemplate(result.template || null);
      } catch (error) {
        console.error('[templates/:id] failed to load', error);
        setErrorMessage('Template not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading template...</p>
      </div>
    );
  }

  if (errorMessage || !template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6 space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Template not found</h1>
            <p className="text-muted-foreground">{errorMessage || 'This template does not exist.'}</p>
            <Button variant="outline" onClick={() => router.push('/templates')}>
              Back to Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/templates')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{template.name}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video bg-gradient-to-br from-accent/10 via-secondary to-secondary/50 rounded-xl border border-border/40 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Layers className="w-16 h-16 mx-auto text-accent/40 mb-4" />
                  <p className="text-muted-foreground">Preview coming soon</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">About This Template</h2>
              <p className="text-muted-foreground leading-relaxed">{template.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">At a Glance</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="bg-secondary/30 border-border">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-accent">{template.performanceScore}/5</div>
                    <p className="text-sm text-muted-foreground mt-2">Template quality score</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30 border-border">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-green-500">{template.stack}</div>
                    <p className="text-sm text-muted-foreground mt-2">Technology stack</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30 border-border">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-blue-500 capitalize">{template.category}</div>
                    <p className="text-sm text-muted-foreground mt-2">Best-fit category</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Included</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Managed setup & hosting',
                  'Free SSL certificate',
                  'Daily backups',
                  'Domain connection support',
                  `${template.stack} stack`,
                  'Admin support activation',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Who This Template Is For</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {categoryAudience[template.category].map((item) => (
                  <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">How Launch Works</h2>
              <div className="space-y-3">
                {launchTimeline.map((step, index) => (
                  <div key={step} className="flex items-start gap-4 rounded-lg border border-border/60 bg-card/60 p-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-secondary/30 border-border">
              <CardContent className="pt-6 space-y-3">
                <h2 className="text-xl font-bold">Ownership and Migration Later</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Univert helps you launch quickly today without locking you in forever. When your
                  business is ready for its own infrastructure, you can request a handoff path and
                  our team will guide the export and migration options available for your plan.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6 self-start sticky top-24">
            <Card className="bg-gradient-to-br from-accent/10 via-background to-background border-accent/20">
              <CardHeader>
                <CardTitle>Ready to Launch?</CardTitle>
                <CardDescription>Start with managed setup, hosting, and support included.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="text-4xl font-bold">${template.startingPrice}</div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>

                <div className="space-y-3 py-4 border-y border-border/40">
                  {[
                    'Managed setup and hosting',
                    'SSL, backups, and security basics included',
                    'Admin/login access when your site is ready',
                    'Help with subdomain or custom domain setup',
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full">
                  <LaunchTemplateButton
                    templateId={template.id}
                    templateName={template.name}
                    buttonLabel="Launch Website"
                  />
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Need help?{' '}
                  <Link href="/support" className="text-accent hover:underline">
                    Contact support
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 border-border">
              <CardContent className="pt-6 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Category</p>
                  <Badge variant="secondary" className="capitalize">
                    {template.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Stack</p>
                  <Badge className="text-base px-3 py-1.5">{template.stack}</Badge>
                </div>
                {template.featured && (
                  <Badge className="bg-accent/10 text-accent hover:bg-accent/20">Featured</Badge>
                )}
              </CardContent>
            </Card>

            {template.liveDemoUrl && (
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href={template.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4" />
                  View Live Demo
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
