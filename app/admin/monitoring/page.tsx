'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Zap, TrendingDown, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type MonitoringAlert = {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  website: string | null;
  server: string | null;
  active: boolean;
};

type MonitoringIncident = {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'resolved';
  count: number;
  since: string;
};

type MonitoringSnapshot = {
  alerts: MonitoringAlert[];
  incidents: MonitoringIncident[];
  serviceStatus: Array<{ service: string; status: string }>;
  performance: {
    apiResponseTimeMs: number;
    errorRatePct: number;
    sslHealthPct: number;
    cpuAvgPct: number;
    ramAvgPct: number;
    diskAvgPct: number;
  };
  uptime: {
    today: string;
    sevenDays: string;
    thirtyDays: string;
    allTime: string;
  };
};

const severityConfig = {
  info: { color: 'text-blue-500', bg: 'bg-blue-500/10', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  warning: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  critical: { color: 'text-red-500', bg: 'bg-red-500/10', badge: 'bg-red-500/10 text-red-600 border-red-500/30' },
};

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadMonitoring = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/monitoring', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_monitoring'));
      }

      setData(result as MonitoringSnapshot);
    } catch (error) {
      console.error('[admin/monitoring] failed to load', error);
      setErrorMessage('Failed to load monitoring data from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoring();
  }, []);

  const alerts = data?.alerts || [];
  const incidents = data?.incidents || [];

  const criticalAlerts = useMemo(
    () => alerts.filter((alert) => alert.severity === 'critical').length,
    [alerts],
  );
  const warningAlerts = useMemo(
    () => alerts.filter((alert) => alert.severity === 'warning').length,
    [alerts],
  );
  const openIncidents = useMemo(
    () => incidents.filter((incident) => incident.status === 'open').length,
    [incidents],
  );

  if (loading) {
    return <div className="py-8 text-muted-foreground">Loading monitoring...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring & Alerts</h1>
        <p className="text-muted-foreground">Real-time infrastructure and service health</p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Critical</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-red-500">{criticalAlerts}</p>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Warnings</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-yellow-500">{warningAlerts}</p>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Open Incidents</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{openIncidents}</p>
              <Zap className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">System Health</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-green-500">{Math.max(0, 100 - criticalAlerts * 5)}%</p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="incidents">Incidents ({incidents.length})</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-3">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            return (
              <Card key={alert.id} className={`bg-card border-border ${config.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge variant="outline" className={`${config.badge} text-xs`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {alert.website && `Website: ${alert.website}`}
                        {alert.server && `Server: ${alert.server}`}
                        {' • '}
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-3">
          {incidents.map((incident) => {
            const config = severityConfig[incident.severity];
            const isOpen = incident.status === 'open';
            return (
              <Card key={incident.id} className={`bg-card border-border ${isOpen ? config.bg : 'opacity-75'}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                        <h3 className="font-semibold">{incident.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {incident.count} occurrence{incident.count > 1 ? 's' : ''} • {incident.since}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isOpen
                          ? 'bg-red-500/10 text-red-600 border-red-500/30'
                          : 'bg-green-500/10 text-green-600 border-green-500/30'
                      }
                    >
                      {incident.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Service Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data?.serviceStatus || []).map((service) => (
                  <div key={service.service} className="flex items-center justify-between">
                    <span className="text-sm">{service.service}</span>
                    <Badge
                      className={
                        service.status === 'degraded'
                          ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
                          : 'bg-green-500/10 text-green-600 border-green-500/30'
                      }
                    >
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" /> API Response Time
                    </span>
                    <span className="text-xs text-muted-foreground">{data?.performance.apiResponseTimeMs ?? 0}ms</span>
                  </div>
                  <Progress value={Math.min(100, Math.round((data?.performance.apiResponseTimeMs ?? 0) / 5))} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Error Rate
                    </span>
                    <span className="text-xs text-muted-foreground">{data?.performance.errorRatePct ?? 0}%</span>
                  </div>
                  <Progress value={Math.min(100, Math.round((data?.performance.errorRatePct ?? 0) * 100))} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" /> SSL Cert Health
                    </span>
                    <span className="text-xs text-muted-foreground">{data?.performance.sslHealthPct ?? 0}%</span>
                  </div>
                  <Progress value={data?.performance.sslHealthPct ?? 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Today', value: data?.uptime.today || '-' },
                  { label: '7 Days', value: data?.uptime.sevenDays || '-' },
                  { label: '30 Days', value: data?.uptime.thirtyDays || '-' },
                  { label: 'All Time', value: data?.uptime.allTime || '-' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-green-500">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
