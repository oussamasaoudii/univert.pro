import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Cloud,
  Zap,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Check,
  Code2,
  Database,
  Globe,
  Lock,
  RefreshCw,
  Activity,
  Clock,
  Layers
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Serverless Functions - Ovmon',
  description: 'Deploy serverless functions that scale automatically. Pay only for what you use.',
};

const serverlessFeatures = [
  {
    icon: Zap,
    title: 'Instant Scaling',
    description: 'Functions scale from zero to thousands of instances automatically based on demand.',
    stat: '0 → ∞',
    statLabel: 'Auto-scaling',
  },
  {
    icon: Clock,
    title: 'Fast Cold Starts',
    description: 'Optimized runtime with sub-100ms cold starts. Your functions are always ready.',
    stat: '<100ms',
    statLabel: 'Cold start',
  },
  {
    icon: DollarSign,
    title: 'Pay Per Use',
    description: 'Only pay for actual compute time. No idle costs, no wasted resources.',
    stat: '$0',
    statLabel: 'Idle cost',
  },
  {
    icon: Globe,
    title: 'Global Deployment',
    description: 'Deploy to multiple regions or run at the edge for lowest latency.',
    stat: '25+',
    statLabel: 'Regions',
  },
];

const runtimeSupport = [
  { name: 'Node.js', versions: '18, 20, 22', popular: true },
  { name: 'Python', versions: '3.9, 3.10, 3.11', popular: true },
  { name: 'Go', versions: '1.21, 1.22', popular: false },
  { name: 'Ruby', versions: '3.2, 3.3', popular: false },
  { name: 'Edge Runtime', versions: 'V8 Isolates', popular: true },
  { name: 'Custom Docker', versions: 'Any runtime', popular: false },
];

const capabilities = [
  {
    icon: Code2,
    title: 'Multiple Runtimes',
    description: 'Support for Node.js, Python, Go, Ruby, and custom Docker containers.',
  },
  {
    icon: Database,
    title: 'Database Connections',
    description: 'Built-in connection pooling for PostgreSQL, MySQL, and MongoDB.',
  },
  {
    icon: Lock,
    title: 'Secrets Management',
    description: 'Securely store and access environment variables and API keys.',
  },
  {
    icon: RefreshCw,
    title: 'Background Jobs',
    description: 'Queue long-running tasks with automatic retries and error handling.',
  },
  {
    icon: Activity,
    title: 'Monitoring & Logs',
    description: 'Real-time logs, metrics, and tracing for debugging and optimization.',
  },
  {
    icon: Layers,
    title: 'Middleware',
    description: 'Add authentication, rate limiting, and caching at the function level.',
  },
];

const useCases = [
  {
    title: 'API Backends',
    description: 'Build REST and GraphQL APIs that scale automatically with traffic.',
    example: 'Handle 10K requests/second with zero configuration',
  },
  {
    title: 'Webhooks',
    description: 'Process webhooks from Stripe, GitHub, Slack, and any third-party service.',
    example: 'Reliable delivery with automatic retries',
  },
  {
    title: 'Scheduled Tasks',
    description: 'Run cron jobs for data processing, cleanup, and notifications.',
    example: 'Execute tasks on schedule without managing servers',
  },
  {
    title: 'Image Processing',
    description: 'Resize, optimize, and transform images on-the-fly.',
    example: 'Process millions of images with parallel execution',
  },
];

export default function ServerlessPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Cloud className="h-3 w-3 mr-1" />
              Serverless Functions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Code Without{' '}
              <span className="text-accent">Servers</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Deploy functions that scale automatically. No servers to manage, no capacity planning, no idle costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/functions">Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serverlessFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-accent mb-4" />
                  <p className="text-3xl font-bold text-foreground mb-1">{feature.stat}</p>
                  <p className="text-xs text-muted-foreground mb-4">{feature.statLabel}</p>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                Simple to Use
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Write Functions, Not Infrastructure
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                Export a function, deploy, and we handle the rest. Automatic HTTPS, scaling, and monitoring included.
              </p>
              <ul className="space-y-3 mb-8">
                {['Zero configuration required', 'Automatic HTTPS endpoints', 'Built-in error handling', 'Real-time logs and metrics'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground/80">
                    <Check className="h-5 w-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-xl bg-background border border-border/50 overflow-hidden shadow-lg">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">api/hello.ts</span>
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-foreground/90 font-mono">{`import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') ?? 'World';

  return NextResponse.json({
    message: \`Hello, \${name}!\`,
    timestamp: new Date().toISOString()
  });
}

// Deployed to: https://your-app.ovmon.app/api/hello`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Runtime Support */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Runtimes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Your Language, Your Choice
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Support for all major programming languages and custom containers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {runtimeSupport.map((runtime) => (
              <Card key={runtime.name} className="bg-card/50 border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{runtime.name}</h3>
                    <p className="text-xs text-muted-foreground">{runtime.versions}</p>
                  </div>
                  {runtime.popular && (
                    <Badge className="bg-accent/10 text-accent border-0 text-xs">Popular</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability) => (
              <Card key={capability.title} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <capability.icon className="h-6 w-6 text-accent mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{capability.title}</h3>
                  <p className="text-sm text-muted-foreground">{capability.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Use Cases
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Built for Any Workload
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="bg-card border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Check className="h-4 w-4" />
                    {useCase.example}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Ready to Go Serverless?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Deploy your first function in under a minute. Free tier includes 100K invocations per month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
