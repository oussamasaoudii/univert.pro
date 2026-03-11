'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Globe, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type TemplateMapping = {
  id: string;
  templateName: string;
  category: string;
  stack: string;
  profile: string;
  serverPool: string;
  pricing: string;
  featured: boolean;
  websites: number;
};

type TemplateMappingSnapshot = {
  mappings: TemplateMapping[];
  stats: {
    totalTemplates: number;
    totalWebsites: number;
    featuredCount: number;
  };
  poolDistribution: Array<{ pool: string; templates: number; websites: number }>;
};

const stackColors: Record<string, string> = {
  'Next.js': 'bg-black text-white',
  Laravel: 'bg-red-600 text-white',
  WordPress: 'bg-blue-600 text-white',
};

export default function TemplateProfileMappingPage() {
  const [data, setData] = useState<TemplateMappingSnapshot>({
    mappings: [],
    stats: { totalTemplates: 0, totalWebsites: 0, featuredCount: 0 },
    poolDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadMappings = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/template-mapping', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_template_mapping'));
      }

      setData(result as TemplateMappingSnapshot);
    } catch (error) {
      console.error('[admin/template-mapping] failed to load', error);
      setErrorMessage('Failed to load template mapping from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMappings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Template Mapping</h1>
        <p className="text-muted-foreground">Assign templates to provisioning profiles and server pools</p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Total Templates</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{data.stats.totalTemplates}</p>
              <Zap className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Featured</p>
            <p className="text-2xl font-bold">{data.stats.featuredCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Total Websites</p>
            <p className="text-2xl font-bold">{data.stats.totalWebsites}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Template Profiles</CardTitle>
          <CardDescription>Manage template deployment configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading mappings...</div>
          ) : data.mappings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No mappings found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Template</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Stack</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Profile</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Server Pool</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Pricing</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Websites</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mappings.map((template) => {
                    const stackColor = stackColors[template.stack] || 'bg-gray-700 text-white';
                    return (
                      <tr key={template.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 font-semibold">{template.templateName}</td>
                        <td className="py-4 px-4 capitalize text-sm text-muted-foreground">{template.category}</td>
                        <td className="py-4 px-4"><Badge className={`${stackColor} text-xs`}>{template.stack}</Badge></td>
                        <td className="py-4 px-4 text-sm">{template.profile}</td>
                        <td className="py-4 px-4 text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" />{template.serverPool}</td>
                        <td className="py-4 px-4 font-semibold">{template.pricing}</td>
                        <td className="py-4 px-4">
                          {template.featured && <Badge className="bg-accent/10 text-accent hover:bg-accent/20 text-xs">Featured</Badge>}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold">{template.websites}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Server Pool Distribution</CardTitle>
          <CardDescription>How templates are distributed across infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {data.poolDistribution.map((pool) => (
              <div key={pool.pool} className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold">{pool.pool}</h3>
                <p className="text-2xl font-bold mt-2">{pool.templates}</p>
                <p className="text-xs text-muted-foreground">
                  {pool.templates} template{pool.templates > 1 ? 's' : ''} • {pool.websites} websites
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
