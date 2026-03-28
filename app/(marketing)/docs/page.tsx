import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Code, Settings, Zap, Shield, BookOpen, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Documentation - Ovmon',
  description: 'Complete API documentation, guides, and examples for Ovmon platform.',
  robots: { index: false, follow: false },
};

export default function DocumentationPage() {
  const sections = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of Ovmon and deploy your first website',
      topics: ['Installation', 'Quick Start', 'Configuration', 'First Deployment'],
      href: '/docs/getting-started'
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Complete API documentation with code examples',
      topics: ['Authentication', 'Endpoints', 'Webhooks', 'Rate Limiting'],
      href: '/docs/api'
    },
    {
      icon: Settings,
      title: 'Configuration',
      description: 'Configure your websites, domains, and deployment settings',
      topics: ['Environment Variables', 'Domains', 'SSL', 'Monitoring'],
      href: '/docs/configuration'
    },
    {
      icon: Zap,
      title: 'Deployment',
      description: 'Deploy and manage your applications',
      topics: ['Deployment Process', 'CI/CD Integration', 'Rollbacks', 'Scaling'],
      href: '/docs/deployment'
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Best practices and security guidelines',
      topics: ['Data Encryption', 'Access Control', 'Backups', 'Compliance'],
      href: '/docs/security'
    },
    {
      icon: GitBranch,
      title: 'CLI Tools',
      description: 'Command-line interface for Ovmon',
      topics: ['Installation', 'Commands', 'Configuration', 'Troubleshooting'],
      href: '/docs/cli'
    }
  ];

  return (
    <MarketingLayout
      title="Documentation"
      description="Complete guides and API reference for Ovmon"
    >
      {/* Main Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <Link key={idx} href={section.href} className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group block">
              <Icon className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              <ul className="space-y-2 mb-4">
                {section.topics.map((topic, tidx) => (
                  <li key={tidx} className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    {topic}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm">View Docs</Button>
            </Link>
          );
        })}
      </section>

      {/* Code Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Code Examples</h2>
        
        <div className="space-y-4">
          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="text-lg font-semibold mb-4">Deploy a Website</h3>
            <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
              <code>{`const ovmon = require('@ovmon/sdk');

const client = new ovmon.Client({
  apiKey: process.env.OVMON_API_KEY
});

const website = await client.websites.create({
  name: 'my-website',
  domain: 'example.com',
  repository: 'https://github.com/user/repo'
});

console.log('Website deployed:', website.id);`}</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="text-lg font-semibold mb-4">Create a Domain</h3>
            <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
              <code>{`const domain = await client.domains.create({
  websiteId: 'web_123',
  domain: 'subdomain.example.com',
  type: 'custom_domain'
});

// Verify DNS records
const verification = await client.domains.verify(domain.id);

console.log('Domain verified:', verification.status);`}</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="text-lg font-semibold mb-4">Monitor Website</h3>
            <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
              <code>{`const health = await client.monitoring.getHealth('web_123');

console.log('Status:', health.status);
console.log('Uptime:', health.uptime);
console.log('Response Time:', health.responseTimeMs + 'ms');`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* API Status */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">API Status</h2>
        <p className="text-muted-foreground mb-4">All systems operational</p>
        <div className="space-y-2">
          {[
            { name: 'API', status: 'operational' },
            { name: 'Webhooks', status: 'operational' },
            { name: 'Dashboard', status: 'operational' },
            { name: 'Database', status: 'operational' }
          ].map((service, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span>{service.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground capitalize">{service.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'API Reference', desc: 'Complete API endpoint documentation' },
            { title: 'Tutorials', desc: 'Step-by-step guides for common tasks' },
            { title: 'FAQ', desc: 'Frequently asked questions and answers' },
            { title: 'Changelog', desc: 'Latest updates and new features' }
          ].map((resource, idx) => (
            <a
              key={idx}
              href="#"
              className="p-4 rounded-lg border border-border bg-background hover:bg-secondary hover:border-accent transition-colors"
            >
              <h3 className="font-semibold mb-1">{resource.title}</h3>
              <p className="text-sm text-muted-foreground">{resource.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/30">
        <h2 className="text-2xl font-bold">Need Help?</h2>
        <p className="text-muted-foreground">
          Can't find what you're looking for? Contact our support team at{' '}
          <a href="mailto:docs@ovmon.com" className="text-accent hover:underline">
            docs@ovmon.com
          </a>
        </p>
      </section>
    </MarketingLayout>
  );
}
