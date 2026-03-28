'use client';

import { useEffect, useState } from 'react';

interface SchemaComparison {
  database: string;
  liveTablesCount: number;
  expectedTablesCount: number;
  liveTables: string[];
  comparison: {
    hasChanges: boolean;
    missingTables: string[];
    missingColumns: Record<string, string[]>;
    missingIndexes: Record<string, string[]>;
  };
  migrationSQL: string | null;
  migrationStatementCount: number;
  error?: string;
}

interface MigrationResult {
  success: boolean;
  message: string;
  results: { statement: string; success: boolean; error?: string }[];
  summary: { total: number; success: number; failed: number };
}

export default function SchemaCheckPage() {
  const [data, setData] = useState<SchemaComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  useEffect(() => {
    async function fetchSchema() {
      try {
        const res = await fetch('/api/inspect-db');
        const json = await res.json();
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSchema();
  }, []);

  const copySQL = () => {
    if (data?.migrationSQL) {
      navigator.clipboard.writeText(data.migrationSQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const runMigration = async () => {
    if (!data?.migrationSQL) return;
    
    setMigrating(true);
    setMigrationResult(null);
    
    try {
      const res = await fetch('/api/run-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: data.migrationSQL })
      });
      
      const result = await res.json();
      setMigrationResult(result);
      
      // Refresh schema data after migration
      if (result.success) {
        setTimeout(() => {
          setLoading(true);
          fetch('/api/inspect-db')
            .then(res => res.json())
            .then(json => {
              if (!json.error) setData(json);
            })
            .finally(() => setLoading(false));
        }, 1000);
      }
    } catch (err: any) {
      setMigrationResult({
        success: false,
        message: err.message,
        results: [],
        summary: { total: 0, success: 0, failed: 0 }
      });
    } finally {
      setMigrating(false);
    }
  };

  const refreshSchema = () => {
    setLoading(true);
    setMigrationResult(null);
    fetch('/api/inspect-db')
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
          setError(null);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing database schema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Schema Comparison Error</h1>
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground">Database Schema Comparison</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshSchema}
              disabled={loading}
              className="bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            {data.comparison.hasChanges && data.migrationSQL && (
              <button
                onClick={runMigration}
                disabled={migrating}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {migrating ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Running Migration...
                  </>
                ) : (
                  'Run Migration'
                )}
              </button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mb-8">
          Comparing live <code className="bg-muted px-2 py-1 rounded">{data.database}</code> schema against codebase requirements
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Live Tables</p>
            <p className="text-2xl font-bold text-foreground">{data.liveTablesCount}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Expected Tables</p>
            <p className="text-2xl font-bold text-foreground">{data.expectedTablesCount}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Missing Tables</p>
            <p className="text-2xl font-bold text-destructive">{data.comparison.missingTables.length}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Migration Statements</p>
            <p className="text-2xl font-bold text-amber-500">{data.migrationStatementCount}</p>
          </div>
        </div>

        {/* Migration Result */}
        {migrationResult && (
          <div className={`rounded-lg p-4 mb-8 border ${
            migrationResult.success 
              ? 'bg-green-500/10 border-green-500' 
              : 'bg-destructive/10 border-destructive'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`font-medium ${migrationResult.success ? 'text-green-600' : 'text-destructive'}`}>
                {migrationResult.message}
              </p>
              <span className="text-sm text-muted-foreground">
                {migrationResult.summary.success}/{migrationResult.summary.total} statements
              </span>
            </div>
            {migrationResult.results.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  View details
                </summary>
                <div className="mt-2 max-h-48 overflow-y-auto bg-background/50 rounded p-2">
                  {migrationResult.results.map((r, i) => (
                    <div key={i} className={`text-xs font-mono py-1 ${r.success ? 'text-green-600' : 'text-destructive'}`}>
                      {r.success ? '✓' : '✗'} {r.statement}
                      {r.error && <span className="text-muted-foreground ml-2">({r.error})</span>}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Status Banner */}
        {!data.comparison.hasChanges ? (
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mb-8">
            <p className="text-green-600 font-medium">Schema is in sync! No migrations needed.</p>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-4 mb-8">
            <p className="text-amber-600 font-medium">Schema differences detected. Review the migration SQL below.</p>
          </div>
        )}

        {/* Missing Tables */}
        {data.comparison.missingTables.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Missing Tables ({data.comparison.missingTables.length})</h2>
            <div className="flex flex-wrap gap-2">
              {data.comparison.missingTables.map((table) => (
                <span key={table} className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-mono">
                  {table}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Columns */}
        {Object.keys(data.comparison.missingColumns).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Missing Columns</h2>
            <div className="bg-card border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-foreground">Table</th>
                    <th className="text-left p-3 text-sm font-medium text-foreground">Missing Columns</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.comparison.missingColumns).map(([table, columns]) => (
                    <tr key={table} className="border-t">
                      <td className="p-3 font-mono text-sm text-foreground">{table}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {columns.map((col) => (
                            <span key={col} className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded text-xs font-mono">
                              {col}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Missing Indexes */}
        {Object.keys(data.comparison.missingIndexes).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Missing Indexes</h2>
            <div className="bg-card border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-foreground">Table</th>
                    <th className="text-left p-3 text-sm font-medium text-foreground">Missing Indexes</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.comparison.missingIndexes).map(([table, indexes]) => (
                    <tr key={table} className="border-t">
                      <td className="p-3 font-mono text-sm text-foreground">{table}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {indexes.map((idx) => (
                            <span key={idx} className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded text-xs font-mono">
                              {idx}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Tables */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Live Tables ({data.liveTablesCount})</h2>
          <div className="flex flex-wrap gap-2">
            {data.liveTables.map((table) => (
              <span 
                key={table} 
                className={`px-3 py-1 rounded-full text-sm font-mono ${
                  data.comparison.missingColumns[table] || data.comparison.missingIndexes[table]
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {table}
              </span>
            ))}
          </div>
        </div>

        {/* Migration SQL */}
        {data.migrationSQL && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Safe Migration SQL</h2>
              <button
                onClick={copySQL}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{data.migrationSQL}</pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This SQL uses only non-destructive, idempotent statements (CREATE TABLE IF NOT EXISTS, ALTER TABLE ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
