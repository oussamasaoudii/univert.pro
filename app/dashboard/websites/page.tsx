'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Globe,
  ExternalLink,
  LayoutDashboard,
  Link2,
  CreditCard,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  LayoutGrid,
  LayoutList,
  Search,
  Activity,
  Rocket,
  Shield,
  ChevronRight,
  XCircle,
  PauseCircle,
  AlertTriangle,
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

type TemplateRecord = {
  id: string;
  stack: 'Laravel' | 'Next.js' | 'WordPress';
};

type DomainRecord = {
  id: string;
  domain: string;
};

type ActivityRecord = {
  id: string;
  activityType: string;
  message: string;
  createdAt: string;
};

type DashboardWebsitesResponse = {
  websites: WebsiteRecord[];
  domains: DomainRecord[];
  activities: ActivityRecord[];
  templates: TemplateRecord[];
};

const statusConfig: Record<
  WebsiteRecord['status'],
  {
    label: string;
    icon: typeof CheckCircle2;
    bgColor: string;
    textColor: string;
    borderColor: string;
    animate?: boolean;
  }
> = {
  ready: {
    label: 'Ready',
    icon: CheckCircle2,
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20',
  },
  provisioning: {
    label: 'Setting Up',
    icon: Loader2,
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/20',
    animate: true,
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/20',
  },
  suspended: {
    label: 'Suspended',
    icon: PauseCircle,
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500',
    borderColor: 'border-orange-500/20',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
    borderColor: 'border-red-500/20',
  },
};

const activityIcons: Record<string, typeof Activity> = {
  website_created: Rocket,
  domain_connected: Link2,
  payment_received: CreditCard,
  provisioning_complete: CheckCircle2,
};

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function displayDomain(website: Pick<WebsiteRecord, 'subdomain' | 'customDomain' | 'liveUrl'>) {
  return getDisplayDomain({
    subdomain: website.subdomain,
    customDomain: website.customDomain,
    liveUrl: website.liveUrl,
  });
}

export default function WebsitesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState<DashboardWebsitesResponse>({
    websites: [],
    domains: [],
    activities: [],
    templates: [],
  });

  const loadData = async () => {
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
        throw new Error(result.error || 'failed_to_load_websites');
      }

      setData({
        websites: Array.isArray(result.websites) ? result.websites : [],
        domains: Array.isArray(result.domains) ? result.domains : [],
        activities: Array.isArray(result.activities) ? result.activities : [],
        templates: Array.isArray(result.templates) ? result.templates : [],
      });
    } catch (error) {
      console.error('[dashboard/websites] failed to load', error);
      setErrorMessage('Failed to load websites from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const websites = data.websites;
  const domains = data.domains;
  const activities = data.activities;
  const templates = data.templates;

  const filteredWebsites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return websites;
    }

    return websites.filter((website) => {
      return (
        website.projectName.toLowerCase().includes(query) ||
        website.templateName.toLowerCase().includes(query) ||
        website.subdomain.toLowerCase().includes(query) ||
        (website.customDomain || '').toLowerCase().includes(query)
      );
    });
  }, [searchQuery, websites]);

  const totalWebsites = websites.length;
  const activeWebsites = websites.filter((website) => website.status === 'ready').length;
  const provisioningWebsites = websites.filter(
    (website) => website.status === 'provisioning' || website.status === 'pending',
  ).length;
  const connectedDomains = domains.length;

  const getTemplateStack = (website: WebsiteRecord) => {
    if (website.templateStack) {
      return website.templateStack;
    }
    const template = templates.find((item) => item.id === website.templateId);
    return template?.stack || 'Next.js';
  };

  const renderStatusBadge = (status: WebsiteRecord['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge
        variant="outline"
        className={`${config.bgColor} ${config.textColor} ${config.borderColor} gap-1.5 font-medium`}
      >
        <Icon className={`w-3 h-3 ${config.animate ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-10 text-center text-muted-foreground">Loading websites...</CardContent>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="py-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="space-y-3">
              <p className="font-medium text-red-500">{errorMessage}</p>
              <Button size="sm" variant="outline" onClick={loadData}>
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Websites</h1>
          <p className="text-muted-foreground">Manage your websites and setup progress.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/templates">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Launch New Website
            </Button>
          </Link>
          <Link href="/dashboard/domains">
            <Button variant="outline">
              <Link2 className="w-4 h-4 mr-2" />
              Connect Domain
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Total Websites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalWebsites}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all plans</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Active Websites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{activeWebsites}</div>
            <p className="text-xs text-muted-foreground mt-1">Live and running</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4" />
              Setting Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{provisioningWebsites}</div>
            <p className="text-xs text-muted-foreground mt-1">Being set up</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Domains Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{connectedDomains}</div>
            <p className="text-xs text-muted-foreground mt-1">Linked domains</p>
          </CardContent>
        </Card>
      </div>

      {websites.length === 0 ? (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Globe className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">You don&apos;t have any websites yet.</h3>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Start from the template gallery and launch your first website.
            </p>
            <Link href="/templates">
              <Button size="lg">
                <Search className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search websites..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredWebsites.length} website{filteredWebsites.length !== 1 ? 's' : ''}
                </span>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'cards')}>
                  <TabsList className="h-9">
                    <TabsTrigger value="table" className="h-7 px-3">
                      <LayoutList className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="cards" className="h-7 px-3">
                      <LayoutGrid className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {viewMode === 'table' ? (
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>Website</TableHead>
                          <TableHead>Template</TableHead>
                          <TableHead>Stack</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Domain</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Renewal</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWebsites.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                              No websites found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredWebsites.map((website) => (
                            <TableRow key={website.id} className="border-border">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-primary" />
                                  </div>
                                  <span className="font-semibold">{website.projectName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{website.templateName}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{getTemplateStack(website)}</Badge>
                              </TableCell>
                              <TableCell>{renderStatusBadge(website.status)}</TableCell>
                              <TableCell>{displayDomain(website)}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {formatDate(website.createdAt)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {formatDate(website.renewalDate)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {website.status === 'ready' && website.liveUrl && (
                                      <DropdownMenuItem asChild>
                                        <a href={website.liveUrl} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="w-4 h-4 mr-2" />
                                          Open Website
                                        </a>
                                      </DropdownMenuItem>
                                    )}
                                    {website.status === 'ready' && website.dashboardUrl && (
                                      <DropdownMenuItem asChild>
                                        <a
                                          href={website.dashboardUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <LayoutDashboard className="w-4 h-4 mr-2" />
                                          Open Dashboard
                                        </a>
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                      <Link href="/dashboard/domains">
                                        <Link2 className="w-4 h-4 mr-2" />
                                        Manage Domain
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href="/dashboard/billing">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Billing
                                      </Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredWebsites.map((website) => {
                  const stack = getTemplateStack(website);
                  return (
                    <Card
                      key={website.id}
                      className="bg-card border-border hover:border-primary/30 transition-colors group"
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {website.projectName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{website.templateName}</p>
                          </div>
                          <Badge variant="secondary">{stack}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{displayDomain(website)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          {renderStatusBadge(website.status)}
                          {website.status === 'ready' && website.liveUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={website.liveUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Visit
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                ) : (
                  <div className="space-y-4">
                    {activities.slice(0, 6).map((activity) => {
                      const Icon = activityIcons[activity.activityType] || AlertCircle;
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{activity.message}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Separator className="my-4" />
                <Button variant="ghost" className="w-full" size="sm" asChild>
                  <Link href="/dashboard/activity">
                    View All Activity
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">All Systems</span>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  >
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SSL Certificates</span>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CDN Status</span>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  >
                    Healthy
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
