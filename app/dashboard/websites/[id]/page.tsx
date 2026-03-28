'use client';

import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Link2,
  Loader2,
  PauseCircle,
  Shield,
  XCircle,
} from 'lucide-react';
import { getDisplayDomain } from '@/lib/platform-domain';

type WebsiteRecord = {
  id: string;
  templateId: string | null;
  templateName: string;
  templateStack: 'Laravel' | 'Next.js' | 'WordPress';
  projectName: string;
  status: 'pending' | 'provisioning' | 'ready' | 'suspended' | 'failed';
  subdomain: string;
  customDomain: string | null;
  liveUrl: string | null;
  dashboardUrl: string | null;
  renewalDate: string | null;
  createdAt: string;
};

type DashboardWebsitesResponse = {
  websites: WebsiteRecord[];
};

const statusConfig: Record<
  WebsiteRecord['status'],
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  ready: {
    label: 'Ready',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  provisioning: {
    label: 'Setting Up',
    icon: Loader2,
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  suspended: {
    label: 'Suspended',
    icon: PauseCircle,
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
  failed: {
    label: 'Needs Attention',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
};

function formatDate(value: string | null) {
  if (!value) return 'Not available yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available yet';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDomainStatus(website: WebsiteRecord) {
  if (website.customDomain) {
    return {
      label: 'Custom domain requested',
      description: 'DNS may still need a few minutes to finish routing and SSL activation.',
    };
  }

  return {
    label: 'Using Univert subdomain',
    description: 'You can connect a custom domain at any time from the dashboard.',
  };
}

export default function WebsiteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [website, setWebsite] = useState<WebsiteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadWebsite = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch('/api/dashboard/websites', {
          cache: 'no-store',
          credentials: 'include',
        });
        const result = (await response.json().catch(() => ({}))) as Partial<DashboardWebsitesResponse> & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || 'failed_to_load_website');
        }

        const websites = Array.isArray(result.websites) ? result.websites : [];
        const selected = websites.find((item) => item.id === id) || null;

        if (!selected) {
          throw new Error('website_not_found');
        }

        setWebsite(selected);
      } catch (error) {
        console.error('[dashboard/websites/:id] failed to load', error);
        setErrorMessage('Website details are unavailable right now.');
      } finally {
        setLoading(false);
      }
    };

    loadWebsite();
  }, [id]);

  const domain = useMemo(() => {
    if (!website) return '';
    return getDisplayDomain({
      subdomain: website.subdomain,
      customDomain: website.customDomain,
      liveUrl: website.liveUrl,
    });
  }, [website]);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-10 text-center text-muted-foreground">
          Loading website details...
        </CardContent>
      </Card>
    );
  }

  if (!website || errorMessage) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="py-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="space-y-3">
              <p className="font-medium text-red-500">{errorMessage || 'Website not found.'}</p>
              <Button variant="outline" onClick={() => router.push('/dashboard/websites')}>
                Back to Websites
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[website.status];
  const StatusIcon = status.icon;
  const domainStatus = getDomainStatus(website);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" className="w-fit gap-2 px-0 text-muted-foreground" asChild>
            <Link href="/dashboard/websites">
              <ArrowLeft className="w-4 h-4" />
              Back to My Websites
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{website.projectName}</h1>
              <Badge variant="outline" className={`gap-1.5 ${status.className}`}>
                <StatusIcon className={`w-3 h-3 ${website.status === 'provisioning' ? 'animate-spin' : ''}`} />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Review your website details, support options, and ownership path in one place.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {website.liveUrl ? (
            <Button asChild>
              <a href={website.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Website
              </a>
            </Button>
          ) : (
            <Button disabled>
              <Globe className="w-4 h-4 mr-2" />
              Website Not Live Yet
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/support">
              <HelpCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Website Overview</CardTitle>
              <CardDescription>Your current setup, template, and domain information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Template</p>
                <p className="font-medium">{website.templateName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stack</p>
                <p className="font-medium">{website.templateStack}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Primary domain</p>
                <p className="font-medium break-all">{domain}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Launch requested</p>
                <p className="font-medium">{formatDate(website.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renewal date</p>
                <p className="font-medium">{formatDate(website.renewalDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{status.label}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Access Details</CardTitle>
              <CardDescription>Links appear here as your website becomes ready.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground">Live URL</p>
                {website.liveUrl ? (
                  <a
                    href={website.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-2 font-medium text-accent hover:underline"
                  >
                    {website.liveUrl}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your live website link will appear here when setup is complete.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground">Admin or login URL</p>
                {website.dashboardUrl ? (
                  <a
                    href={website.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-2 font-medium text-accent hover:underline"
                  >
                    {website.dashboardUrl}
                    <LayoutDashboard className="w-4 h-4" />
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Credentials will appear here when your website is ready.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" id="ownership">
            <CardHeader>
              <CardTitle>Ownership and Export</CardTitle>
              <CardDescription>Your website stays yours as it grows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Univert helps you launch faster today while keeping a path open for later migration.
                When you are ready for your own server, you can request export guidance based on your
                plan and project setup.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link href="/about/ownership">
                    <Shield className="w-4 h-4 mr-2" />
                    Read Ownership Guide
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/support">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Request Migration Help
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Domain Status</CardTitle>
              <CardDescription>Where your website will be reachable online.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground">Current domain</p>
                <p className="mt-1 font-medium break-all">{domain}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="font-medium">{domainStatus.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{domainStatus.description}</p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/domains">
                  <Link2 className="w-4 h-4 mr-2" />
                  Manage Domains
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Plan and Billing</CardTitle>
              <CardDescription>Review pricing and renewal details from your billing area.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Active plan details, invoices, and renewal controls live in your billing dashboard.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/billing">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Open Billing
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
