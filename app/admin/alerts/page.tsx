'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Trash2, Zap, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  ADMIN_NOTIFICATION_WINDOW_EVENT,
  type RealtimeNotificationPayload,
} from '@/lib/realtime/events';

type DeploymentRule = {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

type ScheduledJob = {
  id: string;
  name: string;
  schedule: string;
  type: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type WebhookConfig = {
  url: string | null;
  events: string[];
  enabled: boolean;
  updatedAt: string;
};

type AutomationResponse = {
  rules: DeploymentRule[];
  jobs: ScheduledJob[];
  webhook: WebhookConfig;
};

const statusConfig = {
  completed: { badge: 'bg-green-500/10 text-green-600 border-green-500/30' },
  pending: { badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  running: { badge: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  failed: { badge: 'bg-red-500/10 text-red-600 border-red-500/30' },
};

const WEBHOOK_EVENTS = [
  'provisioning_started',
  'provisioning_completed',
  'provisioning_failed',
  'ssl_issued',
] as const;

export default function AlertsPage() {
  const [data, setData] = useState<AutomationResponse>({ rules: [], jobs: [], webhook: { url: null, events: [], enabled: false, updatedAt: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/alerts', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_alerts'));
      }

      const next: AutomationResponse = {
        rules: Array.isArray(result?.rules) ? result.rules : [],
        jobs: Array.isArray(result?.jobs) ? result.jobs : [],
        webhook: result?.webhook || { url: null, events: [], enabled: false, updatedAt: '' },
      };

      setData(next);
      setWebhookUrl(next.webhook.url || '');
      setWebhookEnabled(Boolean(next.webhook.enabled));
      setWebhookEvents(Array.isArray(next.webhook.events) ? next.webhook.events : []);
    } catch (error) {
      console.error('[admin/alerts] failed to load', error);
      setErrorMessage('Failed to load alerts and automation from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleAdminNotification = (event: Event) => {
      const payload = (event as CustomEvent<RealtimeNotificationPayload>).detail;
      if (!payload || payload.category !== 'admin.alerts') {
        return;
      }

      void loadData();
    };

    window.addEventListener(
      ADMIN_NOTIFICATION_WINDOW_EVENT,
      handleAdminNotification as EventListener,
    );

    return () => {
      window.removeEventListener(
        ADMIN_NOTIFICATION_WINDOW_EVENT,
        handleAdminNotification as EventListener,
      );
    };
  }, []);

  const enabledRules = useMemo(() => data.rules.filter((rule) => rule.enabled).length, [data.rules]);
  const enabledJobs = useMemo(() => data.jobs.filter((job) => job.enabled).length, [data.jobs]);

  const createQuickRule = async () => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          entity: 'rule',
          name: `Rule ${Date.now().toString(36).slice(-4).toUpperCase()}`,
          condition: 'Queue job failed',
          action: 'Retry after 5 minutes',
          enabled: true,
          priority: data.rules.length + 1,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_create_rule'));
      }

      await loadData();
      setSuccessMessage('Rule created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create rule');
    } finally {
      setSaving(false);
    }
  };

  const createQuickJob = async () => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          entity: 'job',
          name: `Job ${Date.now().toString(36).slice(-4).toUpperCase()}`,
          schedule: 'Every day at 03:00 AM',
          type: 'backup',
          status: 'pending',
          enabled: true,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_create_job'));
      }

      await loadData();
      setSuccessMessage('Job created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  const patchRule = async (id: string, payload: Record<string, unknown>, successText: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/alerts', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entity: 'rule', id, ...payload }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(result?.error || 'failed_to_update_rule'));

      await loadData();
      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update rule');
    }
  };

  const removeRule = async (id: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/alerts?entity=rule&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(result?.error || 'failed_to_delete_rule'));

      await loadData();
      setSuccessMessage('Rule deleted successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete rule');
    }
  };

  const patchJob = async (id: string, payload: Record<string, unknown>, successText: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/alerts', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entity: 'job', id, ...payload }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(result?.error || 'failed_to_update_job'));

      await loadData();
      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update job');
    }
  };

  const removeJob = async (id: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/alerts?entity=job&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(result?.error || 'failed_to_delete_job'));

      await loadData();
      setSuccessMessage('Job deleted successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete job');
    }
  };

  const saveWebhook = async () => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/alerts', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          entity: 'webhook',
          url: webhookUrl.trim() || null,
          events: webhookEvents,
          enabled: webhookEnabled,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_save_webhook'));
      }

      await loadData();
      setSuccessMessage('Webhook configuration saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save webhook');
    } finally {
      setSaving(false);
    }
  };

  const toggleWebhookEvent = (eventName: string) => {
    setWebhookEvents((previous) =>
      previous.includes(eventName)
        ? previous.filter((event) => event !== eventName)
        : [...previous, eventName],
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts & Automation</h1>
        <p className="text-muted-foreground">Manage deployment rules and scheduled jobs</p>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Deployment Rules</h2>
            <p className="text-sm text-muted-foreground">{enabledRules} of {data.rules.length} rules enabled</p>
          </div>
          <Button className="gap-2" disabled={saving} onClick={createQuickRule}>
            <Plus className="w-4 h-4" />
            New Rule
          </Button>
        </div>

        {loading ? (
          <Card><CardContent className="py-6 text-muted-foreground">Loading rules...</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {data.rules.map((rule) => (
              <Card key={rule.id} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-accent" />
                        <div>
                          <h3 className="font-semibold">{rule.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            If: {rule.condition} -&gt; Then: {rule.action}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">Priority {rule.priority}</Badge>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => patchRule(rule.id, { enabled: checked }, 'Rule updated.')}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => patchRule(rule.id, { priority: Math.max(1, rule.priority - 1) }, 'Rule priority updated.')}>Increase priority</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => patchRule(rule.id, { priority: rule.priority + 1 }, 'Rule priority updated.')}>Decrease priority</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => removeRule(rule.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Scheduled Jobs</h2>
            <p className="text-sm text-muted-foreground">{enabledJobs} enabled jobs</p>
          </div>
          <Button className="gap-2" disabled={saving} onClick={createQuickJob}>
            <Plus className="w-4 h-4" />
            New Job
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Job Name</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Schedule</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Last Run</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Next Run</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map((job) => {
                const config = statusConfig[job.status];
                return (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 font-semibold">{job.name}</td>
                    <td className="py-4 px-4"><Badge variant="outline" className="text-xs capitalize">{job.type}</Badge></td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">{job.schedule}</td>
                    <td className="py-4 px-4 text-xs">{job.lastRun || '-'}</td>
                    <td className="py-4 px-4 text-xs">{job.nextRun || '-'}</td>
                    <td className="py-4 px-4"><Badge variant="outline" className={`text-xs ${config.badge}`}>{job.status}</Badge></td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => patchJob(job.id, { enabled: !job.enabled }, 'Job state updated.')}>{job.enabled ? 'Disable' : 'Enable'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => patchJob(job.id, { status: 'completed' }, 'Job marked completed.')}>Mark completed</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => removeJob(job.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete
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
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Send provisioning events to external systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Webhook URL</label>
            <Input
              type="url"
              placeholder="https://your-system.com/webhooks/provisioning"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Enabled</label>
            <div>
              <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Events to Send</label>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((eventName) => (
                <label key={eventName} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={webhookEvents.includes(eventName)}
                    onChange={() => toggleWebhookEvent(eventName)}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{eventName.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={saveWebhook} disabled={saving}>
            <Bell className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
