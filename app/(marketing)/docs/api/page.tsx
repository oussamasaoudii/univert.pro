import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Code, Key, Globe, Webhook, Shield, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'API Reference - Ovmon Documentation',
  description: 'Complete API documentation with code examples for the Ovmon platform.',
  robots: { index: false, follow: false },
};

export default function ApiReferencePage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/websites',
      description: 'List all websites in your account',
      response: `{
  "data": [
    {
      "id": "web_abc123",
      "name": "my-website",
      "domain": "example.com",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1
  }
}`
    },
    {
      method: 'POST',
      path: '/api/v1/websites',
      description: 'Create a new website',
      body: `{
  "name": "my-new-website",
  "repository": "https://github.com/user/repo",
  "branch": "main",
  "framework": "nextjs"
}`,
      response: `{
  "id": "web_xyz789",
  "name": "my-new-website",
  "status": "building",
  "url": "my-new-website.ovmon.app"
}`
    },
    {
      method: 'GET',
      path: '/api/v1/websites/:id',
      description: 'Get details of a specific website',
      response: `{
  "id": "web_abc123",
  "name": "my-website",
  "domain": "example.com",
  "status": "active",
  "ssl": true,
  "analytics": {
    "visits": 15420,
    "bandwidth": "2.5 GB"
  }
}`
    },
    {
      method: 'POST',
      path: '/api/v1/deployments',
      description: 'Trigger a new deployment',
      body: `{
  "website_id": "web_abc123",
  "branch": "main",
  "production": true
}`,
      response: `{
  "id": "deploy_def456",
  "status": "queued",
  "url": "https://deploy-def456.ovmon.app"
}`
    },
    {
      method: 'GET',
      path: '/api/v1/domains',
      description: 'List all custom domains',
      response: `{
  "data": [
    {
      "id": "dom_ghi789",
      "domain": "example.com",
      "verified": true,
      "ssl_status": "active"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/domains',
      description: 'Add a custom domain',
      body: `{
  "website_id": "web_abc123",
  "domain": "custom.example.com"
}`,
      response: `{
  "id": "dom_jkl012",
  "domain": "custom.example.com",
  "verified": false,
  "dns_records": [
    {
      "type": "CNAME",
      "name": "custom",
      "value": "cname.ovmon.app"
    }
  ]
}`
    }
  ];

  const webhookEvents = [
    { event: 'deployment.created', description: 'A new deployment was initiated' },
    { event: 'deployment.succeeded', description: 'A deployment completed successfully' },
    { event: 'deployment.failed', description: 'A deployment failed' },
    { event: 'domain.verified', description: 'A custom domain was verified' },
    { event: 'website.created', description: 'A new website was created' },
    { event: 'website.deleted', description: 'A website was deleted' }
  ];

  return (
    <MarketingLayout
      title="API Reference"
      description="Complete API documentation with code examples"
    >
      {/* Authentication */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Key className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Authentication</h2>
        </div>
        <p className="text-muted-foreground">
          All API requests require authentication using a Bearer token. You can generate an API key from your dashboard settings.
        </p>
        <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
          <code>{`# Include your API key in the Authorization header
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.ovmon.com/v1/websites`}</code>
        </pre>
      </section>

      {/* Base URL */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Base URL</h2>
        </div>
        <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
          <code>https://api.ovmon.com/v1</code>
        </pre>
      </section>

      {/* Rate Limiting */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Rate Limiting</h2>
        </div>
        <p className="text-muted-foreground">
          API requests are rate limited based on your plan:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { plan: 'Free', limit: '100 requests/minute' },
            { plan: 'Pro', limit: '1,000 requests/minute' },
            { plan: 'Enterprise', limit: 'Unlimited' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-background">
              <p className="font-semibold">{item.plan}</p>
              <p className="text-sm text-muted-foreground">{item.limit}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Rate limit headers are included in all responses: <code className="bg-background px-1 rounded">X-RateLimit-Limit</code>, <code className="bg-background px-1 rounded">X-RateLimit-Remaining</code>, <code className="bg-background px-1 rounded">X-RateLimit-Reset</code>
        </p>
      </section>

      {/* Endpoints */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Code className="w-6 h-6 text-accent" />
          <h2 className="text-3xl font-bold">Endpoints</h2>
        </div>

        <div className="space-y-6">
          {endpoints.map((endpoint, idx) => (
            <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                  endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                  endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                  endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono">{endpoint.path}</code>
              </div>
              <p className="text-muted-foreground">{endpoint.description}</p>
              
              {endpoint.body && (
                <div>
                  <p className="text-sm font-semibold mb-2">Request Body:</p>
                  <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
                    <code>{endpoint.body}</code>
                  </pre>
                </div>
              )}
              
              <div>
                <p className="text-sm font-semibold mb-2">Response:</p>
                <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
                  <code>{endpoint.response}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Webhooks */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="w-6 h-6 text-accent" />
          <h2 className="text-3xl font-bold">Webhooks</h2>
        </div>
        <p className="text-muted-foreground">
          Configure webhooks in your dashboard to receive real-time notifications about events in your account.
        </p>
        
        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Webhook Payload</h3>
          <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
            <code>{`{
  "id": "evt_abc123",
  "type": "deployment.succeeded",
  "created": 1705312200,
  "data": {
    "deployment_id": "deploy_def456",
    "website_id": "web_abc123",
    "url": "https://example.ovmon.app"
  }
}`}</code>
          </pre>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50">
          <h3 className="font-semibold mb-4">Available Events</h3>
          <div className="space-y-2">
            {webhookEvents.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
                <code className="text-sm bg-background px-2 py-1 rounded">{item.event}</code>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Security Best Practices</h2>
        </div>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
            Never expose your API key in client-side code
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
            Use environment variables to store your API key
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
            Rotate your API keys regularly
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
            Verify webhook signatures to ensure authenticity
          </li>
        </ul>
      </section>

      {/* Next Steps */}
      <section className="space-y-4 p-6 rounded-lg border border-accent bg-accent/10">
        <h2 className="text-2xl font-bold">Related Documentation</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/getting-started">
            <Button variant="outline" className="gap-2">
              Getting Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/docs/security">
            <Button variant="outline" className="gap-2">
              Security <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
