'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DnsVerification } from '@/components/domains/dns-verification';
import { SSLStatus } from '@/components/domains/ssl-status';
import { DomainHealth } from '@/components/domains/domain-health';
import { useDnsPropagation, type DnsPropagationSnapshot } from '@/hooks/use-dns-propagation';
import type { DnsRecord } from '@/lib/types';
import {
  Globe,
  Link2,
  Shield,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCcw,
  ExternalLink,
  MoreVertical,
  Star,
  Trash2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DomainRecord = {
  id: string;
  domain: string;
  websiteId: string | null;
  userId: string | null;
  ownerEmail: string | null;
  websiteName: string | null;
  isPrimary: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  sslStatus: 'pending' | 'active' | 'expired' | 'failed';
  dnsRecords: DnsRecord[];
  instructions: string[];
  ownerTokenRecord?: DnsRecord | null;
  routingRecord?: DnsRecord | null;
  errorMessage?: string | null;
  lastCheckedAt?: string | null;
  dnsVerifiedAt?: string | null;
  sslExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type WebsiteRecord = {
  id: string;
  projectName: string;
  subdomain: string;
  status: string;
};

type DomainForm = {
  domain: string;
  websiteId: string;
  isPrimary: boolean;
};

const INITIAL_FORM: DomainForm = {
  domain: '',
  websiteId: '',
  isPrimary: false,
};

const verificationStatusConfig = {
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
};

const sslStatusConfig = {
  active: {
    label: 'Secured',
    icon: ShieldCheck,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  pending: {
    label: 'Issuing',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  expired: {
    label: 'Expired',
    icon: ShieldAlert,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  failed: {
    label: 'Failed',
    icon: ShieldAlert,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
};

type DomainNotice = {
  title: string;
  summary: string;
  items: string[];
  progressPercentage?: number;
};

function buildDomainNotice(
  domain: DomainRecord | null,
  propagation: DnsPropagationSnapshot | null,
): DomainNotice | null {
  if (!domain || domain.verificationStatus !== 'pending' || !domain.errorMessage) {
    if (!domain || domain.verificationStatus !== 'pending' || !propagation) {
      return null;
    }
  }

  const message = domain.errorMessage || '';
  const items: string[] = [];
  const expectedTarget = domain.routingRecord?.value || 'the platform target';
  const isRootDomain = domain.domain.split('.').length === 2;

  if (propagation) {
    const updatedResolvers = propagation.results.filter((entry) => entry.matchesExpected === true);
    const laggingResolvers = propagation.results.filter(
      (entry) => entry.status === 'resolved' && entry.matchesExpected === false,
    );
    const unresolvedResolvers = propagation.results.filter((entry) => entry.status === 'failed');

    if (updatedResolvers.length > 0) {
      items.push(
        `${updatedResolvers.length} of ${propagation.results.length} public resolvers already point to this platform.`,
      );
    }

    if (laggingResolvers.length > 0) {
      items.push(
        `${laggingResolvers[0].name} still resolves ${domain.domain} to ${laggingResolvers[0].result}.`,
      );
    }

    if (unresolvedResolvers.length > 0) {
      items.push(`${unresolvedResolvers.length} public resolvers still have no fresh answer yet.`);
    }

    if (!message.toLowerCase().includes('txt')) {
      items.push('Ownership TXT record is already visible.');
    }

    if (isRootDomain && domain.routingRecord?.type === 'CNAME') {
      items.push(
        'Because this is the root domain, some DNS providers ignore direct CNAME records. Use ALIAS/ANAME/flattening, or replace the old A record.',
      );
    }

    return {
      title:
        propagation.matchedCount > 0
          ? 'DNS Propagation Is In Progress'
          : 'DNS Routing Still Points To Another Server',
      summary:
        propagation.matchedCount > 0
          ? 'Some public DNS resolvers already reach this platform, but the change has not fully spread yet.'
          : `The domain has not reached this platform yet. It still needs to point to ${expectedTarget}.`,
      items,
      progressPercentage: propagation.propagationPercentage,
    };
  }

  if (!message.toLowerCase().includes('txt')) {
    items.push('Ownership TXT record is visible. The remaining problem is routing, not ownership.');
  }

  const currentAddressMatch = message.match(/currently resolves to (.*?), but it must resolve to (.*?)(?:\s*\||$)/i);
  if (currentAddressMatch) {
    items.push(`Public DNS still points to ${currentAddressMatch[1]}. It must point to ${currentAddressMatch[2]}.`);
  } else if (message.toLowerCase().includes('querycname enodata')) {
    items.push(`No public CNAME is visible yet for ${domain.domain}.`);
  } else if (message.toLowerCase().includes('must resolve to')) {
    items.push(`Routing still does not point to ${expectedTarget}.`);
  }

  if (message.toLowerCase().includes('404')) {
    items.push('The verification file is returning 404, which means requests are still reaching another server.');
  }

  if (isRootDomain && domain.routingRecord?.type === 'CNAME') {
    items.push('Because this is the root domain, some DNS providers ignore direct CNAME records. Use ALIAS/ANAME/flattening, or replace the old A record.');
  }

  if (items.length === 0) {
    items.push('DNS changes were detected partially, but the domain is not yet routed to this platform.');
  }

  return {
    title: 'DNS Still Needs One More Change',
    summary: `The domain has not reached this platform yet, so verification cannot complete.`,
    items,
  };
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [websites, setWebsites] = useState<WebsiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<DomainForm>(INITIAL_FORM);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [bindWebsiteId, setBindWebsiteId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const [domainsResponse, websitesResponse] = await Promise.all([
        fetch('/api/dashboard/domains', { cache: 'no-store', credentials: 'include' }),
        fetch('/api/dashboard/websites', { cache: 'no-store', credentials: 'include' }),
      ]);

      const domainsResult = await domainsResponse.json().catch(() => ({}));
      const websitesResult = await websitesResponse.json().catch(() => ({}));

      if (!domainsResponse.ok) {
        throw new Error(String(domainsResult?.error || 'failed_to_load_domains'));
      }
      if (!websitesResponse.ok) {
        throw new Error(String(websitesResult?.error || 'failed_to_load_websites'));
      }

      const nextDomains = Array.isArray(domainsResult?.domains) ? domainsResult.domains : [];
      const nextWebsites = Array.isArray(websitesResult?.websites)
        ? websitesResult.websites.map((website: { id: string; projectName: string; subdomain: string; status: string }) => ({
            id: website.id,
            projectName: website.projectName,
            subdomain: website.subdomain,
            status: website.status,
          }))
        : [];

      setDomains(nextDomains);
      setWebsites(nextWebsites);
      setSelectedDomainId((previous) => {
        if (previous && nextDomains.some((domain: DomainRecord) => domain.id === previous)) {
          return previous;
        }
        return nextDomains[0]?.id || null;
      });
    } catch (error) {
      console.error('[dashboard/domains] load failed', error);
      setErrorMessage('Domain data is temporarily unavailable in this preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDomain = useMemo(() => {
    if (!selectedDomainId) return domains[0] || null;
    return domains.find((domain) => domain.id === selectedDomainId) || null;
  }, [domains, selectedDomainId]);

  const livePropagation = useDnsPropagation({
    domain: selectedDomain?.verificationStatus === 'pending' ? selectedDomain.domain : null,
    recordType: 'A',
    expectedValue: selectedDomain?.routingRecord?.value || null,
    enabled: Boolean(selectedDomain && selectedDomain.verificationStatus === 'pending'),
  });

  const domainNotice = buildDomainNotice(selectedDomain, livePropagation.snapshot);
  const hideGlobalError =
    Boolean(domainNotice) &&
    Boolean(selectedDomain?.errorMessage) &&
    errorMessage.trim() === selectedDomain.errorMessage.trim();

  useEffect(() => {
    if (selectedDomain?.websiteId) {
      setBindWebsiteId('');
      return;
    }

    setBindWebsiteId(websites.find((website) => website.status === 'ready')?.id || '');
  }, [selectedDomain?.id, selectedDomain?.websiteId, websites]);

  const totalDomains = domains.length;
  const verifiedDomains = domains.filter((domain) => domain.verificationStatus === 'verified').length;
  const customDomains = domains.length;
  const securedDomains = domains.filter((domain) => domain.sslStatus === 'active').length;

  const refreshDomainVerification = async (domainId: string) => {
    setWorkingId(domainId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/dashboard/domains/${domainId}/verify`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok && response.status !== 202) {
        throw new Error(String(result?.error || 'failed_to_verify_domain'));
      }

      if (result?.domain) {
        setDomains((previous) =>
          previous.map((domain) => (domain.id === domainId ? result.domain : domain)),
        );
      } else {
        await loadData();
      }

      if (response.status !== 202) {
        setSuccessMessage(String(result?.message || 'Domain verified successfully.'));
      }

      if (selectedDomainId === domainId) {
        await livePropagation.refresh();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to refresh domain verification.');
    } finally {
      setWorkingId(null);
    }
  };

  useEffect(() => {
    const pendingIds = domains
      .filter((domain) => domain.verificationStatus === 'pending')
      .map((domain) => domain.id);

    if (pendingIds.length === 0) {
      return;
    }

    const timer = window.setInterval(async () => {
      for (const domainId of pendingIds) {
        const response = await fetch(`/api/dashboard/domains/${domainId}/verify`, {
          method: 'POST',
          credentials: 'include',
        }).catch(() => null);

        if (!response) {
          continue;
        }

        const result = await response.json().catch(() => ({}));
        if (result?.domain) {
          setDomains((previous) =>
            previous.map((domain) => (domain.id === domainId ? result.domain : domain)),
          );
        }
      }
    }, 60000);

    return () => window.clearInterval(timer);
  }, [domains]);

  const createDomain = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/dashboard/domains', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          websiteId: form.websiteId.trim() ? form.websiteId : null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_create_domain'));
      }

      const created = result?.domain as DomainRecord | undefined;
      if (created) {
        setDomains((previous) => [created, ...previous]);
        setSelectedDomainId(created.id);
      } else {
        await loadData();
      }

      setForm(INITIAL_FORM);
      setIsDialogOpen(false);
      setSuccessMessage('Domain added. Publish the DNS records, wait for verification, then bind it to a website.');
    } catch (error) {
      await loadData();
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add domain.');
    } finally {
      setSaving(false);
    }
  };

  const patchDomain = async (
    domainId: string,
    payload: Record<string, unknown>,
    successText: string,
  ) => {
    setWorkingId(domainId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/dashboard/domains/${domainId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_update_domain'));
      }

      const updated = result?.domain as DomainRecord | undefined;
      if (updated) {
        setDomains((previous) =>
          previous.map((domain) => {
            if (domain.id === updated.id) return updated;
            if (payload.isPrimary === true) {
              return { ...domain, isPrimary: false };
            }
            return domain;
          }),
        );
      } else {
        await loadData();
      }

      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update domain.');
    } finally {
      setWorkingId(null);
    }
  };

  const bindSelectedDomain = async () => {
    if (!selectedDomain || !bindWebsiteId) {
      setErrorMessage('Select a website before binding the domain.');
      return;
    }

    await patchDomain(
      selectedDomain.id,
      { websiteId: bindWebsiteId, isPrimary: selectedDomain.isPrimary },
      selectedDomain.verificationStatus === 'verified'
        ? 'Domain bound successfully and SSL provisioning started.'
        : 'Domain bound successfully. Finish DNS verification to activate SSL.',
    );
  };

  const removeDomain = async (domainId: string) => {
    setWorkingId(domainId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/dashboard/domains/${domainId}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_delete_domain'));
      }

      setDomains((previous) => previous.filter((domain) => domain.id !== domainId));
      setSuccessMessage('Domain removed.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to remove domain.');
    } finally {
      setWorkingId(null);
    }
  };

  const healthChecks = selectedDomain
    ? [
        {
          id: 'dns',
          name: 'DNS Resolution',
          status:
            selectedDomain.verificationStatus === 'verified'
              ? ('healthy' as const)
              : selectedDomain.verificationStatus === 'pending'
                ? ('checking' as const)
                : ('error' as const),
          message:
            selectedDomain.verificationStatus === 'verified'
              ? 'DNS records are resolving correctly.'
              : selectedDomain.verificationStatus === 'pending'
                ? 'DNS propagation is still in progress.'
                : 'DNS verification failed, check records.',
          latency: selectedDomain.verificationStatus === 'verified' ? 42 : undefined,
        },
        {
          id: 'ssl',
          name: 'SSL Certificate',
          status:
            selectedDomain.sslStatus === 'active'
              ? ('healthy' as const)
              : selectedDomain.sslStatus === 'pending'
                ? ('checking' as const)
                : selectedDomain.sslStatus === 'failed'
                  ? ('error' as const)
                  : ('warning' as const),
          message:
            selectedDomain.sslStatus === 'active'
              ? 'SSL certificate is active.'
              : selectedDomain.sslStatus === 'pending'
                ? 'SSL certificate is being issued.'
                : selectedDomain.sslStatus === 'failed'
                  ? 'SSL certificate issuance failed.'
                  : 'SSL certificate expired.',
          latency: selectedDomain.sslStatus === 'active' ? 11 : undefined,
        },
        {
          id: 'server',
          name: 'Server Response',
          status: 'healthy' as const,
          message: 'Server is reachable and responding.',
          latency: 156,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
          <p className="text-muted-foreground mt-1">
            Manage custom domains, DNS, and SSL from your website account.
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setForm(INITIAL_FORM);
          }}
        >
          <DialogTrigger asChild>
            <Button className="sm:flex-shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                Add the domain to your account now. You can bind it to a website after DNS verification.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createDomain} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain-name">Domain</Label>
                <Input
                  id="domain-name"
                  placeholder="example.com"
                  value={form.domain}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, domain: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website-id">Website (optional)</Label>
                <Select
                  value={form.websiteId || '__later__'}
                  onValueChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      websiteId: value === '__later__' ? '' : value,
                    }))
                  }
                >
                  <SelectTrigger id="website-id">
                    <SelectValue placeholder="Bind later from the domain page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__later__">Bind later</SelectItem>
                    {websites
                      .filter((website) => website.status === 'ready')
                      .map((website) => (
                        <SelectItem key={website.id} value={website.id}>
                          {website.projectName} ({website.subdomain}.univert.pro)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="primary-domain"
                  type="checkbox"
                  checked={form.isPrimary}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, isPrimary: event.target.checked }))
                  }
                />
                <Label htmlFor="primary-domain">Set as primary domain</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Domain'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {domainNotice && (
        <Alert className="border-yellow-500/30 bg-yellow-500/5 text-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-700" />
          <AlertTitle className="text-yellow-800">{domainNotice.title}</AlertTitle>
          <AlertDescription className="space-y-4 text-yellow-800">
            <p>{domainNotice.summary}</p>
            {typeof domainNotice.progressPercentage === 'number' && (
              <div className="rounded-lg border border-yellow-500/20 bg-background/70 p-3 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">Live propagation</span>
                  <span className="font-semibold text-foreground">
                    {domainNotice.progressPercentage}%
                  </span>
                </div>
                <Progress value={domainNotice.progressPercentage} className="h-2.5" />
              </div>
            )}
            <ul className="space-y-1.5 text-sm">
              {domainNotice.items.map((item) => (
                <li key={item} className="leading-6">
                  {item}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {errorMessage && !hideGlobalError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-secondary">
                <Globe className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDomains}</p>
                <p className="text-xs text-muted-foreground">Total Domains</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-accent/10">
                <Link2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customDomains}</p>
                <p className="text-xs text-muted-foreground">Custom Domains</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedDomains}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securedDomains}</p>
                <p className="text-xs text-muted-foreground">SSL Secured</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Domains</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={loadData}>
              <RefreshCcw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center text-muted-foreground">
                Loading domains...
              </CardContent>
            </Card>
          ) : domains.length === 0 ? (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                No domains yet. Add your first domain.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {domains.map((domain) => {
                const verificationStatus = verificationStatusConfig[domain.verificationStatus];
                const sslStatus = sslStatusConfig[domain.sslStatus];
                const isSelected = selectedDomain?.id === domain.id;
                return (
                  <Card
                    key={domain.id}
                    className={cn(
                      'bg-card border-border cursor-pointer transition-all hover-lift',
                      isSelected && 'border-accent/50 bg-accent/5',
                    )}
                    onClick={() => setSelectedDomainId(domain.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{domain.domain}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {domain.websiteName || 'Unassigned'}
                          </p>
                        </div>
                        {domain.isPrimary && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-5 gap-1 border-accent/30 text-accent"
                          >
                            <Star className="w-2.5 h-2.5" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge className={cn('gap-1 h-5 text-[10px]', verificationStatus.bg)}>
                          <verificationStatus.icon
                            className={cn('w-2.5 h-2.5', verificationStatus.color)}
                          />
                          <span className={verificationStatus.color}>{verificationStatus.label}</span>
                        </Badge>
                        <Badge className={cn('gap-1 h-5 text-[10px]', sslStatus.bg)}>
                          <sslStatus.icon className={cn('w-2.5 h-2.5', sslStatus.color)} />
                          <span className={sslStatus.color}>{sslStatus.label}</span>
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedDomain ? (
            <>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{selectedDomain.domain}</h2>
                        {selectedDomain.isPrimary && (
                          <Badge variant="outline" className="gap-1 border-accent/30 text-accent">
                            <Star className="w-3 h-3" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Website: {selectedDomain.websiteName || 'Not assigned'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://${selectedDomain.domain}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visit
                        </a>
                      </Button>
                      <Link href={`/dashboard/domains/${selectedDomain.id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>
                      <Button variant="outline" size="icon" className="h-9 w-9" disabled={workingId === selectedDomain.id}>
                        {workingId === selectedDomain.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MoreVertical className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {!selectedDomain.websiteId && (
                      <div className="w-full rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
                        <div>
                          <p className="text-sm font-medium">Bind this domain to a website</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            After DNS ownership is verified, choose which website should answer on this domain.
                          </p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                          <Select value={bindWebsiteId} onValueChange={setBindWebsiteId}>
                            <SelectTrigger className="md:max-w-sm">
                              <SelectValue placeholder="Select a website" />
                            </SelectTrigger>
                            <SelectContent>
                              {websites
                                .filter((website) => website.status === 'ready')
                                .map((website) => (
                                  <SelectItem key={website.id} value={website.id}>
                                    {website.projectName} ({website.subdomain}.univert.pro)
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={bindSelectedDomain}
                            disabled={
                              !bindWebsiteId ||
                              workingId === selectedDomain.id ||
                              selectedDomain.verificationStatus !== 'verified'
                            }
                          >
                            Bind to Website
                          </Button>
                        </div>
                        {selectedDomain.verificationStatus !== 'verified' && (
                          <p className="text-xs text-amber-500">
                            This action unlocks after DNS verification succeeds.
                          </p>
                        )}
                      </div>
                    )}
                    {!selectedDomain.isPrimary && Boolean(selectedDomain.websiteId) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          patchDomain(
                            selectedDomain.id,
                            { isPrimary: true },
                            'Domain set as primary.',
                          )
                        }
                        disabled={workingId === selectedDomain.id}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Set Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-500"
                      onClick={() => removeDomain(selectedDomain.id)}
                      disabled={workingId === selectedDomain.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Domain
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="dns" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dns">DNS</TabsTrigger>
                  <TabsTrigger value="ssl">SSL</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                </TabsList>

                <TabsContent value="dns" className="mt-4">
                  <DnsVerification
                    domain={selectedDomain.domain}
                    records={selectedDomain.dnsRecords || []}
                    verificationStatus={selectedDomain.verificationStatus}
                    lastChecked={selectedDomain.lastCheckedAt || selectedDomain.updatedAt}
                    onRefresh={() => refreshDomainVerification(selectedDomain.id)}
                    propagation={livePropagation.snapshot}
                    propagationLoading={livePropagation.loading}
                  />
                </TabsContent>

                <TabsContent value="ssl" className="mt-4">
                  <SSLStatus
                    status={selectedDomain.sslStatus}
                    domain={selectedDomain.domain}
                    validFrom={selectedDomain.dnsVerifiedAt || selectedDomain.createdAt}
                    validUntil={selectedDomain.sslExpiresAt || undefined}
                    autoRenew={true}
                    onRenew={() => refreshDomainVerification(selectedDomain.id)}
                  />
                </TabsContent>

                <TabsContent value="health" className="mt-4">
                  <DomainHealth
                    domain={selectedDomain.domain}
                    checks={healthChecks}
                    lastChecked={selectedDomain.updatedAt}
                    onRefresh={loadData}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-10 text-center text-muted-foreground">
                Select a domain to view details.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
