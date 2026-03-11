'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Globe,
  Shield,
  Server,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  latency?: number;
}

interface DomainHealthProps {
  domain: string;
  checks: HealthCheck[];
  lastChecked?: string;
  onRefresh?: () => void;
}

const checkIcons: Record<string, typeof Globe> = {
  dns: Globe,
  ssl: Shield,
  server: Server,
  performance: Zap,
};

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  checking: {
    icon: Clock,
    color: 'text-muted-foreground',
    bg: 'bg-secondary',
    border: 'border-border',
  },
};

export function DomainHealth({ domain, checks, lastChecked, onRefresh }: DomainHealthProps) {
  const healthyCount = checks.filter((c) => c.status === 'healthy').length;
  const totalChecks = checks.length;
  const overallStatus = 
    checks.some((c) => c.status === 'error') ? 'error' :
    checks.some((c) => c.status === 'warning') ? 'warning' :
    checks.every((c) => c.status === 'healthy') ? 'healthy' : 'checking';

  const overallConfig = statusConfig[overallStatus];
  const OverallIcon = overallConfig.icon;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Domain Health</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time health monitoring for <span className="font-mono text-foreground">{domain}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('gap-1.5', overallConfig.bg, overallConfig.border)}>
              <OverallIcon className={cn('w-3 h-3', overallConfig.color)} />
              <span className={overallConfig.color}>
                {healthyCount}/{totalChecks} Healthy
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Checks Grid */}
        <div className="grid gap-3">
          {checks.map((check) => {
            const config = statusConfig[check.status];
            const StatusIcon = config.icon;
            const CheckIcon = checkIcons[check.id] || Globe;

            return (
              <div
                key={check.id}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                  config.bg,
                  config.border
                )}
              >
                <div className={cn('p-2 rounded-lg', config.bg)}>
                  <CheckIcon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{check.name}</p>
                    <StatusIcon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.message}</p>
                </div>
                {check.latency !== undefined && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {check.latency}ms
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {lastChecked && `Last checked: ${new Date(lastChecked).toLocaleString()}`}
          </p>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onRefresh}>
            <RefreshCcw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
