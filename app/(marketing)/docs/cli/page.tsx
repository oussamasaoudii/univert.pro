import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Terminal, Download, Settings, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'CLI Tools - Ovmon Documentation',
  description: 'Command-line interface documentation for Ovmon.'
};

export default function CliToolsPage() {
  const commands = [
    {
      command: 'ovmon login',
      description: 'Authenticate with your Ovmon account',
      example: `ovmon login
# Opens browser for authentication
# Successfully logged in as user@example.com`
    },
    {
      command: 'ovmon init',
      description: 'Initialize a new Ovmon project',
      example: `ovmon init
# ? What is your project name? my-website
# ? What framework are you using? Next.js
# Created ovmon.json`
    },
    {
      command: 'ovmon deploy',
      description: 'Deploy your project',
      example: `ovmon deploy
# Uploading [====================] 100%
# Building...
# Deployed to: https://my-website-abc123.ovmon.app

# Deploy to production
ovmon deploy --prod`
    },
    {
      command: 'ovmon dev',
      description: 'Start local development server with Ovmon functions',
      example: `ovmon dev
# Starting development server...
# Ready on http://localhost:3000`
    },
    {
      command: 'ovmon env',
      description: 'Manage environment variables',
      example: `# Add a variable
ovmon env add DATABASE_URL "postgresql://..."

# List variables
ovmon env ls

# Import from file
ovmon env import .env.local

# Remove a variable
ovmon env rm API_KEY`
    },
    {
      command: 'ovmon domains',
      description: 'Manage custom domains',
      example: `# Add a domain
ovmon domains add example.com

# List domains
ovmon domains ls

# Remove a domain
ovmon domains rm example.com`
    },
    {
      command: 'ovmon logs',
      description: 'View deployment logs',
      example: `# View recent logs
ovmon logs

# Follow logs in real-time
ovmon logs --follow

# View logs for specific deployment
ovmon logs deploy_abc123`
    },
    {
      command: 'ovmon rollback',
      description: 'Rollback to a previous deployment',
      example: `# Rollback to previous deployment
ovmon rollback

# Rollback to specific deployment
ovmon rollback deploy_abc123`
    },
    {
      command: 'ovmon link',
      description: 'Link local directory to existing Ovmon project',
      example: `ovmon link
# ? Select a project: my-website
# Linked to my-website`
    },
    {
      command: 'ovmon whoami',
      description: 'Show the currently logged in user',
      example: `ovmon whoami
# Logged in as: user@example.com
# Team: My Team`
    }
  ];

  return (
    <MarketingLayout
      title="CLI Tools"
      description="Command-line interface for Ovmon"
    >
      {/* Installation */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Installation</h2>
        </div>
        <p className="text-muted-foreground">
          Install the Ovmon CLI globally using your preferred package manager:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <p className="text-sm font-semibold mb-2">npm</p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-sm">
              <code>npm install -g @ovmon/cli</code>
            </pre>
          </div>

          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <p className="text-sm font-semibold mb-2">yarn</p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-sm">
              <code>yarn global add @ovmon/cli</code>
            </pre>
          </div>

          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <p className="text-sm font-semibold mb-2">pnpm</p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-sm">
              <code>pnpm add -g @ovmon/cli</code>
            </pre>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-secondary/50">
          <p className="text-sm text-muted-foreground">Verify the installation:</p>
          <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-sm mt-2">
            <code>{`ovmon --version
# @ovmon/cli 2.5.0`}</code>
          </pre>
        </div>
      </section>

      {/* Commands */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Commands</h2>
        </div>

        <div className="space-y-6">
          {commands.map((cmd, idx) => (
            <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50 space-y-3">
              <div className="flex items-center gap-2">
                <code className="text-accent font-semibold">{cmd.command}</code>
              </div>
              <p className="text-sm text-muted-foreground">{cmd.description}</p>
              <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
                <code>{cmd.example}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Configuration */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Configuration</h2>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Global Configuration</h3>
          <p className="text-sm text-muted-foreground">
            The CLI stores global configuration in <code className="bg-background px-1 rounded">~/.ovmon/config.json</code>:
          </p>
          <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
            <code>{`{
  "currentTeam": "team_abc123",
  "api": "https://api.ovmon.com",
  "collectMetrics": true
}`}</code>
          </pre>
        </div>

        <div className="p-6 rounded-lg border border-border bg-secondary/50 space-y-4">
          <h3 className="font-semibold">Project Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Project-specific settings are stored in <code className="bg-background px-1 rounded">ovmon.json</code>:
          </p>
          <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
            <code>{`{
  "name": "my-website",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["iad1"]
}`}</code>
          </pre>
        </div>
      </section>

      {/* Common Flags */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Common Flags</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4">Flag</th>
                <th className="text-left py-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                { flag: '--help, -h', desc: 'Show help for a command' },
                { flag: '--version, -v', desc: 'Show CLI version' },
                { flag: '--token, -t', desc: 'Specify API token (for CI/CD)' },
                { flag: '--yes, -y', desc: 'Skip confirmation prompts' },
                { flag: '--debug', desc: 'Enable debug output' },
                { flag: '--no-color', desc: 'Disable colored output' },
                { flag: '--cwd', desc: 'Set current working directory' }
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="py-2 pr-4"><code>{item.flag}</code></td>
                  <td className="py-2">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Troubleshooting</h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="font-semibold mb-2">Command not found</h3>
            <p className="text-sm text-muted-foreground mb-3">
              If you get "command not found" after installation, ensure your global npm/yarn bin is in your PATH:
            </p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-sm">
              <code>{`# For npm
export PATH="$PATH:$(npm config get prefix)/bin"

# For yarn
export PATH="$PATH:$(yarn global bin)"`}</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="font-semibold mb-2">Authentication Issues</h3>
            <p className="text-sm text-muted-foreground mb-3">
              If you're having trouble logging in, try clearing your credentials:
            </p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-sm">
              <code>{`ovmon logout
ovmon login`}</code>
            </pre>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <h3 className="font-semibold mb-2">Debug Mode</h3>
            <p className="text-sm text-muted-foreground mb-3">
              For detailed error information, run commands with the debug flag:
            </p>
            <pre className="bg-background p-3 rounded border border-border overflow-x-auto text-sm">
              <code>ovmon deploy --debug</code>
            </pre>
          </div>
        </div>
      </section>

      {/* CI/CD Usage */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">CI/CD Usage</h2>
        <p className="text-muted-foreground">
          For automated deployments, use the <code className="bg-background px-1 rounded">--token</code> flag or set the <code className="bg-background px-1 rounded">OVMON_TOKEN</code> environment variable:
        </p>
        <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
          <code>{`# Using flag
ovmon deploy --prod --token $OVMON_TOKEN

# Using environment variable
export OVMON_TOKEN="your-token-here"
ovmon deploy --prod`}</code>
        </pre>
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
          <Link href="/docs/deployment">
            <Button variant="outline" className="gap-2">
              Deployment <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
