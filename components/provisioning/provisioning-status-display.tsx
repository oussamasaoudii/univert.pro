// User-Facing Provisioning Status Display
// Real-time progress, logs, and deployment information

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Info,
  CheckIcon,
} from 'lucide-react';
import type { ProvisioningJobRow } from '@/lib/db/types';
import type { JobLogEntry } from '@/lib/provisioning/types';
import { useProvisioningProgress, useProvisioningLogs } from '@/hooks/use-provisioning-status';

interface ProvisioningStatusDisplayProps {
  job: ProvisioningJobRow | null;
  logs: JobLogEntry[];
  isLoading: boolean;
  isComplete: boolean;
  isFailed: boolean;
}

const stepDescriptions: Record<string, string> = {
  'validating_config': 'Validating your configuration',
  'allocating_server': 'Allocating server resources',
  'creating_database': 'Setting up database',
  'setting_up_environment': 'Configuring environment',
  'deploying_application': 'Deploying your application',
  'configuring_domain': 'Configuring domain',
  'setting_up_ssl': 'Setting up SSL certificate',
  'finalizing': 'Finalizing deployment',
  'completed': 'Deployment complete',
};

const statusColors: Record<string, string> = {
  'pending': 'bg-gray-100 text-gray-800',
  'queued': 'bg-blue-100 text-blue-800',
  'running': 'bg-amber-100 text-amber-800',
  'completed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'canceled': 'bg-gray-100 text-gray-800',
};

const logLevelColors: Record<string, string> = {
  'info': 'text-blue-600',
  'warning': 'text-amber-600',
  'error': 'text-red-600',
  'success': 'text-green-600',
};

const logLevelIcons: Record<string, any> = {
  'info': Info,
  'warning': AlertTriangle,
  'error': AlertCircle,
  'success': CheckIcon,
};

export function ProvisioningStatusDisplay({
  job,
  logs,
  isLoading,
  isComplete,
  isFailed,
}: ProvisioningStatusDisplayProps) {
  const [logsExpanded, setLogsExpanded] = useState(false);
  const displayProgress = useProvisioningProgress(job?.progress || 0, isComplete);
  const {
    logs: filteredLogs,
    stats,
    filterLevel,
    setFilterLevel,
  } = useProvisioningLogs(logs);

  if (!job) {
    return (
      <Card className="bg-background border-border">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No provisioning job found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (startedAt?: string | null, completedAt?: string | null) => {
    if (!startedAt) return 'Not started';
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="bg-background border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>Deployment Status</CardTitle>
                <Badge className={statusColors[job.status] || statusColors['pending']}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                {isLoading ? 'Updating...' : isComplete ? 'Deployment complete!' : isFailed ? 'Deployment failed' : 'Provisioning in progress'}
              </CardDescription>
            </div>

            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {isComplete && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {isFailed && <AlertCircle className="h-5 w-5 text-red-600" />}
          </div>
        </CardHeader>
      </Card>

      {/* Progress Section */}
      <Card className="bg-background border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{displayProgress}%</span>
              <span className="text-xs text-muted-foreground">
                {stepDescriptions[job.current_step || 'pending'] || 'Provisioning...'}
              </span>
            </div>
            <Progress value={displayProgress} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm font-medium">{job.started_at ? new Date(job.started_at).toLocaleTimeString() : '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{formatDuration(job.started_at, job.completed_at)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current Step</p>
              <p className="text-sm font-medium truncate">{stepDescriptions[job.current_step || 'pending']?.split(' ').slice(-1)[0] || 'Waiting'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Attempts</p>
              <p className="text-sm font-medium">{job.retry_count || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {isFailed && job.error_message && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-3">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <CardTitle className="text-base text-destructive">Deployment Failed</CardTitle>
                <CardDescription className="text-destructive/80">{job.error_message}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Logs Section */}
      <Card className="bg-background border-border">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setLogsExpanded(!logsExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <CardTitle className="text-base">Deployment Logs</CardTitle>
              <Badge variant="outline">{stats.total} entries</Badge>
            </div>
            {logsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>

        {logsExpanded && (
          <CardContent className="space-y-3">
            {/* Log Filters */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'info', 'warning', 'error', 'success'] as const).map(level => (
                <Button
                  key={level}
                  variant={filterLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterLevel(level)}
                  className="text-xs"
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                  {level !== 'all' && ` (${stats[level as keyof typeof stats]})`}
                </Button>
              ))}
            </div>

            {/* Log Entries */}
            <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
              <div className="max-h-96 overflow-y-auto font-mono text-xs space-y-0">
                {filteredLogs.length === 0 ? (
                  <div className="p-4 text-muted-foreground text-center">No logs to display</div>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const IconComponent = logLevelIcons[log.level];
                    return (
                      <div
                        key={log.id || idx}
                        className="px-3 py-2 border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors flex gap-2"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {IconComponent && <IconComponent className={`h-3 w-3 ${logLevelColors[log.level]}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            {log.stepName && <span className="text-blue-600 text-xs font-medium">[{log.stepName}]</span>}
                          </div>
                          <p className="text-foreground break-words whitespace-pre-wrap">{log.message}</p>
                          {log.details && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground text-xs">Details</summary>
                              <pre className="mt-1 p-2 bg-background rounded border border-border/50 text-xs overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Log Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const logsText = logs
                    .map(l => `[${l.level.toUpperCase()}] ${new Date(l.timestamp).toISOString()} [${l.stepName || 'general'}] ${l.message}`)
                    .join('\n');
                  navigator.clipboard.writeText(logsText);
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Logs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const logsText = logs
                    .map(l => `[${l.level.toUpperCase()}] ${new Date(l.timestamp).toISOString()} [${l.stepName || 'general'}] ${l.message}`)
                    .join('\n');
                  const element = document.createElement('a');
                  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logsText));
                  element.setAttribute('download', `deployment-logs-${job.id}.txt`);
                  element.style.display = 'none';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              {isComplete ? (
                <p>Your website is now live! You can access it at your configured domain.</p>
              ) : isFailed ? (
                <p>Deployment failed. Check the logs above for details. Contact support if you need help.</p>
              ) : (
                <p>Deployment in progress. This typically takes 2-5 minutes. Do not close this page.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
