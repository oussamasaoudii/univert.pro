'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const dnsProviders = [
  {
    name: 'Namecheap',
    icon: '🔧',
    steps: [
      'Log in to your Namecheap account',
      'Go to "Domain List" and click "Manage" next to your domain',
      'Click on the "Advanced DNS" tab',
      'Add your DNS records in the Custom DNS section',
      'Click "Save Changes"'
    ]
  },
  {
    name: 'GoDaddy',
    icon: '🌐',
    steps: [
      'Log in to your GoDaddy account',
      'Go to "My Products" and select your domain',
      'Click on "DNS" in the domain details page',
      'Update or add your DNS records',
      'Save your changes'
    ]
  },
  {
    name: 'Cloudflare',
    icon: '☁️',
    steps: [
      'Log in to your Cloudflare account',
      'Select your domain from the list',
      'Go to the "DNS" tab',
      'Add your DNS records',
      'Changes are saved automatically'
    ]
  },
  {
    name: 'Google Domains',
    icon: '🔍',
    steps: [
      'Log in to your Google Domains account',
      'Select your domain',
      'Click on "DNS" in the left menu',
      'Edit your DNS records in the "Custom records" section',
      'Click "Save"'
    ]
  }
];

export default function ConfigureDNSPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState(0);

  const sampleRecords = [
    { type: 'A', name: '@', value: '192.0.2.1', ttl: 3600 },
    { type: 'CNAME', name: 'www', value: 'example.com', ttl: 3600 },
    { type: 'MX', name: '@', value: 'mail.example.com', ttl: 3600 },
    { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.example.com ~all', ttl: 3600 }
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">How to Configure DNS</h1>
          <p className="text-muted-foreground">
            Step-by-step guide to configure your domain's DNS records with your registrar
          </p>
        </div>

        {/* Important Note */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            DNS changes can take up to 48 hours to propagate worldwide. However, most changes are visible within a few hours.
          </AlertDescription>
        </Alert>

        {/* Overview */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>What are DNS Records?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              DNS (Domain Name System) records direct your domain name to the correct IP address or service. The main types are:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="font-medium text-foreground">A Record</p>
                <p className="text-sm text-muted-foreground">Points your domain to an IPv4 address</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="font-medium text-foreground">CNAME Record</p>
                <p className="text-sm text-muted-foreground">Creates an alias to another domain</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="font-medium text-foreground">MX Record</p>
                <p className="text-sm text-muted-foreground">Routes email to mail servers</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="font-medium text-foreground">TXT Record</p>
                <p className="text-sm text-muted-foreground">Stores text information for verification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Records */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Sample DNS Records</CardTitle>
            <CardDescription>These are typical DNS records you might need to configure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sampleRecords.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="flex-1">
                    <div className="font-mono text-sm text-foreground">
                      <span className="font-semibold text-accent">{record.type}</span>
                      {' | '}
                      <span>{record.name}</span>
                      {' → '}
                      <span className="text-muted-foreground">{record.value}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(record.value, `record-${idx}`)}
                  >
                    {copied === `record-${idx}` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Provider-Specific Instructions */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Provider-Specific Instructions</CardTitle>
            <CardDescription>Select your DNS provider to see detailed setup instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dnsProviders.map((provider, idx) => (
                <button
                  key={idx}
                  onClick={() => setExpandedProvider(expandedProvider === idx ? -1 : idx)}
                  className="w-full rounded-lg border border-border bg-secondary/30 p-4 text-left transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{provider.icon}</span>
                      <span className="font-medium text-foreground">{provider.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedProvider === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedProvider === idx && (
                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      {provider.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="flex gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                            {stepIdx + 1}
                          </div>
                          <p className="text-sm text-muted-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Always make a backup of your current DNS records before making changes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Use appropriate TTL values (lower TTL for frequent changes, higher for stable records)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Double-check record values before saving - typos can break your domain</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Wait 15-30 minutes before testing DNS changes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Use DNS propagation checker tools to verify global DNS updates</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
