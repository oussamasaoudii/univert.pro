import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Zap,
  Shield,
  Clock,
  Server,
  BarChart3,
  Lock,
  Layers,
  Cpu,
  Database,
  RefreshCw,
  Headphones,
  ArrowRight,
  Check,
  Sparkles,
  Workflow,
  Settings2,
  MonitorSmartphone
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features - Ovmon',
  description: 'Discover all the powerful features that make Ovmon the best platform for website hosting and deployment.',
};

const heroFeatures = [
  {
    icon: Zap,
    title: 'Instant Deployment',
    description: 'Deploy your website in seconds with one-click provisioning and automated CI/CD pipelines.',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Lightning-fast content delivery with edge nodes in 150+ locations worldwide.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with SSL, DDoS protection, and SOC2 compliance built-in.',
  },
  {
    icon: Clock,
    title: '99.99% Uptime SLA',
    description: 'Guaranteed reliability with automatic failover and redundant infrastructure.',
  },
];

const platformFeatures = [
  {
    category: 'Infrastructure',
    icon: Server,
    color: 'text-accent',
    features: [
      {
        title: 'Auto-Scaling',
        description: 'Automatically scale resources based on traffic demand without any manual intervention.',
        icon: RefreshCw,
      },
      {
        title: 'Edge Computing',
        description: 'Run serverless functions at the edge for ultra-low latency responses.',
        icon: Cpu,
      },
      {
        title: 'Managed Databases',
        description: 'Fully managed PostgreSQL, MySQL, and Redis with automatic backups.',
        icon: Database,
      },
    ],
  },
  {
    category: 'Developer Experience',
    icon: Workflow,
    color: 'text-accent',
    features: [
      {
        title: 'Git Integration',
        description: 'Connect your GitHub, GitLab, or Bitbucket repositories for automatic deployments.',
        icon: Layers,
      },
      {
        title: 'Preview Deployments',
        description: 'Every pull request gets a unique preview URL for testing and collaboration.',
        icon: MonitorSmartphone,
      },
      {
        title: 'Environment Variables',
        description: 'Securely manage secrets and configuration across all environments.',
        icon: Settings2,
      },
    ],
  },
  {
    category: 'Security & Compliance',
    icon: Lock,
    color: 'text-accent',
    features: [
      {
        title: 'SSL Certificates',
        description: 'Automatic SSL/TLS certificates with zero configuration required.',
        icon: Shield,
      },
      {
        title: 'DDoS Protection',
        description: 'Advanced protection against distributed denial-of-service attacks.',
        icon: Shield,
      },
      {
        title: 'Role-Based Access',
        description: 'Fine-grained permissions and audit logs for team collaboration.',
        icon: Lock,
      },
    ],
  },
  {
    category: 'Analytics & Monitoring',
    icon: BarChart3,
    color: 'text-accent',
    features: [
      {
        title: 'Real-time Analytics',
        description: 'Track visitors, page views, and performance metrics in real-time.',
        icon: BarChart3,
      },
      {
        title: 'Error Tracking',
        description: 'Automatic error detection with stack traces and source maps.',
        icon: Sparkles,
      },
      {
        title: '24/7 Monitoring',
        description: 'Continuous health checks with instant alerts via email, Slack, or webhook.',
        icon: Headphones,
      },
    ],
  },
];

const comparisonFeatures = [
  { feature: 'Global CDN', ovmon: true, others: 'Limited' },
  { feature: 'Auto SSL', ovmon: true, others: true },
  { feature: 'Preview Deployments', ovmon: true, others: false },
  { feature: 'Edge Functions', ovmon: true, others: 'Paid addon' },
  { feature: 'Git Integration', ovmon: true, others: true },
  { feature: '99.99% SLA', ovmon: true, others: false },
  { feature: 'DDoS Protection', ovmon: true, others: 'Paid addon' },
  { feature: 'Team Collaboration', ovmon: true, others: 'Limited' },
  { feature: 'Real-time Analytics', ovmon: true, others: 'Paid addon' },
  { feature: '24/7 Support', ovmon: true, others: 'Business only' },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              Platform Features
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance">
              Everything You Need to{' '}
              <span className="text-accent">Ship Faster</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Ovmon provides a complete suite of tools for deploying, managing, and scaling your web applications with enterprise-grade reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Building Free
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

      {/* Core Features Grid */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {heroFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50 hover:border-accent/50 transition-colors hover-lift">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Sections */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Platform Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Built for Modern Development
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              From infrastructure to developer experience, every feature is designed to help you ship faster and more reliably.
            </p>
          </div>

          <div className="space-y-20">
            {platformFeatures.map((category, idx) => (
              <div key={category.category} className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
                <div className="lg:w-1/3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{category.category}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {category.category === 'Infrastructure' && 'Scalable, reliable infrastructure that grows with your application without any manual configuration.'}
                    {category.category === 'Developer Experience' && 'Tools and workflows designed to maximize developer productivity and collaboration.'}
                    {category.category === 'Security & Compliance' && 'Enterprise-grade security measures to protect your applications and data.'}
                    {category.category === 'Analytics & Monitoring' && 'Deep insights into your application performance and user behavior.'}
                  </p>
                </div>
                <div className="lg:w-2/3 grid md:grid-cols-3 gap-4">
                  {category.features.map((feature) => (
                    <Card key={feature.title} className="bg-card/50 border-border/50 hover:border-accent/30 transition-colors">
                      <CardContent className="p-5">
                        <feature.icon className="h-5 w-5 text-accent mb-3" />
                        <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Why Ovmon
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Compare Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              See how Ovmon stacks up against traditional hosting providers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-card border-border/50 overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 border-b border-border/50 p-4 font-semibold text-sm">
                <div className="text-foreground">Feature</div>
                <div className="text-center text-accent">Ovmon</div>
                <div className="text-center text-muted-foreground">Others</div>
              </div>
              <div className="divide-y divide-border/50">
                {comparisonFeatures.map((item) => (
                  <div key={item.feature} className="grid grid-cols-3 p-4 text-sm items-center hover:bg-muted/30 transition-colors">
                    <div className="text-foreground font-medium">{item.feature}</div>
                    <div className="text-center">
                      {item.ovmon === true ? (
                        <Check className="h-5 w-5 text-accent mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">{item.ovmon}</span>
                      )}
                    </div>
                    <div className="text-center">
                      {item.others === true ? (
                        <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : item.others === false ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">{item.others}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Ready to Experience the Difference?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Join thousands of developers and teams who trust Ovmon for their web infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
