'use client';

import { GitCommit, GitBranch, Clock, CheckCircle2, XCircle, Timer, ExternalLink, MoreVertical, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeploymentHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'failed' | 'in_progress';
  initiatedBy: string;
  duration?: string;
  commit?: string;
  branch?: string;
}

interface DeploymentHistoryProps {
  entries: DeploymentHistoryEntry[];
  onRetry?: (id: string) => void;
}

const statusConfig = {
  success: { 
    icon: CheckCircle2, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10',
    label: 'Success' 
  },
  failed: { 
    icon: XCircle, 
    color: 'text-red-400', 
    bg: 'bg-red-500/10',
    label: 'Failed' 
  },
  in_progress: { 
    icon: Timer, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10',
    label: 'Building' 
  },
};

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DeploymentHistory({ entries, onRetry }: DeploymentHistoryProps) {
  if (entries.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GitCommit className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No deployment history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Deployment History</CardTitle>
            <CardDescription>Previous deployments and changes</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {entries.length} deployments
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {entries.map((entry, index) => {
            const status = statusConfig[entry.status];
            const StatusIcon = status.icon;
            const isCurrent = index === 0 && entry.status === 'success';

            return (
              <div
                key={entry.id}
                className={cn(
                  "group flex items-start gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors",
                  isCurrent && "bg-emerald-500/[0.02]"
                )}
              >
                {/* Status Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  status.bg
                )}>
                  <StatusIcon className={cn(
                    "w-5 h-5",
                    status.color,
                    entry.status === 'in_progress' && "animate-spin"
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider border-transparent",
                            status.color,
                            status.bg
                          )}
                        >
                          {status.label}
                        </Badge>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-transparent">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      {/* Action */}
                      <p className="font-medium text-sm text-foreground">
                        {entry.action}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTimestamp(entry.timestamp)}</span>
                        </div>
                        {entry.duration && (
                          <div className="flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5" />
                            <span>{entry.duration}</span>
                          </div>
                        )}
                        {entry.branch && (
                          <div className="flex items-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5" />
                            <span className="font-mono">{entry.branch}</span>
                          </div>
                        )}
                        {entry.commit && (
                          <div className="flex items-center gap-1.5">
                            <GitCommit className="w-3.5 h-3.5" />
                            <span className="font-mono">{entry.commit.slice(0, 7)}</span>
                          </div>
                        )}
                        <span>by {entry.initiatedBy}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {entry.status === 'success' && !isCurrent && (
                          <DropdownMenuItem>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Rollback to this version
                          </DropdownMenuItem>
                        )}
                        {entry.status === 'failed' && onRetry && (
                          <DropdownMenuItem onClick={() => onRetry(entry.id)}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retry
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
