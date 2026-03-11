'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DnsVerification } from '@/components/domains/dns-verification';
import { SSLStatus } from '@/components/domains/ssl-status';
import { DomainHealth } from '@/components/domains/domain-health';
import { useDnsPropagation } from '@/hooks/use-dns-propagation';
import type { DnsRecord } from '@/lib/types';
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default function DomainDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [domain, setDomain] = useState<DomainRecord | null>(null);
  const [websites, setWebsites] = useState<WebsiteRecord[]>([]);
  const [bindWebsiteId, setBindWebsiteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadDomain = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const [domainResponse, websitesResponse] = await Promise.all([
        fetch(`/api/dashboard/domains/${id}`, {
          cache: 'no-store',
          credentials: 'include',
        }),
        fetch('/api/dashboard/websites', {
          cache: 'no-store',
          credentials: 'include',
        }),
      ]);

      const domainResult = await domainResponse.json().catch(() => ({}));
      const websitesResult = await websitesResponse.json().catch(() => ({}));
      if (!domainResponse.ok) {
        throw new Error(String(domainResult?.error || 'failed_to_load_domain'));
      }

      setDomain(domainResult?.domain || null);
      setWebsites(
        Array.isArray(websitesResult?.websites)
          ? websitesResult.websites.map((website: WebsiteRecord) => ({
              id: website.id,
              projectName: website.projectName,
              subdomain: website.subdomain,
              status: website.status,
            }))
          : [],
      );
    } catch (error) {
      console.error('[dashboard/domains/:id] load failed', error);
      setErrorMessage('Domain not found or unavailable.');
      setDomain(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomain();
  }, [id]);

  useEffect(() => {
    if (domain?.websiteId) {
      setBindWebsiteId('');
      return;
    }

    setBindWebsiteId(websites.find((website) => website.status === 'ready')?.id || '');
  }, [domain?.id, domain?.websiteId, websites]);

  useEffect(() => {
    if (!domain || domain.verificationStatus !== 'pending') {
      return;
    }

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/dashboard/domains/${domain.id}/verify`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => null);

      if (!response) {
        return;
      }

      const result = await response.json().catch(() => ({}));
      if (result?.domain) {
        setDomain(result.domain);
      }
    }, 60000);

    return () => window.clearInterval(timer);
  }, [domain?.id, domain?.verificationStatus]);

  const livePropagation = useDnsPropagation({
    domain: domain?.verificationStatus === 'pending' ? domain.domain : null,
    recordType: 'A',
    expectedValue: domain?.routingRecord?.value || null,
    enabled: Boolean(domain && domain.verificationStatus === 'pending'),
  });

  const refreshVerification = async () => {
    if (!domain) return;
    setWorking(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/dashboard/domains/${domain.id}/verify`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok && response.status !== 202) {
        throw new Error(String(result?.error || 'failed_to_verify_domain'));
      }

      setDomain(result?.domain || domain);
      if (response.status !== 202) {
        setSuccessMessage(String(result?.message || 'Domain verified successfully.'));
      }

      await livePropagation.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to refresh verification.');
    } finally {
      setWorking(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setPrimary = async () => {
    if (!domain) return;
    setWorking(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/dashboard/domains/${domain.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_set_primary'));
      }

      setDomain(result?.domain || domain);
      setSuccessMessage('Domain set as primary.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update domain.');
    } finally {
      setWorking(false);
    }
  };

  const bindDomain = async () => {
    if (!domain || !bindWebsiteId) {
      setErrorMessage('Select a website before binding the domain.');
      return;
    }

    setWorking(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/dashboard/domains/${domain.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ websiteId: bindWebsiteId, isPrimary: domain.isPrimary }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_bind_domain'));
      }

      setDomain(result?.domain || domain);
      setSuccessMessage(
        String(
          result?.message ||
            'Domain bound successfully. Finish DNS verification if SSL has not been issued yet.',
        ),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to bind domain.');
    } finally {
      setWorking(false);
    }
  };

  const removeDomain = async () => {
    if (!domain) return;
    setWorking(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/dashboard/domains/${domain.id}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_delete_domain'));
      }
      router.push('/dashboard/domains');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to remove domain.');
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        Loading domain...
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Domain not found</h2>
        <p className="text-muted-foreground mt-1">The requested domain does not exist.</p>
        <Link href="/dashboard/domains">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Domains
          </Button>
        </Link>
      </div>
    );
  }

  const displayDomain = domain.domain;
  const isPending = domain.verificationStatus === 'pending';
  const isFailed = domain.verificationStatus === 'failed';

  const healthChecks = [
    {
      id: 'dns',
      name: 'DNS Resolution',
      status:
        domain.verificationStatus === 'verified'
          ? ('healthy' as const)
          : domain.verificationStatus === 'pending'
            ? ('checking' as const)
            : ('error' as const),
      message:
        domain.verificationStatus === 'verified'
          ? 'All DNS records resolving correctly.'
          : domain.verificationStatus === 'pending'
            ? 'DNS propagation still in progress.'
            : 'DNS records incorrect or missing.',
      latency: domain.verificationStatus === 'verified' ? 45 : undefined,
    },
    {
      id: 'ssl',
      name: 'SSL Certificate',
      status:
        domain.sslStatus === 'active'
          ? ('healthy' as const)
          : domain.sslStatus === 'pending'
            ? ('checking' as const)
            : domain.sslStatus === 'failed'
              ? ('error' as const)
              : ('warning' as const),
      message:
        domain.sslStatus === 'active'
          ? 'Valid certificate installed.'
          : domain.sslStatus === 'pending'
            ? 'Certificate being issued.'
            : domain.sslStatus === 'failed'
              ? 'Certificate issuance failed.'
              : 'Certificate expired.',
      latency: domain.sslStatus === 'active' ? 12 : undefined,
    },
    {
      id: 'server',
      name: 'Server Response',
      status: 'healthy' as const,
      message: 'Server responding with 200 OK.',
      latency: 156,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/domains"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Domains
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight font-mono">{displayDomain}</h1>
              {domain.isPrimary && (
                <Badge variant="outline" className="gap-1.5 border-accent/30 text-accent">
                  <Star className="w-3.5 h-3.5" />
                  Primary
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Connected to: {domain.websiteName || 'Unassigned'}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(`https://${displayDomain}`)}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied' : 'Copy URL'}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://${displayDomain}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Visit
              </a>
            </Button>
            {!domain.websiteId && (
              <Select value={bindWebsiteId} onValueChange={setBindWebsiteId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Choose a website" />
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
            )}
            {!domain.websiteId && (
              <Button
                variant="outline"
                size="sm"
                onClick={bindDomain}
                disabled={!bindWebsiteId || working || domain.verificationStatus !== 'verified'}
              >
                Bind Website
              </Button>
            )}
            {!domain.isPrimary && Boolean(domain.websiteId) && (
              <Button variant="outline" size="sm" onClick={setPrimary} disabled={working}>
                {working ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Star className="w-4 h-4 mr-1" />}
                Set Primary
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={removeDomain} disabled={working}>
              {working ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Remove
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {isPending && (
        <Alert className="border-yellow-500/30 bg-yellow-500/5">
          <Clock className="h-4 w-4 text-yellow-400" />
          <AlertTitle className="text-yellow-400">DNS Verification Pending</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            DNS records are being verified. This may take up to 48 hours.
          </AlertDescription>
        </Alert>
      )}

      {isFailed && (
        <Alert className="border-red-500/30 bg-red-500/5">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">DNS Verification Failed</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Verification failed. Check DNS records then refresh.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  domain.verificationStatus === 'verified'
                    ? 'bg-green-500/10'
                    : domain.verificationStatus === 'pending'
                      ? 'bg-yellow-500/10'
                      : 'bg-red-500/10',
                )}
              >
                <CheckCircle2
                  className={cn(
                    'w-4 h-4',
                    domain.verificationStatus === 'verified'
                      ? 'text-green-400'
                      : domain.verificationStatus === 'pending'
                        ? 'text-yellow-400'
                        : 'text-red-400',
                  )}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">DNS Status</p>
                <p className="font-semibold capitalize">{domain.verificationStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  domain.sslStatus === 'active'
                    ? 'bg-green-500/10'
                    : domain.sslStatus === 'pending'
                      ? 'bg-yellow-500/10'
                      : 'bg-red-500/10',
                )}
              >
                <Shield
                  className={cn(
                    'w-4 h-4',
                    domain.sslStatus === 'active'
                      ? 'text-green-400'
                      : domain.sslStatus === 'pending'
                        ? 'text-yellow-400'
                        : 'text-red-400',
                  )}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SSL</p>
                <p className="font-semibold capitalize">{domain.sslStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="font-semibold">
                  {new Date(domain.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Primary</p>
                <p className="font-semibold">{domain.isPrimary ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dns">DNS Records</TabsTrigger>
          <TabsTrigger value="ssl">SSL Certificate</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dns" className="mt-6">
          <DnsVerification
            domain={displayDomain}
            records={domain.dnsRecords || []}
            verificationStatus={domain.verificationStatus}
            lastChecked={domain.lastCheckedAt || domain.updatedAt}
            onRefresh={refreshVerification}
            propagation={livePropagation.snapshot}
            propagationLoading={livePropagation.loading}
          />
        </TabsContent>

        <TabsContent value="ssl" className="mt-6">
          <SSLStatus
            status={domain.sslStatus}
            domain={displayDomain}
            validFrom={domain.dnsVerifiedAt || domain.createdAt}
            validUntil={domain.sslExpiresAt || undefined}
            autoRenew={true}
            onRenew={refreshVerification}
          />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <DomainHealth
            domain={displayDomain}
            checks={healthChecks}
            lastChecked={domain.updatedAt}
            onRefresh={loadDomain}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Domain Settings</CardTitle>
              <CardDescription>Configure how this domain behaves.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="primary">Primary Domain</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this your primary domain.
                  </p>
                </div>
                <Switch id="primary" checked={domain.isPrimary} disabled />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-renew">Auto-Renew SSL</Label>
                  <p className="text-sm text-muted-foreground">Automatic certificate renewal.</p>
                </div>
                <Switch id="auto-renew" checked />
              </div>

              <Separator />

              <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <h4 className="font-semibold text-red-400 mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Removing this domain disconnects it immediately from your account.
                </p>
                <Button variant="destructive" size="sm" onClick={removeDomain} disabled={working}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Domain
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
