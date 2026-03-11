'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Server, Cpu, HardDrive, Activity, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ServerRecord = {
  id: string;
  name: string;
  region: string;
  provider: string;
  ipAddress: string;
  operatingSystem: string;
  stackSupport: string[];
  status: 'healthy' | 'degraded' | 'offline' | 'maintenance';
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  websitesCount: number;
  lastSyncAt: string | null;
  provisioningEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

function formatDateTime(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [serverId, setServerId] = useState<string | null>(null);
  const [server, setServer] = useState<ServerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    params.then(({ id }) => setServerId(id));
  }, [params]);

  useEffect(() => {
    if (!serverId) return;

    const loadServer = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch(`/api/admin/servers/${serverId}`, { cache: 'no-store' });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 404) {
            setServer(null);
            return;
          }
          throw new Error(String(result?.error || 'failed_to_load_server'));
        }

        setServer((result?.server as ServerRecord) || null);
      } catch (error) {
        console.error('[admin/servers/:id] failed to load server', error);
        setErrorMessage('Failed to load server from MySQL.');
      } finally {
        setLoading(false);
      }
    };

    loadServer();
  }, [serverId]);

  if (loading) {
    return <div className="py-8 text-muted-foreground">Loading server...</div>;
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Link href="/admin/servers">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Servers
          </Button>
        </Link>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Server not found</h1>
        <Link href="/admin/servers">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Servers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/servers">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{server.name}</h1>
          <p className="text-muted-foreground">{server.provider} • {server.region}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
          <CardContent><Badge variant="outline">{server.status}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Websites</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{server.websitesCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Provisioning</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{server.provisioningEnabled ? 'ON' : 'OFF'}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Last Sync</CardTitle></CardHeader>
          <CardContent><p className="text-sm font-medium">{formatDateTime(server.lastSyncAt)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2"><Cpu className="w-4 h-4" />CPU</span><span>{server.cpuUsage}%</span></div>
            <Progress value={server.cpuUsage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2"><Activity className="w-4 h-4" />RAM</span><span>{server.ramUsage}%</span></div>
            <Progress value={server.ramUsage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2"><HardDrive className="w-4 h-4" />Disk</span><span>{server.diskUsage}%</span></div>
            <Progress value={server.diskUsage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">ID:</span> {server.id}</p>
          <p><span className="text-muted-foreground">IP:</span> {server.ipAddress}</p>
          <p><span className="text-muted-foreground">Operating System:</span> {server.operatingSystem}</p>
          <p><span className="text-muted-foreground">Stacks:</span> {server.stackSupport.join(', ') || '-'}</p>
          <p><span className="text-muted-foreground">Created:</span> {formatDateTime(server.createdAt)}</p>
          <p><span className="text-muted-foreground">Updated:</span> {formatDateTime(server.updatedAt)}</p>
        </CardContent>
      </Card>

      {server.status === 'offline' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>This server is currently offline and may impact deployments.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
