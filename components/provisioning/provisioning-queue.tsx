// User Provisioning Queue Dashboard
// Shows all user deployments and their status

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ExternalLink,
  Search,
  RotateCw,
} from 'lucide-react';
import type { ProvisioningJobRow } from '@/lib/db/types';

interface ProvisioningQueueProps {
  initialJobs: ProvisioningJobRow[];
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    badgeVariant: 'outline' as const,
  },
  queued: {
    label: 'Queued',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    badgeVariant: 'outline' as const,
  },
  running: {
    label: 'Deploying',
    icon: Loader2,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    badgeVariant: 'outline' as const,
  },
  completed: {
    label: 'Complete',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    badgeVariant: 'outline' as const,
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    badgeVariant: 'outline' as const,
  },
  canceled: {
    label: 'Canceled',
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    badgeVariant: 'outline' as const,
  },
};

export function ProvisioningQueue({ initialJobs }: ProvisioningQueueProps) {
  const [jobs, setJobs] = useState<ProvisioningJobRow[]>(initialJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      searchTerm === '' ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.website_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === null || job.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - in real app would fetch updated job data
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-2">
        {status === 'running' ? (
          <Icon className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (startedAt?: string | null, completedAt?: string | null) => {
    if (!startedAt) return '—';
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
          <p className="text-muted-foreground mt-1">Track your website deployments and provisioning status</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
          <RotateCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Total Deployments</p>
              <p className="text-2xl font-bold">{jobs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">In Progress</p>
              <p className="text-2xl font-bold text-amber-600">
                {jobs.filter(j => j.status === 'running' || j.status === 'queued').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {jobs.filter(j => j.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {jobs.filter(j => j.status === 'failed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by job ID or website..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(null)}
              >
                All
              </Button>
              {['pending', 'queued', 'running', 'completed', 'failed'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {statusConfig[status as keyof typeof statusConfig].label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Deployment History</CardTitle>
          <CardDescription>
            {filteredJobs.length} deployment{filteredJobs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No deployments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map(job => (
                    <TableRow key={job.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getStatusBadge(job.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{job.website_id?.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">Job: {job.id.slice(0, 12)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="w-32 h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${job.progress || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{job.progress || 0}%</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(job.started_at)}</TableCell>
                      <TableCell className="text-sm">{formatDuration(job.started_at, job.completed_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {job.website_id ? (
                            <Link href={`/dashboard/provisioning/${job.website_id}`}>
                              <Button variant="outline" size="sm" className="gap-1">
                                <ExternalLink className="h-3 w-3" />
                                View
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="outline" size="sm" className="gap-1" disabled>
                              <ExternalLink className="h-3 w-3" />
                              View
                            </Button>
                          )}
                          {job.status === 'failed' && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <RotateCw className="h-3 w-3" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
