'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Link2,
  Rocket,
  Shield,
  Calendar,
  Search,
  AlertTriangle,
} from 'lucide-react';

type ActivityRecord = {
  id: string;
  activityType: string;
  message: string;
  createdAt: string;
};

const activityConfig: Record<
  string,
  {
    icon: typeof Activity;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  website_created: {
    icon: Rocket,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Website Created',
  },
  domain_connected: {
    icon: Link2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'Domain Connected',
  },
  payment_received: {
    icon: CreditCard,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Payment Received',
  },
  provisioning_complete: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'Provisioning Complete',
  },
  ssl_issued: {
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'SSL Certificate',
  },
  domain_primary_changed: {
    icon: CheckCircle2,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    label: 'Domain Updated',
  },
  domain_removed: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Domain Removed',
  },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  const loadActivities = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/dashboard/activity?limit=150', {
        cache: 'no-store',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_activities'));
      }
      setActivities(Array.isArray(result?.activities) ? result.activities : []);
    } catch (error) {
      console.error('[dashboard/activity] load failed', error);
      setErrorMessage('Activity is temporarily unavailable in this preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesFilter = filter === 'all' || activity.activityType === filter;
      const message = activity.message || '';
      const matchesSearch = message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activities, filter, searchQuery]);

  const groupedActivities = useMemo(() => {
    return filteredActivities.reduce<Record<string, ActivityRecord[]>>((groups, activity) => {
      const dateKey = formatDate(activity.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
      return groups;
    }, {});
  }, [filteredActivities]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/websites">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary" />
              Activity Log
            </h1>
            <p className="text-muted-foreground">View all activity across your account.</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="website_created">Websites</TabsTrigger>
                <TabsTrigger value="payment_received">Payments</TabsTrigger>
                <TabsTrigger value="domain_connected">Domains</TabsTrigger>
                <TabsTrigger value="provisioning_complete">Provisioning</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
          <CardDescription>
            {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading activity...</div>
          ) : Object.keys(groupedActivities).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-border" />
                    <Badge variant="outline" className="text-xs font-medium">
                      {date}
                    </Badge>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-4">
                    {dateActivities.map((activity) => {
                      const config = activityConfig[activity.activityType] || {
                        icon: Activity,
                        color: 'text-muted-foreground',
                        bgColor: 'bg-secondary',
                        label: activity.activityType || 'Activity',
                      };
                      const Icon = config.icon;

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div
                            className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center shrink-0`}
                          >
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{activity.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {config.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(activity.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search query.' : 'Your activity log is empty.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
