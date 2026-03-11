'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/states/state-components';
import {
  Globe,
  Server,
  Link2,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  USER_NOTIFICATION_WINDOW_EVENT,
  type RealtimeNotificationPayload,
} from '@/lib/realtime/events';

type DashboardWebsite = {
  id: string;
  projectName: string;
  templateName: string;
  status: 'pending' | 'provisioning' | 'ready' | 'suspended' | 'failed';
  customDomain: string | null;
  liveUrl: string | null;
  pageViews: number;
  visits: number;
};

type DashboardSubscription = {
  planName: string;
  renewalDate: string;
};

type DashboardActivity = {
  id: string;
  message: string;
  createdAt: string;
};

type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
};

type TrafficPoint = {
  date: string;
  views: number;
  visits: number;
};

type DashboardOverviewResponse = {
  websites: DashboardWebsite[];
  subscription: DashboardSubscription | null;
  activities: DashboardActivity[];
  notifications: DashboardNotification[];
  trafficData: TrafficPoint[];
};

const statusConfig: Record<
  DashboardWebsite['status'],
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    icon: typeof CheckCircle2;
    color: string;
  }
> = {
  ready: { label: 'Live', variant: 'default', icon: CheckCircle2, color: 'text-green-500' },
  provisioning: {
    label: 'Provisioning',
    variant: 'secondary',
    icon: Loader2,
    color: 'text-yellow-500',
  },
  pending: { label: 'Pending', variant: 'outline', icon: Clock, color: 'text-muted-foreground' },
  suspended: {
    label: 'Suspended',
    variant: 'destructive',
    icon: AlertCircle,
    color: 'text-red-500',
  },
  failed: { label: 'Failed', variant: 'destructive', icon: AlertCircle, color: 'text-red-500' },
};

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);

  const loadOverview = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/dashboard/overview', {
        cache: 'no-store',
        credentials: 'include',
      });
      const result = (await response.json().catch(() => ({}))) as Partial<DashboardOverviewResponse> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || 'failed_to_load_dashboard');
      }

      setData({
        websites: Array.isArray(result.websites) ? result.websites : [],
        subscription: result.subscription || null,
        activities: Array.isArray(result.activities) ? result.activities : [],
        notifications: Array.isArray(result.notifications) ? result.notifications : [],
        trafficData: Array.isArray(result.trafficData) ? result.trafficData : [],
      });
    } catch (error) {
      console.error('[dashboard] failed to load overview', error);
      setErrorMessage('Failed to load dashboard data from MySQL.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const payload = (event as CustomEvent<RealtimeNotificationPayload>).detail;
      if (!payload) {
        return;
      }

      setData((current) => {
        if (!current) {
          return current;
        }

        const nextNotifications = current.notifications.filter(
          (notification) => notification.id !== payload.id,
        );
        nextNotifications.unshift({
          id: payload.id,
          title: payload.title,
          message: payload.message,
          read: payload.read,
        });

        return {
          ...current,
          notifications: nextNotifications.slice(0, 8),
        };
      });
    };

    window.addEventListener(
      USER_NOTIFICATION_WINDOW_EVENT,
      handleNotification as EventListener,
    );

    return () => {
      window.removeEventListener(
        USER_NOTIFICATION_WINDOW_EVENT,
        handleNotification as EventListener,
      );
    };
  }, []);

  const websites = data?.websites || [];
  const notifications = data?.notifications || [];
  const activities = data?.activities || [];
  const trafficData = data?.trafficData || [];
  const subscription = data?.subscription;

  const stats = useMemo(() => {
    const activeWebsites = websites.filter((website) => website.status === 'ready').length;
    const pendingWebsites = websites.filter(
      (website) => website.status === 'pending' || website.status === 'provisioning',
    ).length;
    const domainsConnected = websites.filter((website) => Boolean(website.customDomain)).length;

    return [
      {
        label: 'Active Websites',
        value: activeWebsites,
        icon: Globe,
        href: '/dashboard/websites',
        highlight: false,
        change: `${activeWebsites} live`,
      },
      {
        label: 'Pending',
        value: pendingWebsites,
        icon: Server,
        href: '/dashboard/provisioning',
        highlight: pendingWebsites > 0,
        change: 'In progress',
      },
      {
        label: 'Domains',
        value: domainsConnected,
        icon: Link2,
        href: '/dashboard/domains',
        highlight: false,
        change: 'Connected',
      },
      {
        label: 'Plan',
        value: (subscription?.planName || 'starter').toUpperCase(),
        icon: Sparkles,
        href: '/dashboard/billing',
        highlight: false,
        change: 'Active',
      },
    ];
  }, [subscription?.planName, websites]);

  if (isLoading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  if (errorMessage) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="py-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="space-y-3">
              <p className="font-medium text-red-500">{errorMessage}</p>
              <Button size="sm" variant="outline" onClick={loadOverview}>
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-base">
          Welcome back! Here&apos;s an overview of your websites and account
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card
              className={`group relative overflow-hidden bg-card border-border hover:border-accent/50 transition-smooth cursor-pointer hover-lift ${stat.highlight ? 'bg-warning/5 border-warning/30' : ''}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-smooth" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg ${stat.highlight ? 'bg-warning/10' : 'bg-secondary'}`}
                >
                  <stat.icon
                    className={`h-4 w-4 ${stat.highlight ? 'text-warning' : 'text-muted-foreground'}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-background border-accent/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <CardHeader className="pb-4 relative">
            <CardTitle className="text-lg flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-accent/20">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Subscription
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {(subscription?.planName || 'starter').toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Renews
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {formatShortDate(subscription?.renewalDate || '')}
                </p>
              </div>
            </div>
            <Button className="w-full h-11 font-medium" asChild>
              <Link href="/dashboard/billing">
                Manage Billing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-secondary">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button className="w-full h-10 justify-between font-medium" variant="outline" asChild>
              <Link href="/dashboard/websites">
                View All Websites
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button className="w-full h-10 justify-between font-medium" variant="outline" asChild>
              <Link href="/dashboard/provisioning">
                New Provisioning
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button className="w-full h-10 justify-between font-medium" variant="outline" asChild>
              <Link href="/dashboard/domains">
                Manage Domains
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="text-lg">My Websites</CardTitle>
                <CardDescription>Your active and pending websites</CardDescription>
              </div>
              <Link href="/dashboard/websites">
                <Button variant="outline" size="sm" className="h-9 font-medium">
                  View All
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {websites.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No websites yet. Launch your first website from templates.
                </p>
              ) : (
                <div className="space-y-3">
                  {websites.slice(0, 4).map((website) => {
                    const status = statusConfig[website.status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={website.id}
                        className="group flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 hover:border-border/80 transition-smooth"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 ring-1 ring-accent/20">
                            <Globe className="w-5 h-5 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm">{website.projectName}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {website.templateName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <Badge variant={status.variant} className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                            <StatusIcon
                              className={`w-3 h-3 ${website.status === 'provisioning' ? 'animate-spin' : ''} ${status.color}`}
                            />
                            {status.label}
                          </Badge>
                          {website.status === 'ready' && website.liveUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-smooth"
                            >
                              <a href={website.liveUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Weekly Traffic</CardTitle>
                  <CardDescription>Website views and visits this week</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-foreground" />
                    <span className="text-muted-foreground">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-accent" />
                    <span className="text-muted-foreground">Visits</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="views" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="visits" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 ring-4 ring-background" />
                        {index < 4 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="min-w-0 pb-4">
                        <p className="text-sm text-foreground leading-relaxed">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Notifications</CardTitle>
                  <CardDescription>Alerts and updates</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {notifications.filter((notification) => !notification.read).length} new
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 p-3 rounded-lg transition-smooth ${!notification.read ? 'bg-accent/5 border border-accent/10' : 'hover:bg-secondary/50'}`}
                    >
                      {!notification.read && (
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-accent flex-shrink-0" />
                      )}
                      <div className={`${notification.read ? 'ml-0' : ''}`}>
                        <p
                          className={`text-sm leading-relaxed ${notification.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
