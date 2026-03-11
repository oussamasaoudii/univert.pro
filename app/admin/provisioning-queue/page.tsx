'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

type QueueJob = {
  id: string;
  website: string;
  status: 'running' | 'pending' | 'failed' | 'completed';
  progress: number;
  step: string;
  server: string;
  created: string;
  eta: string | null;
  error: string | null;
  retries: number;
  latestLog: string | null;
};

type QueueResponse = {
  jobs: QueueJob[];
  running: QueueJob[];
  pending: QueueJob[];
  failed: QueueJob[];
  stats: {
    running: number;
    pending: number;
    failed: number;
    queueHealth: number;
  };
};

export default function ProvisioningQueuePage() {
  const [data, setData] = useState<QueueResponse>({
    jobs: [],
    running: [],
    pending: [],
    failed: [],
    stats: { running: 0, pending: 0, failed: 0, queueHealth: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/provisioning-queue', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_queue'));
      }

      setData(result as QueueResponse);
    } catch (error) {
      console.error('[admin/provisioning-queue] failed to load', error);
      setErrorMessage('Failed to load provisioning queue from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const running = useMemo(() => data.running || [], [data.running]);
  const pending = useMemo(() => data.pending || [], [data.pending]);
  const failed = useMemo(() => data.failed || [], [data.failed]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provisioning Queue</h1>
        <p className="text-muted-foreground">Monitor deployments and automation jobs</p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border"><CardContent className="p-5"><p className="text-xs font-medium text-muted-foreground uppercase mb-2">Running</p><div className="flex items-end justify-between"><p className="text-2xl font-bold">{data.stats.running}</p><Zap className="w-5 h-5 text-accent" /></div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-5"><p className="text-xs font-medium text-muted-foreground uppercase mb-2">Pending</p><div className="flex items-end justify-between"><p className="text-2xl font-bold">{data.stats.pending}</p><Clock className="w-5 h-5 text-yellow-500" /></div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-5"><p className="text-xs font-medium text-muted-foreground uppercase mb-2">Failed (Recent)</p><div className="flex items-end justify-between"><p className="text-2xl font-bold text-red-500">{data.stats.failed}</p><XCircle className="w-5 h-5 text-red-500" /></div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-5"><p className="text-xs font-medium text-muted-foreground uppercase mb-2">Queue Health</p><div className="flex items-end justify-between"><p className="text-2xl font-bold text-green-500">{data.stats.queueHealth}%</p><CheckCircle2 className="w-5 h-5 text-green-500" /></div></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="gap-2" onClick={loadQueue}>
          Refresh Queue
        </Button>
      </div>

      <Tabs defaultValue="running" className="w-full">
        <TabsList>
          <TabsTrigger value="running">Running ({running.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="running" className="space-y-3">
          {loading ? (
            <Card><CardContent className="py-8 text-muted-foreground">Loading queue...</CardContent></Card>
          ) : (
            running.map((job) => (
              <Card key={job.id} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{job.website}</p>
                        <p className="text-xs text-muted-foreground mt-1">{job.step}</p>
                        {job.latestLog && (
                          <p className="text-xs text-muted-foreground mt-2">{job.latestLog}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{job.progress}%</p>
                        <p className="text-xs text-muted-foreground">{job.eta || '-'}</p>
                      </div>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{job.server}</span>
                      <span>Started {job.created}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {pending.map((job) => (
            <Card key={job.id} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{job.website}</p>
                    <p className="text-xs text-muted-foreground mt-1">Queued at {job.created}</p>
                    {job.latestLog && (
                      <p className="text-xs text-muted-foreground mt-2">{job.latestLog}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />{job.eta || '-'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="failed" className="space-y-3">
          {failed.map((job) => (
            <Card key={job.id} className="bg-card border-red-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2"><XCircle className="w-5 h-5 text-red-500" /><p className="font-semibold">{job.website}</p></div>
                    <p className="text-sm text-red-500 mb-2">{job.error || 'Unknown error'}</p>
                    {job.latestLog && (
                      <p className="text-xs text-muted-foreground mb-2">{job.latestLog}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Failed {job.created} • {job.retries} retries • {job.server}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
