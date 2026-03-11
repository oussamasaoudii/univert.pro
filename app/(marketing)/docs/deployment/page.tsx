import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Zap, GitBranch, RotateCcw, TrendingUp, Globe, Clock, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Deployment - Ovmon Documentation',
  description: 'Learn how to deploy and manage your applications with Ovmon.'
};

export default function DeploymentPage() {
  return (
    <MarketingLayout
      title="Deployment"
      description="Deploy and manage your applications with confidence"
    >
      {/* Deployment Process */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Deployment Process</h2>
        </div>
        <p className="text-muted-foreground">
          Ovmon automatically detects your framework and optimizes the build process. Here's what happens when you deploy:
        </p>

        <div className="space-y-4">
          {[
            { step: 1, title: 'Clone', description: 'Your repository is cloned to our build servers' },
            { step: 2, title: 'Install', description: 'Dependencies are installed using your package manager' },
            { step: 3, title: 'Build', description: 'Your project is built using the detected framework' },
            { step: 4, title: 'Deploy', description: 'Built assets are distributed to our global edge network' },
            { step: 5, title: 'Activate', description: 'The deployment goes live and traffic is routed' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-background flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deployment Methods */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Deployment Methods</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-3">
            <h3 className="font-semibold">Git Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect your GitHub, GitLab, or Bitbucket repository for automatic deployments on every push.
            </p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-xs">
              <code>{`git push origin main
# Triggers automatic deployment`}</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-3">
            <h3 className="font-semibold">CLI Deployment</h3>
            <p className="text-sm text-muted-foreground">
              Deploy directly from your terminal using the Ovmon CLI.
            </p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-xs">
              <code>{`ovmon deploy
# or for production
ovmon deploy --prod`}</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-3">
            <h3 className="font-semibold">API Deployment</h3>
            <p className="text-sm text-muted-foreground">
              Trigger deployments programmatically using our REST API.
            </p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-xs">
              <code>{`POST /api/v1/deployments
{ "website_id": "web_123" }`}</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-3">
            <h3 className="font-semibold">Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Manually trigger deployments from the Ovmon dashboard with one click.
            </p>
          </div>
        </div>
      </section>

      {/* CI/CD Integration */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">CI/CD Integration</h2>
        </div>
        <p className="text-muted-foreground">
          Integrate Ovmon with your existing CI/CD pipelines.
        </p>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">GitHub Actions Example</h3>
          <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
            <code>{`name: Deploy to Ovmon

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Ovmon CLI
        run: npm install -g @ovmon/cli
        
      - name: Deploy
        run: ovmon deploy --prod --token \${{ secrets.OVMON_TOKEN }}
        env:
          OVMON_TOKEN: \${{ secrets.OVMON_TOKEN }}`}</code>
          </pre>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Preview Deployments</h3>
          <p className="text-sm text-muted-foreground">
            Every pull request automatically gets a unique preview URL for testing before merging.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              Unique URL for each PR
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              Comments posted to PR with preview link
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              Automatic cleanup when PR is closed
            </li>
          </ul>
        </div>
      </section>

      {/* Rollbacks */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Rollbacks</h2>
        </div>
        <p className="text-muted-foreground">
          Instantly rollback to any previous deployment if something goes wrong.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-3">
            <h3 className="font-semibold">Via Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Navigate to Deployments, find the deployment you want to restore, and click "Rollback to this deployment".
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-3">
            <h3 className="font-semibold">Via CLI</h3>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-xs">
              <code>{`# Rollback to previous deployment
ovmon rollback

# Rollback to specific deployment
ovmon rollback deploy_abc123`}</code>
            </pre>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
          <p className="text-sm text-green-200">
            <strong>Instant Rollbacks:</strong> Rollbacks are instant because we keep all previous deployments ready. No rebuild required.
          </p>
        </div>
      </section>

      {/* Scaling */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Scaling</h2>
        </div>
        <p className="text-muted-foreground">
          Ovmon automatically scales your applications to handle any amount of traffic.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <TrendingUp className="w-8 h-8 text-accent mb-3" />
            <h4 className="font-semibold mb-1">Auto-scaling</h4>
            <p className="text-sm text-muted-foreground">
              Functions automatically scale from zero to thousands of instances
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <Globe className="w-8 h-8 text-accent mb-3" />
            <h4 className="font-semibold mb-1">Global CDN</h4>
            <p className="text-sm text-muted-foreground">
              Static assets served from edge locations worldwide
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <Clock className="w-8 h-8 text-accent mb-3" />
            <h4 className="font-semibold mb-1">Edge Functions</h4>
            <p className="text-sm text-muted-foreground">
              Run code at the edge for ultra-low latency
            </p>
          </div>
        </div>
      </section>

      {/* Deployment Regions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Deployment Regions</h2>
        </div>
        <p className="text-muted-foreground">
          Choose where your serverless functions run for optimal performance.
        </p>

        <div className="p-6 rounded-lg border border-border bg-secondary/50">
          <h3 className="font-semibold mb-4">Available Regions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { code: 'iad1', name: 'Washington, D.C.' },
              { code: 'sfo1', name: 'San Francisco' },
              { code: 'cdg1', name: 'Paris' },
              { code: 'lhr1', name: 'London' },
              { code: 'fra1', name: 'Frankfurt' },
              { code: 'sin1', name: 'Singapore' },
              { code: 'syd1', name: 'Sydney' },
              { code: 'hnd1', name: 'Tokyo' }
            ].map((region, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-background">
                <code className="text-xs text-accent">{region.code}</code>
                <p className="text-sm mt-1">{region.name}</p>
              </div>
            ))}
          </div>
        </div>

        <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
          <code>{`// Configure regions in ovmon.json
{
  "regions": ["iad1", "cdg1", "sin1"]
}`}</code>
        </pre>
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
          <Link href="/docs/cli">
            <Button variant="outline" className="gap-2">
              CLI Tools <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
