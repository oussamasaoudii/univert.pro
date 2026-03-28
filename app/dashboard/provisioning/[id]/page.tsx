'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProvisioningStatusDisplay } from '@/components/provisioning/provisioning-status-display';
import type { ProvisioningJobRow } from '@/lib/db/types';
import type { JobLogEntry } from '@/lib/provisioning/types';

interface ProvisioningPageProps {
  params: Promise<{
    id: string;
  }>;
}

type WebsiteRecord = {
  id: string;
  projectName: string;
  templateName: string;
  templateStack: 'Laravel' | 'Next.js' | 'WordPress';
  status: 'pending' | 'provisioning' | 'ready' | 'suspended' | 'failed';
  subdomain: string;
  customDomain: string | null;
  liveUrl: string | null;
  dashboardUrl: string | null;
  provisioningJobId: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProvisioningResponse = {
  website: WebsiteRecord;
  job: ProvisioningJobRow | null;
  logs: JobLogEntry[];
  queue: {
    id: string;
    status: string;
    attempt_count?: number;
    max_attempts?: number;
  } | null;
};

export default function ProvisioningStatusPage({ params }: ProvisioningPageProps) {
  const { id } = use(params);
  const [data, setData] = useState<ProvisioningResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        const response = await fetch(`/api/provisioning/website/${id}`, {
          cache: 'no-store',
          credentials: 'include',
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(String(result?.error || 'failed_to_load_provisioning'));
        }

        if (!isMounted) {
          return;
        }

        setData(result as ProvisioningResponse);
        setErrorMessage('');

        const jobStatus = result?.job?.status;
        if (intervalId && (jobStatus === 'completed' || jobStatus === 'failed' || jobStatus === 'canceled')) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.error('[dashboard/provisioning/:id] load failed', error);
        setErrorMessage('Failed to load website setup status.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    intervalId = setInterval(load, 3000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id]);

  const isComplete = data?.job?.status === 'completed' || data?.website?.status === 'ready';
  const isFailed = data?.job?.status === 'failed' || data?.website?.status === 'failed';
  const statusBadge = useMemo(() => {
    if (!data?.website) return null;

    if (isComplete) {
      return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Ready</Badge>;
    }
    if (isFailed) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="outline">Setting Up</Badge>;
  }, [data?.website, isComplete, isFailed]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading setup status...</p>
      </div>
    );
  }

  if (!data?.website) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold">Setup unavailable</h1>
              <p className="text-muted-foreground mt-2">{errorMessage || 'No website setup record found.'}</p>
            </div>
            <Link href="/dashboard/provisioning">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Website Setup
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link href="/dashboard/provisioning">Website Setup</Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{data.website.projectName}</h1>
          <p className="text-muted-foreground mt-1">
            {data.website.templateName} ({data.website.templateStack})
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          {data.website.liveUrl && (
            <Link href={data.website.liveUrl} target="_blank">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Visit Site
              </Button>
            </Link>
          )}
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <ProvisioningStatusDisplay
        job={data.job}
        logs={data.logs}
        isLoading={loading}
        isComplete={Boolean(isComplete)}
        isFailed={Boolean(isFailed)}
      />
    </main>
  );
}
