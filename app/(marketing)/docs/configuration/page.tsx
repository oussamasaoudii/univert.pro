import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Settings, Globe, Shield, Eye, FileJson, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Configuration - Ovmon Documentation',
  description: 'Configure your websites, domains, and deployment settings in Ovmon.'
};

export default function ConfigurationPage() {
  const envVarExamples = [
    { name: 'DATABASE_URL', value: 'postgresql://...', description: 'Database connection string' },
    { name: 'API_KEY', value: 'sk_live_...', description: 'Third-party API key' },
    { name: 'NODE_ENV', value: 'production', description: 'Node environment' },
    { name: 'NEXT_PUBLIC_APP_URL', value: 'https://example.com', description: 'Public app URL' }
  ];

  return (
    <MarketingLayout
      title="Configuration"
      description="Configure your websites, domains, and deployment settings"
    >
      {/* Configuration File */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileJson className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Configuration File</h2>
        </div>
        <p className="text-muted-foreground">
          Ovmon uses an <code className="bg-secondary px-1 rounded">ovmon.json</code> file in your project root to configure deployments.
        </p>
        <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
          <code>{`{
  "name": "my-website",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1", "cdg1", "syd1"],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ]
}`}</code>
        </pre>
      </section>

      {/* Environment Variables */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Environment Variables</h2>
        </div>
        <p className="text-muted-foreground">
          Environment variables allow you to store sensitive configuration outside of your code.
          They can be set per environment: Production, Preview, and Development.
        </p>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Setting Environment Variables</h3>
          <p className="text-sm text-muted-foreground">Via the CLI:</p>
          <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
            <code>{`# Add a single variable
ovmon env add DATABASE_URL "postgresql://..." --environment production

# Add from a .env file
ovmon env import .env.local

# List all variables
ovmon env ls

# Remove a variable
ovmon env rm API_KEY`}</code>
          </pre>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50">
          <h3 className="font-semibold mb-4">Common Environment Variables</h3>
          <div className="space-y-3">
            {envVarExamples.map((env, idx) => (
              <div key={idx} className="flex items-start gap-4 py-2 border-b border-border last:border-b-0">
                <code className="text-sm bg-background px-2 py-1 rounded min-w-40">{env.name}</code>
                <span className="text-sm text-muted-foreground">{env.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> Variables prefixed with <code className="bg-background px-1 rounded">NEXT_PUBLIC_</code> will be exposed to the browser. Never prefix sensitive values with this prefix.
          </p>
        </div>
      </section>

      {/* Domains */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Custom Domains</h2>
        </div>
        <p className="text-muted-foreground">
          Connect your own domain to your Ovmon website for a professional presence.
        </p>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Adding a Custom Domain</h3>
          <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
            <li>Go to your website settings in the dashboard</li>
            <li>Click "Add Domain" and enter your domain name</li>
            <li>Configure your DNS records as shown below</li>
            <li>Wait for verification (usually within minutes)</li>
          </ol>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">DNS Configuration</h3>
          <p className="text-sm text-muted-foreground mb-4">Add these records to your DNS provider:</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2">Value</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4"><code>A</code></td>
                  <td className="py-2 pr-4">@</td>
                  <td className="py-2">76.76.21.21</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4"><code>CNAME</code></td>
                  <td className="py-2 pr-4">www</td>
                  <td className="py-2">cname.ovmon.app</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SSL */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">SSL Certificates</h2>
        </div>
        <p className="text-muted-foreground">
          Ovmon automatically provisions and renews SSL certificates for all your domains using Let's Encrypt.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <h4 className="font-semibold mb-2">Automatic SSL</h4>
            <p className="text-sm text-muted-foreground">
              SSL is automatically enabled for all custom domains. No configuration required.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <h4 className="font-semibold mb-2">HTTPS Redirect</h4>
            <p className="text-sm text-muted-foreground">
              All HTTP traffic is automatically redirected to HTTPS for security.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <h4 className="font-semibold mb-2">Certificate Renewal</h4>
            <p className="text-sm text-muted-foreground">
              Certificates are automatically renewed before expiration.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <h4 className="font-semibold mb-2">Custom Certificates</h4>
            <p className="text-sm text-muted-foreground">
              Enterprise plans can upload custom SSL certificates.
            </p>
          </div>
        </div>
      </section>

      {/* Monitoring */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Monitoring</h2>
        </div>
        <p className="text-muted-foreground">
          Monitor your website's performance and health with built-in analytics.
        </p>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Available Metrics</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Page views and unique visitors',
              'Geographic distribution',
              'Device and browser breakdown',
              'Top pages and referrers',
              'Response time (p50, p95, p99)',
              'Error rates and status codes',
              'Bandwidth usage',
              'Function invocations'
            ].map((metric, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                {metric}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Setting Up Alerts</h3>
          <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
            <code>{`# Configure alerts in ovmon.json
{
  "monitoring": {
    "alerts": [
      {
        "metric": "error_rate",
        "threshold": 5,
        "period": "5m",
        "channels": ["email", "slack"]
      },
      {
        "metric": "response_time_p95",
        "threshold": 2000,
        "period": "10m",
        "channels": ["email"]
      }
    ]
  }
}`}</code>
          </pre>
        </div>
      </section>

      {/* Next Steps */}
      <section className="space-y-4 p-6 rounded-lg border border-accent bg-accent/10">
        <h2 className="text-2xl font-bold">Related Documentation</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/deployment">
            <Button variant="outline" className="gap-2">
              Deployment <ArrowRight className="w-4 h-4" />
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
