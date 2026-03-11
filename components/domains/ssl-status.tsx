'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  RefreshCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SSLStatusProps {
  status: 'pending' | 'active' | 'expired' | 'failed';
  domain: string;
  issuer?: string;
  validFrom?: string;
  validUntil?: string;
  autoRenew?: boolean;
  onRenew?: () => void;
}

export function SSLStatus({
  status,
  domain,
  issuer = "Let's Encrypt",
  validFrom,
  validUntil,
  autoRenew = true,
  onRenew,
}: SSLStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      shieldIcon: Shield,
      label: 'Issuing Certificate',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      progress: 60,
      description: 'SSL certificate is being issued. This usually takes a few minutes.',
    },
    active: {
      icon: CheckCircle2,
      shieldIcon: ShieldCheck,
      label: 'Secured',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      progress: 100,
      description: 'Your connection is secured with a valid SSL certificate.',
    },
    expired: {
      icon: AlertTriangle,
      shieldIcon: ShieldAlert,
      label: 'Expired',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      progress: 0,
      description: 'Your SSL certificate has expired. Renew immediately to secure your site.',
    },
    failed: {
      icon: ShieldX,
      shieldIcon: ShieldX,
      label: 'Failed',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      progress: 0,
      description: 'SSL certificate issuance failed. Please verify your DNS configuration.',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const ShieldIcon = config.shieldIcon;

  const daysUntilExpiry = validUntil
    ? Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              SSL Certificate
            </CardTitle>
            <CardDescription className="mt-1">
              HTTPS encryption for <span className="font-mono text-foreground">{domain}</span>
            </CardDescription>
          </div>
          <Badge className={cn('gap-1.5', config.bg)}>
            <ShieldIcon className={cn('w-3.5 h-3.5', config.color)} />
            <span className={config.color}>{config.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Card */}
        <div className={cn('p-4 rounded-lg border', config.bg)}>
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-lg', config.bg)}>
              <ShieldIcon className={cn('w-8 h-8', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{config.description}</p>
              
              {status === 'pending' && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Issuance progress</span>
                    <span className="text-foreground font-medium">{config.progress}%</span>
                  </div>
                  <Progress value={config.progress} className="h-1.5" />
                </div>
              )}

              {status === 'active' && validUntil && (
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Valid until:</span>
                    <span className={cn(
                      'font-medium',
                      isExpiringSoon ? 'text-yellow-400' : 'text-foreground'
                    )}>
                      {new Date(validUntil).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {daysUntilExpiry !== null && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        isExpiringSoon 
                          ? 'border-yellow-500/30 text-yellow-400' 
                          : 'border-border text-muted-foreground'
                      )}
                    >
                      {daysUntilExpiry} days left
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certificate Details */}
        {status === 'active' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Issuer</p>
              <p className="text-sm font-medium text-foreground">{issuer}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Auto-Renew</p>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  autoRenew ? 'bg-green-500' : 'bg-muted-foreground'
                )} />
                <p className="text-sm font-medium text-foreground">
                  {autoRenew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {(status === 'expired' || status === 'failed') && (
          <Button className="w-full gap-2" onClick={onRenew}>
            <RefreshCcw className="w-4 h-4" />
            {status === 'expired' ? 'Renew Certificate' : 'Retry Issuance'}
          </Button>
        )}

        {status === 'pending' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Certificate issuance typically completes within 5 minutes</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
