import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Code, Zap, Lock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'API - Ovmon Developer Platform',
  description: 'Powerful REST API for programmatic access to Ovmon services.',
  robots: { index: false, follow: false },
};

export default function ApiPage() {
  return (
    <MarketingLayout
      title="API"
      description="Powerful REST API for building with Ovmon"
    >
      {/* Quick Start */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Get Started with the API</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Lock,
              title: 'Get an API Key',
              desc: 'Generate API keys from your dashboard'
            },
            {
              icon: BookOpen,
              title: 'Read the Docs',
              desc: 'Complete documentation and examples'
            },
            {
              icon: Zap,
              title: 'Start Building',
              desc: 'Integrate Ovmon into your app'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50 text-center">
                <Icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* API Endpoints */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Main Endpoints</h2>
        <div className="space-y-4">
          {[
            {
              method: 'GET',
              path: '/api/v1/websites',
              description: 'List all websites'
            },
            {
              method: 'POST',
              path: '/api/v1/websites',
              description: 'Create a new website'
            },
            {
              method: 'GET',
              path: '/api/v1/websites/:id',
              description: 'Get website details'
            },
            {
              method: 'PUT',
              path: '/api/v1/websites/:id',
              description: 'Update website'
            },
            {
              method: 'DELETE',
              path: '/api/v1/websites/:id',
              description: 'Delete website'
            },
            {
              method: 'GET',
              path: '/api/v1/domains',
              description: 'List domains'
            },
            {
              method: 'POST',
              path: '/api/v1/deployments',
              description: 'Trigger a deployment'
            },
            {
              method: 'GET',
              path: '/api/v1/monitoring/health',
              description: 'Get website health'
            }
          ].map((endpoint, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50 font-mono text-sm">
              <div className="flex items-start justify-between mb-2">
                <span className="inline-block px-2 py-1 rounded bg-accent text-background font-bold">
                  {endpoint.method}
                </span>
                <code className="text-accent">{endpoint.path}</code>
              </div>
              <p className="text-muted-foreground">{endpoint.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Authentication */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Authentication</h2>
        <div className="p-6 rounded-lg border border-border bg-secondary/50">
          <h3 className="text-lg font-semibold mb-4">API Key Authentication</h3>
          <p className="text-muted-foreground mb-4">
            Include your API key in the Authorization header:
          </p>
          <pre className="bg-background p-4 rounded overflow-x-auto text-sm mb-4">
            <code>{`Authorization: Bearer YOUR_API_KEY_HERE

# Example request
curl -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  https://api.ovmon.com/v1/websites`}</code>
          </pre>
          <p className="text-sm text-muted-foreground">
            Keep your API keys secure and rotate them regularly. Never commit keys to version control.
          </p>
        </div>
      </section>

      {/* SDKs */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Official SDKs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              lang: 'JavaScript/TypeScript',
              pkg: '@ovmon/sdk',
              cmd: 'npm install @ovmon/sdk'
            },
            {
              lang: 'Python',
              pkg: 'ovmon-sdk',
              cmd: 'pip install ovmon-sdk'
            },
            {
              lang: 'Go',
              pkg: 'github.com/ovmon/go-sdk',
              cmd: 'go get github.com/ovmon/go-sdk'
            },
            {
              lang: 'Ruby',
              pkg: 'ovmon',
              cmd: 'gem install ovmon'
            }
          ].map((sdk, idx) => (
            <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50">
              <h3 className="font-semibold mb-2">{sdk.lang}</h3>
              <p className="text-sm text-muted-foreground mb-3">Package: <code className="text-accent">{sdk.pkg}</code></p>
              <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                <code>{sdk.cmd}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Code Examples</h2>

        <div className="p-6 rounded-lg border border-border bg-secondary/50">
          <h3 className="text-lg font-semibold mb-4">Create a Website</h3>
          <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
            <code>{`import { OvmonClient } from '@ovmon/sdk';

const client = new OvmonClient({
  apiKey: process.env.OVMON_API_KEY
});

const website = await client.websites.create({
  name: 'my-website',
  domain: 'example.com',
  repository: 'https://github.com/user/repo',
  framework: 'next'
});

console.log('Website created:', website.id);`}</code>
          </pre>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50">
          <h3 className="text-lg font-semibold mb-4">Get Website Monitoring Data</h3>
          <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
            <code>{`const health = await client.monitoring.getHealth(
  'website_id'
);

console.log('Status:', health.status);
console.log('Uptime:', health.uptime + '%');
console.log('Response Time:', health.responseTimeMs + 'ms');`}</code>
          </pre>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">Rate Limiting</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            API requests are rate limited to prevent abuse. Check response headers for current limits:
          </p>
          <ul className="space-y-2 ml-4">
            <li><code className="text-accent">X-RateLimit-Limit</code>: Maximum requests per minute</li>
            <li><code className="text-accent">X-RateLimit-Remaining</code>: Requests remaining in current window</li>
            <li><code className="text-accent">X-RateLimit-Reset</code>: Unix timestamp when limit resets</li>
          </ul>
        </div>
      </section>

      {/* Webhooks */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">Webhooks</h2>
        <p className="text-muted-foreground mb-4">
          Subscribe to events and receive real-time notifications when they occur:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <code className="text-accent">website.created</code> - New website deployed</li>
          <li>• <code className="text-accent">website.deployed</code> - Deployment completed</li>
          <li>• <code className="text-accent">domain.verified</code> - Domain verified</li>
          <li>• <code className="text-accent">ssl.issued</code> - SSL certificate issued</li>
          <li>• <code className="text-accent">monitoring.alert</code> - Health alert triggered</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1">View Full API Docs</Button>
          <Button variant="outline" className="flex-1">Try Interactive Demo</Button>
        </div>
      </section>

      {/* Support */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/30">
        <h2 className="text-2xl font-bold">API Support</h2>
        <p className="text-muted-foreground">
          Have questions about the API? Check out our{' '}
          <a href="/docs" className="text-accent hover:underline">
            documentation
          </a>{' '}
          or contact us at{' '}
          <a href="mailto:api@ovmon.com" className="text-accent hover:underline">
            api@ovmon.com
          </a>
        </p>
      </section>
    </MarketingLayout>
  );
}
