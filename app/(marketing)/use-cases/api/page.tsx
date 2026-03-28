import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Code2,
  Zap,
  Globe,
  Shield,
  ArrowRight,
  Check,
  Database,
  Lock,
  Activity,
  RefreshCw,
  Clock,
  Layers,
  Server,
  FileJson
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'API & Backends - Ovmon',
  description: 'Build and deploy scalable APIs and backend services with Ovmon.',
  robots: { index: false, follow: false },
};

const apiFeatures = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-100ms response times globally with edge-optimized routing and caching.',
    stat: '<50ms',
    statLabel: 'Avg response time',
  },
  {
    icon: Globe,
    title: 'Global Distribution',
    description: 'Deploy APIs to 25+ regions or run at the edge in 150+ locations.',
    stat: '150+',
    statLabel: 'Edge locations',
  },
  {
    icon: RefreshCw,
    title: 'Auto-Scaling',
    description: 'Handle millions of requests without any configuration or capacity planning.',
    stat: '∞',
    statLabel: 'Requests/sec',
  },
  {
    icon: Shield,
    title: 'Built-in Security',
    description: 'DDoS protection, rate limiting, and authentication out of the box.',
    stat: '10Tbps',
    statLabel: 'DDoS capacity',
  },
];

const apiCapabilities = [
  {
    icon: FileJson,
    title: 'REST & GraphQL',
    description: 'Build REST APIs or GraphQL endpoints with your favorite frameworks.',
  },
  {
    icon: Database,
    title: 'Database Integration',
    description: 'Built-in connection pooling for PostgreSQL, MySQL, MongoDB, and more.',
  },
  {
    icon: Lock,
    title: 'Authentication',
    description: 'JWT validation, API keys, OAuth, and custom auth at the edge.',
  },
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: 'Live metrics, error tracking, and distributed tracing.',
  },
  {
    icon: Clock,
    title: 'Rate Limiting',
    description: 'Protect your APIs with configurable rate limits per user or IP.',
  },
  {
    icon: Layers,
    title: 'API Versioning',
    description: 'Manage multiple API versions with URL-based or header-based routing.',
  },
];

const frameworks = [
  { name: 'Next.js API Routes', popular: true },
  { name: 'Express.js', popular: true },
  { name: 'Fastify', popular: false },
  { name: 'Hono', popular: true },
  { name: 'tRPC', popular: true },
  { name: 'GraphQL Yoga', popular: false },
  { name: 'NestJS', popular: false },
  { name: 'Flask / FastAPI', popular: true },
];

const codeExample = `// api/users/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') ?? '10');
  
  const users = await db.user.findMany({
    take: limit,
    select: { id: true, name: true, email: true }
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const user = await db.user.create({
    data: body
  });

  return NextResponse.json({ user }, { status: 201 });
}`;

export default function ApiUseCasePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Server className="h-3 w-3 mr-1" />
              API & Backends
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Build Scalable{' '}
              <span className="text-accent">APIs</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Deploy serverless APIs that scale automatically. From simple endpoints to complex microservices, we handle the infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/api-routes">Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apiFeatures.map((feature) => (
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
                <Code2 className="h-3 w-3 mr-1" />
                Simple to Build
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                APIs in Minutes, Not Days
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                Write your API logic, deploy, and we handle scaling, security, and monitoring automatically. No infrastructure management required.
              </p>
              <ul className="space-y-3 mb-8">
                {['File-based routing', 'TypeScript support', 'Built-in request validation', 'Automatic OpenAPI docs'].map((item) => (
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
                  <span className="text-xs text-muted-foreground">api/users/route.ts</span>
                </div>
                <pre className="p-4 text-xs overflow-x-auto">
                  <code className="text-foreground/90 font-mono">{codeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything for API Development
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {apiCapabilities.map((capability) => (
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

      {/* Frameworks */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Frameworks
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Use Your Favorite Tools
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Deploy APIs built with any framework. Zero-config support for popular tools.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {frameworks.map((framework) => (
              <Badge
                key={framework.name}
                variant="outline"
                className={`px-4 py-2 text-sm ${framework.popular ? 'border-accent/50 text-accent' : 'border-border/50 text-muted-foreground'}`}
              >
                {framework.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Ready to Build Your API?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Deploy your first API in minutes. Free tier includes 100K requests per month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demos">See Examples</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
