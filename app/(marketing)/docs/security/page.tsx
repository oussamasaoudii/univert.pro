import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Shield, Lock, Key, Eye, Database, FileCheck, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Security - Ovmon Documentation',
  description: 'Security best practices and guidelines for the Ovmon platform.',
  robots: { index: false, follow: false },
};

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All data is encrypted at rest using AES-256 and in transit using TLS 1.3'
    },
    {
      icon: Key,
      title: 'Access Control',
      description: 'Role-based access control (RBAC) with fine-grained permissions'
    },
    {
      icon: Database,
      title: 'Secure Backups',
      description: 'Automated encrypted backups with point-in-time recovery'
    },
    {
      icon: FileCheck,
      title: 'Compliance',
      description: 'SOC 2 Type II certified with GDPR and CCPA compliance'
    }
  ];

  return (
    <MarketingLayout
      title="Security"
      description="Security best practices and guidelines"
    >
      {/* Overview */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-semibold">Security Overview</h2>
        </div>
        <p className="text-muted-foreground">
          Security is fundamental to Ovmon. We implement industry-leading security 
          practices to protect your data and applications. This page outlines our 
          security measures and best practices for your deployments.
        </p>
      </section>

      {/* Security Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityFeatures.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50">
              <Icon className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </section>

      {/* Data Encryption */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Data Encryption</h2>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Encryption at Rest</h3>
          <p className="text-muted-foreground">
            All stored data is encrypted using AES-256 encryption. This includes:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'Source code and build artifacts',
              'Environment variables and secrets',
              'Database backups',
              'Log files and analytics data'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Encryption in Transit</h3>
          <p className="text-muted-foreground">
            All network traffic is encrypted using TLS 1.3. We enforce:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'HTTPS-only connections (HTTP redirects to HTTPS)',
              'HSTS headers on all responses',
              'Certificate pinning for API connections',
              'Perfect forward secrecy (PFS)'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Access Control */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Access Control</h2>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Role-Based Access Control (RBAC)</h3>
          <p className="text-muted-foreground mb-4">
            Manage team access with granular permissions:
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4">Role</th>
                  <th className="text-left py-2 pr-4">Deploy</th>
                  <th className="text-left py-2 pr-4">Settings</th>
                  <th className="text-left py-2">Billing</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4 font-medium">Owner</td>
                  <td className="py-2 pr-4"><Check className="w-4 h-4 text-accent" /></td>
                  <td className="py-2 pr-4"><Check className="w-4 h-4 text-accent" /></td>
                  <td className="py-2"><Check className="w-4 h-4 text-accent" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4 font-medium">Admin</td>
                  <td className="py-2 pr-4"><Check className="w-4 h-4 text-accent" /></td>
                  <td className="py-2 pr-4"><Check className="w-4 h-4 text-accent" /></td>
                  <td className="py-2">-</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4 font-medium">Developer</td>
                  <td className="py-2 pr-4"><Check className="w-4 h-4 text-accent" /></td>
                  <td className="py-2 pr-4">-</td>
                  <td className="py-2">-</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Viewer</td>
                  <td className="py-2 pr-4">-</td>
                  <td className="py-2 pr-4">-</td>
                  <td className="py-2">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">API Key Management</h3>
          <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
            <code>{`# Generate a new API key with limited scope
ovmon tokens create --name "CI Deploy" --scope deploy:write

# List all API keys
ovmon tokens list

# Revoke an API key
ovmon tokens revoke tok_abc123`}</code>
          </pre>
        </div>
      </section>

      {/* Backups */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Backups & Recovery</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="font-semibold mb-3">Automated Backups</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                Daily automated backups
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                30-day retention period
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                Geo-redundant storage
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="font-semibold mb-3">Point-in-Time Recovery</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                Restore to any point in time
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                Transaction log backups
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                Enterprise: 90-day retention
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Security Best Practices</h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="font-semibold mb-3">Environment Variables</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Never commit secrets to your repository
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Use different API keys for production and development
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Rotate secrets regularly (recommended: every 90 days)
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Never prefix sensitive variables with NEXT_PUBLIC_
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="font-semibold mb-3">Application Security</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Enable CORS only for trusted domains
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Implement rate limiting on API endpoints
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Validate and sanitize all user inputs
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Use Content Security Policy (CSP) headers
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="font-semibold mb-3">Recommended Security Headers</h3>
            <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
              <code>{`// Add to ovmon.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=()" }
      ]
    }
  ]
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Compliance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'SOC 2 Type II',
              description: 'Audited annually for security, availability, and confidentiality'
            },
            {
              title: 'GDPR',
              description: 'Full compliance with EU data protection regulations'
            },
            {
              title: 'CCPA',
              description: 'Compliant with California Consumer Privacy Act'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50">
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Report Vulnerability */}
      <section className="space-y-4 p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
        <h2 className="text-2xl font-bold">Report a Vulnerability</h2>
        <p className="text-muted-foreground">
          If you discover a security vulnerability, please report it responsibly to{' '}
          <a href="mailto:security@ovmon.com" className="text-accent hover:underline">
            security@ovmon.com
          </a>
          . We take all reports seriously and will respond within 24 hours.
        </p>
      </section>

      {/* Next Steps */}
      <section className="space-y-4 p-6 rounded-lg border border-accent bg-accent/10">
        <h2 className="text-2xl font-bold">Related Documentation</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/configuration">
            <Button variant="outline" className="gap-2">
              Configuration <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/docs/api">
            <Button variant="outline" className="gap-2">
              API Reference <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
