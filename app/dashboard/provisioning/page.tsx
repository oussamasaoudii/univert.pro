'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  Loader2,
  XCircle,
  ExternalLink,
  AlertCircle,
  Activity,
  Globe,
  Clock,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type WebsiteRecord = {
  id: string;
  projectName: string;
  templateName: string;
  templateStack: 'Laravel' | 'Next.js' | 'WordPress';
  status: 'pending' | 'provisioning' | 'ready' | 'suspended' | 'failed';
  liveUrl: string | null;
  createdAt: string;
};

const PROGRESS_BY_STATUS: Record<WebsiteRecord['status'], number> = {
  pending: 15,
  provisioning: 65,
  ready: 100,
  suspended: 100,
  failed: 0,
};

function formatDate(value: string) {
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

export default function ProvisioningPage() {
  const [websites, setWebsites] = useState<WebsiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadWebsites = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/dashboard/websites', {
        cache: 'no-store',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_websites'));
      }
      setWebsites(Array.isArray(result?.websites) ? result.websites : []);
    } catch (error) {
      console.error('[dashboard/provisioning] load failed', error);
      setErrorMessage('Failed to load provisioning data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites();
  }, []);

  const provisioningWebsites = useMemo(
    () =>
      websites.filter((website) => website.status === 'provisioning' || website.status === 'pending'),
    [websites],
  );
  const completedWebsites = useMemo(
    () => websites.filter((website) => website.status === 'ready'),
    [websites],
  );
  const failedWebsites = useMemo(
    () => websites.filter((website) => website.status === 'failed'),
    [websites],
  );

  const totalDeployments = websites.length;

  const renderProvisioningCard = (website: WebsiteRecord) => {
    const progressPercent = PROGRESS_BY_STATUS[website.status];
    const inProgress = website.status === 'pending' || website.status === 'provisioning';
    const failed = website.status === 'failed';
    const completed = website.status === 'ready';

    return (
      <Link key={website.id} href={`/dashboard/provisioning/${website.id}`}>
        <Card
          className={cn(
            'group bg-card border-border transition-all duration-200 cursor-pointer',
            inProgress && 'hover:border-blue-500/30',
            completed && 'hover:border-emerald-500/30',
            failed && 'border-red-500/20 hover:border-red-500/30',
          )}
        >
          <div
            className={cn(
              'h-1 rounded-t-lg',
              inProgress && 'bg-blue-500',
              completed && 'bg-emerald-500',
              failed && 'bg-red-500',
            )}
          />
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0',
                    inProgress && 'bg-blue-500/10 border-blue-500/20',
                    completed && 'bg-emerald-500/10 border-emerald-500/20',
                    failed && 'bg-red-500/10 border-red-500/20',
                  )}
                >
                  {inProgress ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  ) : completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground truncate">{website.projectName}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-wider border-transparent',
                        inProgress && 'bg-blue-500/10 text-blue-400',
                        completed && 'bg-emerald-500/10 text-emerald-400',
                        failed && 'bg-red-500/10 text-red-400',
                      )}
                    >
                      {website.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    {website.templateName} <span className="text-muted-foreground/50">•</span>{' '}
                    {website.templateStack}
                  </p>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Deployment progress</span>
                      <span className="font-medium">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatDate(website.createdAt)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Created</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground">Monitor and manage your website deployments</p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-secondary/20 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Globe className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDeployments}</p>
                <p className="text-xs text-muted-foreground">Total Sites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'border-border',
            provisioningWebsites.length > 0 ? 'bg-blue-500/5 border-blue-500/20' : 'bg-secondary/20',
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  provisioningWebsites.length > 0 ? 'bg-blue-500/10' : 'bg-secondary',
                )}
              >
                <Activity
                  className={cn(
                    'w-5 h-5',
                    provisioningWebsites.length > 0
                      ? 'text-blue-400 animate-pulse'
                      : 'text-muted-foreground',
                  )}
                />
              </div>
              <div>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    provisioningWebsites.length > 0 && 'text-blue-400',
                  )}
                >
                  {provisioningWebsites.length}
                </p>
                <p className="text-xs text-muted-foreground">Building</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{completedWebsites.length}</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'border-border',
            failedWebsites.length > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-secondary/20',
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  failedWebsites.length > 0 ? 'bg-red-500/10' : 'bg-secondary',
                )}
              >
                <XCircle
                  className={cn(
                    'w-5 h-5',
                    failedWebsites.length > 0 ? 'text-red-400' : 'text-muted-foreground',
                  )}
                />
              </div>
              <div>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    failedWebsites.length > 0 && 'text-red-400',
                  )}
                >
                  {failedWebsites.length}
                </p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList className="h-11 p-1 bg-secondary/50 border border-border">
          <TabsTrigger value="in-progress" className="h-9 px-4 gap-2">
            Building
            {provisioningWebsites.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">
                {provisioningWebsites.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="h-9 px-4 gap-2">
            Ready
            {completedWebsites.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                {completedWebsites.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="failed" className="h-9 px-4 gap-2">
            Failed
            {failedWebsites.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                {failedWebsites.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="mt-6 space-y-3">
          {loading ? (
            <Card className="bg-card border-border">
              <CardContent className="py-10 text-center text-muted-foreground">
                Loading deployments...
              </CardContent>
            </Card>
          ) : provisioningWebsites.length > 0 ? (
            provisioningWebsites.map(renderProvisioningCard)
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">All caught up</h3>
                <p className="text-sm text-muted-foreground">No deployments in progress</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedWebsites.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedWebsites.map((website) => (
                <Card key={website.id} className="group bg-card border-border hover:border-emerald-500/30 transition-all duration-200">
                  <div className="h-1 bg-emerald-500 rounded-t-lg" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-transparent">
                        Ready
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground mb-1 truncate">{website.projectName}</p>
                    <p className="text-xs text-muted-foreground mb-4 truncate">{website.templateName}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(website.createdAt)}
                      </span>
                      <span>{website.templateStack}</span>
                    </div>
                    {website.liveUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 gap-2 text-xs"
                        onClick={() => window.open(website.liveUrl as string, '_blank')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Visit Website
                      </Button>
                    ) : (
                      <Link href={`/dashboard/provisioning/${website.id}`}>
                        <Button variant="outline" size="sm" className="w-full h-9 text-xs">
                          View Details
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Globe className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No deployed websites yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="failed" className="mt-6 space-y-3">
          {failedWebsites.length > 0 ? (
            failedWebsites.map(renderProvisioningCard)
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No failed deployments</h3>
                <p className="text-sm text-muted-foreground">Everything looks healthy.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
