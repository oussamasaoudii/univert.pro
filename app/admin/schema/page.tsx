"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Database, Play, RefreshCw } from "lucide-react";

type SchemaStatus = {
  status: string;
  database: string;
  existingTables: string[];
  requiredTables?: string[];
  missingTables: string[];
  migrationsToRun?: number;
  message?: string;
  results?: { table: string; status: string; error?: string }[];
  tablesCreated?: number;
  errors?: { table: string; status: string; error?: string }[];
  finalTableCount?: number;
  finalTables?: string[];
  error?: string;
};

export default function SchemaManagementPage() {
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState<SchemaStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inspectSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/schema/migrate");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setStatus(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    if (!confirm("هل أنت متأكد من تشغيل الترحيل؟ سيتم إنشاء الجداول الناقصة.")) return;
    
    setMigrating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/schema/migrate", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setStatus(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Database Schema Management</h1>
        <p className="text-muted-foreground">فحص وترحيل قاعدة البيانات</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Schema Status
          </CardTitle>
          <CardDescription>
            فحص الجداول الموجودة والناقصة في قاعدة البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={inspectSchema} disabled={loading || migrating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "جاري الفحص..." : "فحص Schema"}
            </Button>
            {status?.missingTables && status.missingTables.length > 0 && (
              <Button onClick={runMigration} disabled={loading || migrating} variant="default">
                <Play className={`h-4 w-4 mr-2 ${migrating ? "animate-spin" : ""}`} />
                {migrating ? "جاري الترحيل..." : `تشغيل الترحيل (${status.missingTables.length} جداول)`}
              </Button>
            )}
          </div>

          {status && (
            <div className="space-y-4 mt-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{status.existingTables?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">جداول موجودة</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{status.requiredTables?.length || status.finalTableCount || 0}</div>
                  <div className="text-sm text-muted-foreground">جداول مطلوبة</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className={`text-2xl font-bold ${(status.missingTables?.length || 0) > 0 ? "text-destructive" : "text-green-600"}`}>
                    {status.missingTables?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">جداول ناقصة</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{status.database}</div>
                  <div className="text-sm text-muted-foreground">قاعدة البيانات</div>
                </div>
              </div>

              {/* Status Message */}
              {status.message && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.message}</AlertDescription>
                </Alert>
              )}

              {/* Migration Results */}
              {status.results && (
                <div className="space-y-2">
                  <h3 className="font-semibold">نتائج الترحيل:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {status.results.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                        {r.status === "created_or_exists" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span>{r.table}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Tables */}
              {status.missingTables && status.missingTables.length > 0 && !status.results && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-destructive">الجداول الناقصة:</h3>
                  <div className="flex flex-wrap gap-2">
                    {status.missingTables.map((table) => (
                      <Badge key={table} variant="destructive">{table}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Tables */}
              {status.existingTables && status.existingTables.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">الجداول الموجودة:</h3>
                  <div className="flex flex-wrap gap-2">
                    {(status.finalTables || status.existingTables).map((table) => (
                      <Badge key={table} variant="secondary">{table}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {status.errors && status.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-destructive">أخطاء:</h3>
                  {status.errors.map((e, i) => (
                    <Alert key={i} variant="destructive">
                      <AlertDescription>
                        <strong>{e.table}:</strong> {e.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
