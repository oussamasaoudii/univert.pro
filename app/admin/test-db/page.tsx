'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function TestDBPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/health/db');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to connect to database');
        setResult(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Connection Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the connection to the MySQL database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Click the button below to test the database connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={loading} size="lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Testing...' : 'Test Database Connection'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert variant={result.status === 'success' ? 'default' : 'destructive'}>
                <div className="flex items-center gap-2">
                  {result.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>{result.message}</AlertDescription>
                </div>
              </Alert>

              <div className="bg-muted p-4 rounded-lg space-y-3 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <span className={result.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    {result.status}
                  </span>
                </div>
                {result.database && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Host: </span>
                      <span>{result.database.host}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Port: </span>
                      <span>{result.database.port}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Database: </span>
                      <span>{result.database.database}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Username: </span>
                      <span>{result.database.username}</span>
                    </div>
                  </>
                )}
                {result.response_time_ms && (
                  <div>
                    <span className="text-muted-foreground">Response Time: </span>
                    <span>{result.response_time_ms}ms</span>
                  </div>
                )}
                {result.timestamp && (
                  <div>
                    <span className="text-muted-foreground">Timestamp: </span>
                    <span>{new Date(result.timestamp).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
