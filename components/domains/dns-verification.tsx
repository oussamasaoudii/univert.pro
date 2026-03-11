'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DnsRecord } from '@/lib/types';
import type { DnsPropagationSnapshot } from '@/hooks/use-dns-propagation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  RefreshCcw,
  AlertTriangle,
  ExternalLink,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DnsVerificationProps {
  domain: string;
  records: DnsRecord[];
  verificationStatus: 'pending' | 'verified' | 'failed';
  onRefresh?: () => Promise<void> | void;
  lastChecked?: string;
  propagation?: DnsPropagationSnapshot | null;
  propagationLoading?: boolean;
}

const recordTypeColors: Record<string, string> = {
  A: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  AAAA: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CNAME: 'bg-green-500/10 text-green-400 border-green-500/20',
  TXT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  MX: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  NS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export function DnsVerification({ 
  domain, 
  records, 
  verificationStatus, 
  onRefresh,
  lastChecked,
  propagation,
  propagationLoading,
}: DnsVerificationProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending Verification',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      description: 'DNS records are being propagated. This can take up to 48 hours.',
    },
    verified: {
      icon: CheckCircle2,
      label: 'Verified',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      description: 'All DNS records are correctly configured.',
    },
    failed: {
      icon: XCircle,
      label: 'Verification Failed',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      description: 'DNS records are incorrect or not found. Please check your configuration.',
    },
  };

  const status = statusConfig[verificationStatus];
  const StatusIcon = status.icon;
  const matchingResolvers =
    propagation?.results.filter((entry) => entry.status === 'resolved' && entry.matchesExpected === true) || [];
  const laggingResolvers =
    propagation?.results.filter((entry) => entry.status === 'resolved' && entry.matchesExpected === false) || [];
  const unresolvedResolvers =
    propagation?.results.filter((entry) => entry.status === 'failed') || [];

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              DNS Configuration
            </CardTitle>
            <CardDescription className="mt-1">
              Add these records to your DNS provider for <span className="font-mono text-foreground">{domain}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('gap-1.5', status.bg)}>
              <StatusIcon className={cn('w-3 h-3', status.color)} />
              <span className={status.color}>{status.label}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Alert */}
        <div className={cn('p-3 rounded-lg border flex items-start gap-3', status.bg)}>
          <StatusIcon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', status.color)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{status.description}</p>
            {lastChecked && (
              <p className="text-xs text-muted-foreground mt-1">
                Last checked: {new Date(lastChecked).toLocaleString()}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex-shrink-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </Button>
        </div>

        {verificationStatus === 'pending' && propagation && (
          <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Live DNS propagation</p>
                <p className="text-xs text-muted-foreground">
                  {propagation.matchedCount} of {propagation.results.length} public resolvers now point to this platform.
                </p>
              </div>
              <Badge variant="outline" className="w-fit">
                {propagation.propagationPercentage}% propagated
              </Badge>
            </div>

            <Progress value={propagation.propagationPercentage} className="h-2.5" />

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-green-500">Updated</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{matchingResolvers.length}</p>
                <p className="text-xs text-muted-foreground">Resolvers already reaching this platform.</p>
              </div>

              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-yellow-600">Lagging</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{laggingResolvers.length}</p>
                <p className="text-xs text-muted-foreground">Resolvers still returning an old route.</p>
              </div>

              <div className="rounded-lg border border-slate-500/20 bg-slate-500/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">No Answer Yet</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{unresolvedResolvers.length}</p>
                <p className="text-xs text-muted-foreground">Resolvers that have not answered yet.</p>
              </div>
            </div>

            {(laggingResolvers.length > 0 || unresolvedResolvers.length > 0) && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Resolver details
                </p>
                <div className="space-y-2">
                  {laggingResolvers.slice(0, 3).map((resolver) => (
                    <div
                      key={`${resolver.name}-${resolver.ip}`}
                      className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-foreground">{resolver.name}</span>
                        <span className="text-xs text-muted-foreground">{resolver.location}</span>
                      </div>
                      <p className="mt-1 break-all text-muted-foreground">
                        Still returns <span className="font-mono text-foreground">{resolver.result}</span>
                      </p>
                    </div>
                  ))}

                  {unresolvedResolvers.slice(0, 2).map((resolver) => (
                    <div
                      key={`${resolver.name}-${resolver.ip}`}
                      className="rounded-lg border border-border bg-background/40 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-foreground">{resolver.name}</span>
                        <span className="text-xs text-muted-foreground">{resolver.location}</span>
                      </div>
                      <p className="mt-1 break-all text-muted-foreground">{resolver.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {propagationLoading && (
              <p className="text-xs text-muted-foreground">Refreshing live propagation status...</p>
            )}
          </div>
        )}

        {/* DNS Records Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-secondary/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-5">Value</div>
            <div className="col-span-1 text-center">TTL</div>
            <div className="col-span-1 text-right">Copy</div>
          </div>

          {/* Records */}
          {records.map((record, index) => (
            <div
              key={index}
              className={cn(
                'grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-border last:border-b-0',
                'hover:bg-secondary/30 transition-colors'
              )}
            >
              <div className="col-span-2">
                <Badge 
                  variant="outline" 
                  className={cn('font-mono text-xs', recordTypeColors[record.type] || 'bg-secondary')}
                >
                  {record.type}
                </Badge>
              </div>
              <div className="col-span-3">
                <code className="text-sm font-mono text-foreground break-all">
                  {record.name}
                </code>
              </div>
              <div className="col-span-5">
                <code className="text-sm font-mono text-muted-foreground break-all">
                  {record.value}
                </code>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs text-muted-foreground">
                  {record.ttl || 'Auto'}
                </span>
              </div>
              <div className="col-span-1 text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(record.value, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copiedIndex === index ? 'Copied!' : 'Copy value'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>

        {/* Help Links */}
        <div className="flex items-center gap-4 pt-2">
          <a
            href="/dashboard/domains/configure-dns"
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            How to configure DNS
          </a>
          <a
            href="/dashboard/domains/dns-propagation"
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            DNS propagation check
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
