'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

type WebsiteRecord = {
  id: string;
  projectName: string;
  ownerEmail: string | null;
  templateName: string;
  templateStack: 'Laravel' | 'Next.js' | 'WordPress';
  status: 'pending' | 'provisioning' | 'ready' | 'suspended' | 'failed';
  createdAt: string;
  visits: number;
};

const statusConfig = {
  ready: {
    label: 'Deployed',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon: CheckCircle2,
  },
  provisioning: {
    label: 'Provisioning',
    color: 'bg-accent/10 text-accent border-accent/20',
    icon: Loader2,
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    icon: Clock,
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: AlertCircle,
  },
  suspended: {
    label: 'Suspended',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    icon: AlertCircle,
  },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ProvisioningQueuePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [websites, setWebsites] = useState<WebsiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadWebsites = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/dashboard/websites', {
        cache: 'no-store',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_websites'));
      }
      setWebsites(Array.isArray(result?.websites) ? result.websites : []);
    } catch (error) {
      console.error('[dashboard/provisioning/queue] load failed', error);
      setErrorMessage('Failed to load provisioning queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites();
  }, []);

  const filteredWebsites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return websites;

    return websites.filter((website) => {
      return (
        website.projectName.toLowerCase().includes(query) ||
        website.templateName.toLowerCase().includes(query) ||
        (website.ownerEmail || '').toLowerCase().includes(query)
      );
    });
  }, [searchQuery, websites]);

  const provisioningWebsites = filteredWebsites.filter(
    (website) => website.status === 'provisioning' || website.status === 'pending',
  );
  const successfulWebsites = filteredWebsites.filter((website) => website.status === 'ready');
  const failedWebsites = filteredWebsites.filter((website) => website.status === 'failed');

  const renderWebsiteRow = (website: WebsiteRecord) => {
    const status = statusConfig[website.status];
    const StatusIcon = status.icon;

    return (
      <div
        key={website.id}
        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/dashboard/provisioning/${website.id}`}
              className="font-semibold hover:text-accent transition-colors"
            >
              {website.projectName}
            </Link>
            <Badge variant="outline" className={`text-xs font-medium ${status.color}`}>
              <StatusIcon
                className={`w-3 h-3 mr-1 ${website.status === 'provisioning' ? 'animate-spin' : ''}`}
              />
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{website.templateName}</span>
              <p className="text-muted-foreground">Template</p>
            </div>
            <div>
              <span className="font-medium text-foreground">{website.templateStack}</span>
              <p className="text-muted-foreground">Stack</p>
            </div>
            <div>
              <span className="font-medium text-foreground">{website.ownerEmail || '-'}</span>
              <p className="text-muted-foreground">Owner</p>
            </div>
            <div>
              <span className="font-medium text-foreground">{website.visits.toLocaleString()}</span>
              <p className="text-muted-foreground">Visits</p>
            </div>
          </div>
        </div>

        <div className="ml-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/provisioning/${website.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/websites">Open Websites</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Website Setup Queue</h1>
          <p className="text-muted-foreground">Manage and monitor all your website setup requests</p>
        </div>

        {errorMessage && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-2 text-red-500">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid sm:grid-cols-4 gap-4">
          <Card className="bg-secondary/30 border-border">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Total Setups
              </p>
              <p className="text-2xl font-bold">{websites.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
                In Progress
              </p>
              <p className="text-2xl font-bold text-accent">{provisioningWebsites.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2">
                Successful
              </p>
              <p className="text-2xl font-bold text-green-400">{successfulWebsites.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">
                Failed
              </p>
              <p className="text-2xl font-bold text-red-400">{failedWebsites.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="space-y-4">
          <CardTitle>Queue Items</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by project/template/owner..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Loading queue...</div>
          ) : filteredWebsites.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No website setups found.</div>
          ) : (
            <div className="space-y-3">{filteredWebsites.map((website) => renderWebsiteRow(website))}</div>
          )}
        </CardContent>
      </Card>

      {successfulWebsites.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recently Launched</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {successfulWebsites.slice(0, 5).map((website) => (
              <div
                key={website.id}
                className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <span>{website.projectName}</span>
                <span className="text-muted-foreground">{formatDate(website.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
