'use client';

import { useState } from 'react';
import { Globe, CheckCircle2, AlertCircle, Clock, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DNSServer {
  name: string;
  location: string;
  ip: string;
  status: 'resolved' | 'pending' | 'failed';
  result?: string;
}

export default function DNSPropagationPage() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<DNSServer[]>([]);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCheck = async () => {
    if (!domain.trim()) {
      setErrorMessage('Please enter a domain.');
      return;
    }

    setIsChecking(true);
    setResults([]);
    setCompleted(false);
    setErrorMessage('');

    try {
      const response = await fetch(
        `/api/dashboard/domains/dns-check?domain=${encodeURIComponent(domain.trim())}&recordType=${encodeURIComponent(recordType)}`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_check_dns'));
      }

      setResults(Array.isArray(result?.results) ? result.results : []);
      setCompleted(true);
    } catch (error) {
      console.error('[dashboard/domains/dns-propagation] failed to check', error);
      setErrorMessage('DNS check failed. Please verify domain and try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const propagationPercentage =
    results.length > 0
      ? Math.round((results.filter((result) => result.status === 'resolved').length / results.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">DNS Propagation Check</h1>
          <p className="text-muted-foreground">Check DNS records across multiple public resolvers in real time</p>
        </div>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            DNS propagation typically takes 24-48 hours. This tool queries real DNS resolvers from backend.
          </AlertDescription>
        </Alert>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Enter Your Domain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Domain Name</label>
              <div className="flex gap-2">
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  disabled={isChecking}
                />
                <Button onClick={handleCheck} disabled={isChecking}>
                  {isChecking ? (
                    <>
                      <Globe className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Check
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Record Type</label>
              <select
                value={recordType}
                onChange={(event) => setRecordType(event.target.value)}
                disabled={isChecking}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              >
                <option>A</option>
                <option>AAAA</option>
                <option>MX</option>
                <option>CNAME</option>
                <option>TXT</option>
                <option>NS</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {completed && (
          <Card className="bg-card/50">
            <CardHeader>
              <div className="space-y-2">
                <CardTitle>Propagation Status</CardTitle>
                <CardDescription>Global DNS server responses for {domain}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Global Propagation</span>
                  <span className="text-sm font-semibold text-accent">{propagationPercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-accent transition-all duration-500" style={{ width: `${propagationPercentage}%` }} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground">
                      Resolved: {results.filter((result) => result.status === 'resolved').length}/{results.length}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-foreground">
                      Failed: {results.filter((result) => result.status === 'failed').length}/{results.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-foreground">DNS Server Results</h3>
                <div className="space-y-2">
                  {results.map((server, index) => (
                    <div key={`${server.ip}-${index}`} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${server.status === 'resolved' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {server.status === 'resolved' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{server.name}</p>
                          <p className="text-xs text-muted-foreground">{server.ip}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-foreground">{server.result || '-'}</p>
                        <p className="text-xs text-muted-foreground">{server.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert className={propagationPercentage === 100 ? 'bg-green-500/10' : 'bg-yellow-500/10'}>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  {propagationPercentage === 100
                    ? 'Your DNS records have fully propagated globally.'
                    : `Propagation is ${propagationPercentage}% complete. Check again in a few minutes.`}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {!completed && (
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-accent">•</span><span>Queries multiple DNS servers around the world</span></li>
                <li className="flex gap-2"><span className="text-accent">•</span><span>Checks if your DNS records have been updated globally</span></li>
                <li className="flex gap-2"><span className="text-accent">•</span><span>Shows results from major public DNS providers</span></li>
                <li className="flex gap-2"><span className="text-accent">•</span><span>Helps identify DNS propagation issues with real resolver errors</span></li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
