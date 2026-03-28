import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { BookOpen, Terminal, Settings, Rocket, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Getting Started - Ovmon Documentation',
  description: 'Learn the basics of Ovmon and deploy your first website in minutes.',
  robots: { index: false, follow: false },
};

export default function GettingStartedPage() {
  const steps = [
    {
      step: 1,
      title: 'Create an Account',
      description: 'Sign up for a free Ovmon account to get started. You can use your email or sign in with Google.',
      code: null
    },
    {
      step: 2,
      title: 'Install the CLI',
      description: 'Install the Ovmon CLI to manage your projects from the command line.',
      code: `npm install -g @ovmon/cli

# Or using yarn
yarn global add @ovmon/cli

# Verify installation
ovmon --version`
    },
    {
      step: 3,
      title: 'Login to CLI',
      description: 'Authenticate the CLI with your Ovmon account.',
      code: `ovmon login

# This will open your browser for authentication
# After successful login, you'll see: "Successfully logged in!"`
    },
    {
      step: 4,
      title: 'Initialize Your Project',
      description: 'Navigate to your project directory and initialize Ovmon.',
      code: `cd your-project

ovmon init

# Follow the prompts to configure your project
# This creates an ovmon.json configuration file`
    },
    {
      step: 5,
      title: 'Deploy',
      description: 'Deploy your project with a single command.',
      code: `ovmon deploy

# Your site will be live at: your-project.ovmon.app`
    }
  ];

  const features = [
    {
      icon: Rocket,
      title: 'Instant Deployments',
      description: 'Deploy in seconds with our optimized build system'
    },
    {
      icon: Settings,
      title: 'Zero Configuration',
      description: 'Works out of the box with popular frameworks'
    },
    {
      icon: Terminal,
      title: 'Powerful CLI',
      description: 'Full control from the command line'
    }
  ];

  return (
    <MarketingLayout
      title="Getting Started"
      description="Learn the basics of Ovmon and deploy your first website in minutes"
    >
      {/* Quick Overview */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-semibold">Quick Overview</h2>
        </div>
        <p className="text-muted-foreground">
          Ovmon is a modern deployment platform that makes it easy to host your websites 
          and applications. With automatic SSL, global CDN, and instant deployments, 
          you can focus on building while we handle the infrastructure.
        </p>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="p-4 rounded-lg border border-border bg-background">
              <Icon className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </section>

      {/* Step by Step Guide */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Step-by-Step Guide</h2>
        
        <div className="space-y-8">
          {steps.map((item, idx) => (
            <div key={idx} className="relative pl-8 border-l-2 border-accent/30 last:border-l-transparent">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-background">
                {item.step}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {item.code && (
                  <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-sm">
                    <code>{item.code}</code>
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prerequisites */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">Prerequisites</h2>
        <ul className="space-y-2">
          {[
            'Node.js 18.0 or higher',
            'npm, yarn, or pnpm package manager',
            'A modern web browser',
            'Git (recommended for version control)'
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-4 h-4 text-accent flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Supported Frameworks */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Supported Frameworks</h2>
        <p className="text-muted-foreground">
          Ovmon automatically detects and optimizes deployments for these frameworks:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'Next.js',
            'React',
            'Vue.js',
            'Nuxt',
            'Svelte',
            'SvelteKit',
            'Astro',
            'Remix',
            'Gatsby',
            'Angular',
            'Solid',
            'Static HTML'
          ].map((framework, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border bg-background text-center text-sm">
              {framework}
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section className="space-y-4 p-6 rounded-lg border border-accent bg-accent/10">
        <h2 className="text-2xl font-bold">Next Steps</h2>
        <p className="text-muted-foreground">
          Now that you've deployed your first project, explore these topics to get the most out of Ovmon:
        </p>
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
