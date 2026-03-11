'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Download, MoreVertical, RotateCcw, Database, HardDrive, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';

type BackupRecord = {
  id: string;
  website: string;
  server: string;
  sizeMb: number;
  sizeLabel: string;
  status: 'completed' | 'pending' | 'failed';
  created: string;
  expiry: string | null;
  type: 'full' | 'incremental';
};

type NewBackupForm = {
  website: string;
  server: string;
  type: 'full' | 'incremental';
};

const INITIAL_FORM: NewBackupForm = {
  website: '',
  server: 'US East Primary',
  type: 'full',
};

const statusConfig = {
  completed: { badge: 'bg-green-500/10 text-green-600 border-green-500/30', icon: 'OK' },
  pending: { badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: '...' },
  failed: { badge: 'bg-red-500/10 text-red-600 border-red-500/30', icon: 'X' },
};

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<NewBackupForm>(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadBackups = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/backups', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_backups'));
      }

      setBackups(Array.isArray(result?.backups) ? result.backups : []);
    } catch (error) {
      console.error('[admin/backups] failed to load', error);
      setErrorMessage('Failed to load backups from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const completed = useMemo(() => backups.filter((backup) => backup.status === 'completed').length, [backups]);
  const pending = useMemo(() => backups.filter((backup) => backup.status === 'pending').length, [backups]);
  const totalSizeMb = useMemo(() => backups.reduce((sum, backup) => sum + Number(backup.sizeMb || 0), 0), [backups]);

  const createBackup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_create_backup'));
      }

      if (result?.backup) {
        setBackups((previous) => [result.backup as BackupRecord, ...previous]);
      } else {
        await loadBackups();
      }

      setForm(INITIAL_FORM);
      setIsCreateOpen(false);
      setSuccessMessage('Backup created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create backup');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: BackupRecord['status'], successText: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/backups', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_update_backup'));
      }

      if (result?.backup) {
        const updated = result.backup as BackupRecord;
        setBackups((previous) => previous.map((backup) => (backup.id === updated.id ? updated : backup)));
      } else {
        await loadBackups();
      }

      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update backup');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backups & Exports</h1>
          <p className="text-muted-foreground">Manage snapshots and data exports</p>
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
              New Backup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Backup</DialogTitle>
              <DialogDescription>Store a new backup record in MySQL backend.</DialogDescription>
            </DialogHeader>
            <form onSubmit={createBackup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-website">Website</Label>
                <Input
                  id="backup-website"
                  value={form.website}
                  onChange={(event) => setForm((p) => ({ ...p, website: event.target.value }))}
                  placeholder="Marketing Website"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-server">Server</Label>
                <Input
                  id="backup-server"
                  value={form.server}
                  onChange={(event) => setForm((p) => ({ ...p, server: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-type">Type</Label>
                <select
                  id="backup-type"
                  value={form.type}
                  onChange={(event) => setForm((p) => ({ ...p, type: event.target.value as NewBackupForm['type'] }))}
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm"
                >
                  <option value="full">full</option>
                  <option value="incremental">incremental</option>
                </select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving || !form.website.trim()}>{saving ? 'Saving...' : 'Create'}</Button>
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
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Total Backups</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{backups.length}</p>
              <Database className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Completed</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-green-500">{completed}</p>
              <HardDrive className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Total Size</p>
            <p className="text-2xl font-bold">{(totalSizeMb / 1024).toFixed(1)} GB</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Backups ({backups.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending})</TabsTrigger>
          <TabsTrigger value="retention">Retention Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {loading ? (
            <Card><CardContent className="py-8 text-muted-foreground">Loading backups...</CardContent></Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Website</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Server</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Expiry</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => {
                    const config = statusConfig[backup.status];
                    return (
                      <tr key={backup.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 font-semibold">{backup.website}</td>
                        <td className="py-4 px-4 text-muted-foreground">{backup.server}</td>
                        <td className="py-4 px-4 font-mono text-xs">{backup.sizeLabel}</td>
                        <td className="py-4 px-4"><Badge variant="outline" className="capitalize text-xs">{backup.type}</Badge></td>
                        <td className="py-4 px-4 text-xs">{backup.created}</td>
                        <td className="py-4 px-4 text-xs">{backup.expiry || '-'}</td>
                        <td className="py-4 px-4"><Badge variant="outline" className={config.badge}>{config.icon} {backup.status}</Badge></td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="gap-2">
                                <Download className="w-4 h-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => updateStatus(backup.id, 'completed', 'Backup marked completed.') }>
                                <RotateCcw className="w-4 h-4" />
                                Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => updateStatus(backup.id, 'failed', 'Backup marked failed.') }>
                                <RotateCcw className="w-4 h-4" />
                                Mark Failed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2" onClick={() => updateStatus(backup.id, 'pending', 'Backup queued again.') }>
                                Queue Again
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
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {backups.filter((backup) => backup.status === 'pending').map((backup) => (
            <Card key={backup.id} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{backup.website}</p>
                    <p className="text-xs text-muted-foreground mt-1">{backup.server} • {backup.sizeLabel}</p>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Backup Retention Policy</CardTitle>
              <CardDescription>Policy UI is shown; backup records are real MySQL data.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Retention policy persistence can be added in the next phase. Current page is fully connected for backup records and statuses.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
