import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AppWindow,
  Zap,
  Globe,
  Database,
  ArrowRight,
  Check,
  Lock,
  RefreshCw,
  Users,
  Activity,
  Layers,
  GitBranch,
  Cpu,
  Shield
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Web Applications - Ovmon',
  description: 'Build and deploy full-stack web applications with automatic scaling and global distribution.',
};

const webAppFeatures = [
  {
    icon: Zap,
    title: 'Full-Stack Ready',
    description: 'Deploy frontend and backend together. Server components, API routes, and databases in one platform.',
    stat: '100%',
    statLabel: 'Full-stack support',
  },
  {
    icon: RefreshCw,
    title: 'Auto-Scaling',
    description: 'Handle traffic spikes automatically. Scale from zero to millions of users without configuration.',
    stat: '∞',
    statLabel: 'Scalability',
  },
  {
    icon: Globe,
    title: 'Global Edge',
    description: 'Deploy to 150+ edge locations. Your app runs close to your users, everywhere.',
    stat: '<100ms',
    statLabel: 'Global latency',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 compliant with built-in DDoS protection, SSL, and authentication.',
    stat: 'SOC2',
    statLabel: 'Certified',
  },
];

const capabilities = [
  {
    icon: Database,
    title: 'Database Integration',
    description: 'Built-in support for PostgreSQL, MySQL, MongoDB, and Redis with connection pooling.',
  },
  {
    icon: Lock,
    title: 'Authentication',
    description: 'Integrate with Auth0, Clerk, NextAuth, or build custom authentication.',
  },
  {
    icon: Activity,
    title: 'Real-time Features',
    description: 'WebSockets and Server-Sent Events for live updates and collaboration.',
  },
  {
    icon: Layers,
    title: 'API Routes',
    description: 'Serverless API endpoints that scale automatically with your traffic.',
  },
  {
    icon: GitBranch,
    title: 'Preview Deployments',
    description: 'Every PR gets a unique URL for testing before merging to production.',
  },
  {
    icon: Cpu,
    title: 'Edge Computing',
    description: 'Run middleware and compute at the edge for lowest latency.',
  },
];

const techStack = [
  { category: 'Frontend', items: ['React', 'Vue', 'Svelte', 'Angular'] },
  { category: 'Full-Stack', items: ['Next.js', 'Nuxt', 'SvelteKit', 'Remix'] },
  { category: 'Backend', items: ['Node.js', 'Python', 'Go', 'Ruby'] },
  { category: 'Database', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
];

const useCases = [
  {
    title: 'SaaS Applications',
    description: 'Build multi-tenant SaaS products with user management, billing, and analytics.',
    features: ['Multi-tenancy', 'Stripe integration', 'Usage tracking'],
  },
  {
    title: 'Dashboards',
    description: 'Create real-time dashboards with live data updates and complex visualizations.',
    features: ['Real-time updates', 'Data visualization', 'User permissions'],
  },
  {
    title: 'E-commerce',
    description: 'Build fast, SEO-friendly storefronts with headless commerce solutions.',
    features: ['Server rendering', 'Cart management', 'Payment processing'],
  },
  {
    title: 'Internal Tools',
    description: 'Deploy internal applications with SSO and role-based access control.',
    features: ['SSO/SAML', 'Audit logs', 'IP allowlisting'],
  },
];

export default function WebAppsUseCasePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <AppWindow className="h-3 w-3 mr-1" />
              Web Applications
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Build Full-Stack{' '}
              <span className="text-accent">Web Apps</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Deploy complex web applications with serverless backends, real-time features, and global distribution. From startups to enterprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {webAppFeatures.map((feature) => (
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

      {/* Architecture Overview */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                <Layers className="h-3 w-3 mr-1" />
                Full-Stack Architecture
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Everything in One Platform
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                Deploy your entire application stack on Ovmon. Frontend, backend, databases, and storage - all managed, all scalable, all secure.
              </p>
              <ul className="space-y-3 mb-8">
                {['Server-side rendering & static generation', 'Serverless API routes', 'Managed databases', 'Edge middleware', 'File storage & CDN'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground/80">
                    <Check className="h-5 w-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-xl bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-accent/20 p-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="h-5 w-5 text-accent" />
                      <span className="font-medium text-foreground">Edge Layer</span>
                    </div>
                    <p className="text-xs text-muted-foreground">CDN, Middleware, Edge Functions</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <AppWindow className="h-5 w-5 text-accent" />
                      <span className="font-medium text-foreground">Application Layer</span>
                    </div>
                    <p className="text-xs text-muted-foreground">SSR, API Routes, Server Actions</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Database className="h-5 w-5 text-accent" />
                      <span className="font-medium text-foreground">Data Layer</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Databases, Storage, Queues</p>
                  </div>
                </div>
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
              Everything You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

      {/* Tech Stack */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Tech Stack
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Works With Your Stack
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {techStack.map((stack) => (
              <Card key={stack.category} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-accent mb-4">{stack.category}</h3>
                  <div className="space-y-2">
                    {stack.items.map((item) => (
                      <p key={item} className="text-sm text-foreground/80">{item}</p>
                    ))}
                  </div>
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
              Built for Any Application
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="bg-card border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
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
              Ready to Build Your App?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Deploy your full-stack web application in minutes. Free tier includes everything you need to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demos">Explore Examples</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
