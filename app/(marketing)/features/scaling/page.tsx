import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Zap,
  Globe,
  Server,
  ArrowRight,
  Check,
  Activity,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  RefreshCw,
  Shield,
  Clock
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Auto-Scaling - Ovmon',
  description: 'Automatic scaling that grows with your traffic. Handle millions of requests without breaking a sweat.',
  robots: { index: false, follow: false },
};

const scalingFeatures = [
  {
    icon: TrendingUp,
    title: 'Traffic-Based Scaling',
    description: 'Automatically scale up during traffic spikes and scale down when quiet. Pay only for what you use.',
    stats: '0 to 1M+ requests',
  },
  {
    icon: Globe,
    title: 'Global Distribution',
    description: 'Deploy to 100+ edge locations worldwide. Your app runs close to your users, everywhere.',
    stats: '150+ locations',
  },
  {
    icon: Zap,
    title: 'Instant Response',
    description: 'Scaling happens in milliseconds, not minutes. No cold starts, no waiting, no dropped requests.',
    stats: '<50ms scale time',
  },
  {
    icon: Shield,
    title: 'DDoS Protection',
    description: 'Built-in protection against traffic attacks. Your app stays up even under heavy load.',
    stats: '10Tbps+ capacity',
  },
];

const technicalSpecs = [
  { icon: Cpu, label: 'Compute Units', value: 'Unlimited' },
  { icon: HardDrive, label: 'Storage', value: 'Elastic' },
  { icon: Network, label: 'Bandwidth', value: 'Unmetered' },
  { icon: RefreshCw, label: 'Deployments', value: 'Unlimited' },
  { icon: Activity, label: 'Uptime SLA', value: '99.99%' },
  { icon: Clock, label: 'Scale Time', value: '<50ms' },
];

const useCases = [
  {
    title: 'E-commerce Flash Sales',
    description: 'Handle 100x normal traffic during sales events without any preparation.',
    metrics: ['500K concurrent users', 'Zero downtime', 'Auto-scaling'],
  },
  {
    title: 'Viral Content',
    description: 'When your content goes viral, your infrastructure keeps up automatically.',
    metrics: ['10M+ pageviews/hour', 'Global edge delivery', 'No config changes'],
  },
  {
    title: 'API Heavy Loads',
    description: 'Scale your APIs to handle millions of requests per second.',
    metrics: ['1M+ RPS', 'Sub-100ms latency', 'Automatic failover'],
  },
];

export default function ScalingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <TrendingUp className="h-3 w-3 mr-1" />
              Auto-Scaling
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Scale Without{' '}
              <span className="text-accent">Limits</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              From zero to millions of users. Our infrastructure scales automatically so you can focus on building, not managing servers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Scaling
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

      {/* Stats Section */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scalingFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-accent mb-4" />
                  <p className="text-3xl font-bold text-foreground mb-2">{feature.stats}</p>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Intelligent Auto-Scaling
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Our platform monitors your traffic in real-time and adjusts resources automatically.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Visual representation */}
              <div className="rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent mb-2">1K</div>
                    <p className="text-sm text-muted-foreground">Normal Traffic</p>
                    <div className="mt-4 h-16 bg-accent/20 rounded-lg flex items-end justify-center pb-2">
                      <div className="w-8 h-8 bg-accent rounded"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent mb-2">50K</div>
                    <p className="text-sm text-muted-foreground">Traffic Spike</p>
                    <div className="mt-4 h-16 bg-accent/20 rounded-lg flex items-end justify-center pb-2">
                      <div className="w-8 h-12 bg-accent rounded"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent mb-2">1M+</div>
                    <p className="text-sm text-muted-foreground">Peak Load</p>
                    <div className="mt-4 h-16 bg-accent/20 rounded-lg flex items-end justify-center pb-2">
                      <div className="w-8 h-14 bg-accent rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4 text-accent" />
                  <span>Resources scale automatically based on demand</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Specifications
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Enterprise-Grade Infrastructure
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {technicalSpecs.map((spec) => (
              <Card key={spec.label} className="bg-card/50 border-border/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <spec.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{spec.label}</p>
                    <p className="text-xl font-bold text-foreground">{spec.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Use Cases
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Built for Any Workload
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-foreground mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-6">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.metrics.map((metric) => (
                      <li key={metric} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Check className="h-4 w-4 text-accent" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Ready to Scale?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Start with our free tier and scale to millions of users without changing your code.
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
