'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Server,
  MoreVertical,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Cpu,
  RefreshCw,
  Plus,
  AlertTriangle,
  Check,
} from 'lucide-react';

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

type NewServerForm = {
  name: string;
  region: string;
  provider: string;
  ipAddress: string;
  operatingSystem: string;
  stackSupport: string;
};

const INITIAL_FORM: NewServerForm = {
  name: '',
  region: 'us-east-1',
  provider: 'AWS',
  ipAddress: '',
  operatingSystem: 'Ubuntu 22.04',
  stackSupport: 'Next.js,Laravel',
};

const statusConfig = {
  healthy: {
    badge: 'bg-green-500/10 text-green-600 border-green-500/30',
    icon: CheckCircle2,
  },
  degraded: {
    badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    icon: AlertCircle,
  },
  offline: { badge: 'bg-red-500/10 text-red-600 border-red-500/30', icon: XCircle },
  maintenance: {
    badge: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
    icon: AlertCircle,
  },
};

function formatDateTime(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ServersPage() {
  const [servers, setServers] = useState<ServerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<NewServerForm>(INITIAL_FORM);

  const loadServers = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/servers', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_servers'));
      }

      setServers(Array.isArray(result?.servers) ? result.servers : []);
    } catch (error) {
      console.error('[admin/servers] failed to load', error);
      setErrorMessage('Failed to load servers from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const healthyCount = useMemo(
    () => servers.filter((server) => server.status === 'healthy').length,
    [servers],
  );
  const degradedCount = useMemo(
    () => servers.filter((server) => server.status === 'degraded').length,
    [servers],
  );
  const offlineCount = useMemo(
    () => servers.filter((server) => server.status === 'offline').length,
    [servers],
  );
  const totalWebsites = useMemo(
    () => servers.reduce((sum, server) => sum + server.websitesCount, 0),
    [servers],
  );

  const createServer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/servers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          stackSupport: form.stackSupport
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_create_server'));
      }

      if (result?.server) {
        setServers((previous) => [...previous, result.server as ServerRecord]);
      } else {
        await loadServers();
      }

      setForm(INITIAL_FORM);
      setIsCreateOpen(false);
      setSuccessMessage('Server created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create server');
    } finally {
      setSaving(false);
    }
  };

  const updateServer = async (
    serverId: string,
    payload: Record<string, unknown>,
    successText: string,
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/servers/${serverId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_update_server'));
      }

      if (result?.server) {
        const updated = result.server as ServerRecord;
        setServers((previous) => previous.map((server) => (server.id === updated.id ? updated : server)));
      } else {
        await loadServers();
      }

      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update server');
    }
  };

  const removeServer = async (serverId: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/servers/${serverId}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_delete_server'));
      }

      setServers((previous) => previous.filter((server) => server.id !== serverId));
      setSuccessMessage('Server deleted successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete server');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servers</h1>
          <p className="text-muted-foreground">Manage infrastructure nodes and capacity</p>
        </div>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setForm(INITIAL_FORM);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Server
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Add Server</DialogTitle>
              <DialogDescription>This server will be stored in MySQL backend.</DialogDescription>
            </DialogHeader>
            <form onSubmit={createServer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server-name">Name</Label>
                <Input
                  id="server-name"
                  value={form.name}
                  onChange={(event) => setForm((p) => ({ ...p, name: event.target.value }))}
                  placeholder="US East Primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input value={form.region} onChange={(event) => setForm((p) => ({ ...p, region: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Input value={form.provider} onChange={(event) => setForm((p) => ({ ...p, provider: event.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IP Address</Label>
                  <Input value={form.ipAddress} onChange={(event) => setForm((p) => ({ ...p, ipAddress: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>OS</Label>
                  <Input value={form.operatingSystem} onChange={(event) => setForm((p) => ({ ...p, operatingSystem: event.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stack support (comma separated)</Label>
                <Input value={form.stackSupport} onChange={(event) => setForm((p) => ({ ...p, stackSupport: event.target.value }))} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !form.name.trim() || !form.ipAddress.trim()}>
                  {saving ? 'Saving...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert>
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Total Servers</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{servers.length}</p>
              <Server className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-green-400 uppercase mb-2">Healthy</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-green-400">{healthyCount}</p>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-yellow-400 uppercase mb-2">Degraded</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-yellow-400">{degradedCount}</p>
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Websites</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{totalWebsites}</p>
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Server Nodes</CardTitle>
          <CardDescription>Live data from MySQL</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading servers...</div>
          ) : servers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No servers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Server</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Region</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Stack</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">CPU</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">RAM</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Disk</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Websites</th>
                    <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.map((server) => {
                    const config = statusConfig[server.status];
                    const StatusIcon = config.icon;

                    return (
                      <tr key={server.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <Link href={`/admin/servers/${server.id}`} className="font-semibold hover:text-accent transition-colors">
                              {server.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{server.ipAddress}</p>
                            <p className="text-[11px] text-muted-foreground">Synced {formatDateTime(server.lastSyncAt)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {server.region}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {server.stackSupport.map((stack) => (
                              <Badge key={stack} variant="outline" className="text-xs">
                                {stack}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={`gap-1 ${config.badge}`}>
                            <StatusIcon className="w-3 h-3" />
                            {server.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <Cpu className="w-3 h-3 text-muted-foreground" />
                              <span className={server.cpuUsage > 80 ? 'text-red-500 font-semibold' : ''}>{server.cpuUsage}%</span>
                            </div>
                            <Progress value={server.cpuUsage} className="h-1.5" />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className={`text-xs ${server.ramUsage > 80 ? 'text-red-500 font-semibold' : ''}`}>{server.ramUsage}%</span>
                            <Progress value={server.ramUsage} className="h-1.5" />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className={`text-xs ${server.diskUsage > 90 ? 'text-red-500 font-semibold' : ''}`}>{server.diskUsage}%</span>
                            <Progress value={server.diskUsage} className="h-1.5" />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold">{server.websitesCount}</td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem
                                onClick={() =>
                                  updateServer(
                                    server.id,
                                    { provisioningEnabled: !server.provisioningEnabled },
                                    'Provisioning flag updated.',
                                  )
                                }
                              >
                                {server.provisioningEnabled ? 'Disable provisioning' : 'Enable provisioning'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateServer(
                                    server.id,
                                    {
                                      status: server.status === 'maintenance' ? 'healthy' : 'maintenance',
                                    },
                                    'Server status updated.',
                                  )
                                }
                              >
                                {server.status === 'maintenance' ? 'Mark Healthy' : 'Set Maintenance'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => removeServer(server.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && offlineCount > 0 && (
            <Alert className="mt-4 border-orange-500/30 bg-orange-500/5">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription>
                {offlineCount} server(s) are offline. Review infrastructure capacity and failover.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
