'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Globe,
  MoreHorizontal,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  Clock,
  XCircle,
  Rocket,
} from 'lucide-react';
import { getDisplayDomain } from '@/lib/platform-domain';

type WebsiteRecord = {
  id: string;
  ownerEmail: string | null;
  templateName: string;
  templateStack: 'Laravel' | 'Next.js' | 'WordPress';
  projectName: string;
  status: 'pending' | 'provisioning' | 'ready' | 'suspended' | 'failed';
  subdomain: string;
  customDomain: string | null;
  liveUrl: string | null;
  dashboardUrl: string | null;
  pageViews: number;
  visits: number;
  createdAt: string;
};

const statusLabels: Record<WebsiteRecord['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  ready: { label: 'Ready', variant: 'default' },
  provisioning: { label: 'Provisioning', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'outline' },
  suspended: { label: 'Suspended', variant: 'destructive' },
  failed: { label: 'Failed', variant: 'destructive' },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function displayDomain(website: Pick<WebsiteRecord, 'subdomain' | 'customDomain' | 'liveUrl'>) {
  return getDisplayDomain({
    subdomain: website.subdomain,
    customDomain: website.customDomain,
    liveUrl: website.liveUrl,
  });
}

export default function AdminWebsitesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [websites, setWebsites] = useState<WebsiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadWebsites = async (search = '') => {
    setLoading(true);
    setErrorMessage('');

    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const response = await fetch(`/api/admin/websites${query}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_websites'));
      }
      setWebsites(Array.isArray(result?.websites) ? result.websites : []);
    } catch (error) {
      console.error('[admin/websites] load failed', error);
      setErrorMessage('Failed to load websites from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWebsites(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredWebsites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return websites;

    return websites.filter((website) => {
      return (
        website.projectName.toLowerCase().includes(query) ||
        (website.ownerEmail || '').toLowerCase().includes(query) ||
        website.subdomain.toLowerCase().includes(query) ||
        (website.customDomain || '').toLowerCase().includes(query)
      );
    });
  }, [searchQuery, websites]);

  const activeWebsites = websites.filter((website) => website.status === 'ready').length;
  const provisioningWebsites = websites.filter(
    (website) => website.status === 'provisioning' || website.status === 'pending',
  ).length;
  const suspendedWebsites = websites.filter((website) => website.status === 'suspended').length;

  const updateStatus = async (
    websiteId: string,
    status: WebsiteRecord['status'],
    successText: string,
  ) => {
    setWorkingId(websiteId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/websites/${websiteId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_update_status'));
      }

      const updated = result?.website as WebsiteRecord | undefined;
      if (updated) {
        setWebsites((previous) =>
          previous.map((website) => (website.id === updated.id ? updated : website)),
        );
      } else {
        await loadWebsites(searchQuery);
      }

      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update website status.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Management</h1>
          <p className="text-muted-foreground">All records are loaded from MySQL backend.</p>
        </div>
        <Link href="/admin/domains">
          <Button variant="outline">Manage Domains</Button>
        </Link>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Websites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWebsites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Provisioning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{provisioningWebsites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedWebsites}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Websites</CardTitle>
          <CardDescription>Control website status and monitor owners.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by project, domain, owner..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading websites...
                    </TableCell>
                  </TableRow>
                ) : filteredWebsites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No websites found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWebsites.map((website) => {
                    const status = statusLabels[website.status];
                    return (
                      <TableRow key={website.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{website.projectName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {website.ownerEmail || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{website.templateName}</span>
                            <Badge variant="secondary">{website.templateStack}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>{displayDomain(website)}</TableCell>
                        <TableCell>{website.visits.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(website.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={workingId === website.id}>
                                {workingId === website.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {website.liveUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={website.liveUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Website
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {website.status !== 'ready' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(website.id, 'ready', 'Website marked as ready.')
                                  }
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark Ready
                                </DropdownMenuItem>
                              )}
                              {website.status !== 'provisioning' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(
                                      website.id,
                                      'provisioning',
                                      'Website moved to provisioning.',
                                    )
                                  }
                                >
                                  <Rocket className="w-4 h-4 mr-2" />
                                  Set Provisioning
                                </DropdownMenuItem>
                              )}
                              {website.status !== 'pending' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(website.id, 'pending', 'Website marked as pending.')
                                  }
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Set Pending
                                </DropdownMenuItem>
                              )}
                              {website.status !== 'suspended' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(
                                      website.id,
                                      'suspended',
                                      'Website suspended successfully.',
                                    )
                                  }
                                >
                                  <PauseCircle className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {website.status !== 'failed' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus(website.id, 'failed', 'Website marked as failed.')
                                  }
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Mark Failed
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
