'use client';

import { CheckCircle2, AlertCircle, Clock, RefreshCcw, Activity, Shield, Database, Globe, Server, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HealthItem {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  latency?: number;
  lastChecked?: string;
}

interface WebsiteHealthProps {
  items: HealthItem[];
  lastUpdated?: string;
}

const statusConfig = {
  healthy: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    dotColor: 'bg-emerald-500',
    label: 'Healthy',
  },
  warning: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    dotColor: 'bg-amber-500',
    label: 'Warning',
  },
  error: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    dotColor: 'bg-red-500',
    label: 'Error',
  },
  checking: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    dotColor: 'bg-blue-500',
    label: 'Checking',
  },
};

const serviceIcons: Record<string, any> = {
  'Website Reachability': Globe,
  'SSL Certificate': Shield,
  'Database Connection': Database,
  'CDN Status': Server,
  'Storage': HardDrive,
  'API Endpoint': Activity,
};

export function WebsiteHealth({ items, lastUpdated }: WebsiteHealthProps) {
  const healthyCount = items.filter((i) => i.status === 'healthy').length;
  const healthPercentage = Math.round((healthyCount / items.length) * 100);
  const overallStatus = healthyCount === items.length ? 'healthy' : 
                        items.some((i) => i.status === 'error') ? 'error' : 'warning';

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-card border-border overflow-hidden">
        <div className={cn(
          "h-1",
          overallStatus === 'healthy' ? 'bg-emerald-500' :
          overallStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'
        )} />
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">System Health</CardTitle>
              <CardDescription>Real-time infrastructure status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "font-semibold",
                  statusConfig[overallStatus].color,
                  statusConfig[overallStatus].bgColor,
                  "border-transparent"
                )}
              >
                {statusConfig[overallStatus].label}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Uptime Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-3xl font-bold text-foreground">{healthPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Overall Health</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-3xl font-bold text-emerald-400">{healthyCount}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Services Online</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-3xl font-bold text-foreground">99.9%</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">30-day Uptime</p>
            </div>
          </div>

          {/* Services Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Services</h4>
              {lastUpdated && (
                <span className="text-[11px] text-muted-foreground">
                  Last checked {lastUpdated}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              {items.map((item) => {
                const config = statusConfig[item.status];
                const Icon = serviceIcons[item.name] || Activity;

                return (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-secondary/50",
                      config.borderColor,
                      config.bgColor
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        config.bgColor
                      )}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.latency !== undefined && (
                        <span className={cn(
                          "text-xs font-mono px-2 py-1 rounded",
                          item.latency < 100 ? "bg-emerald-500/10 text-emerald-400" :
                          item.latency < 300 ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                        )}>
                          {item.latency}ms
                        </span>
                      )}
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        config.dotColor,
                        item.status === 'checking' && "animate-pulse"
                      )} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <div className="flex items-center justify-center gap-6 py-2">
        {Object.entries(statusConfig).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", value.dotColor)} />
            <span className="text-xs text-muted-foreground capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
