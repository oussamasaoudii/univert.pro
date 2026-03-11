import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Zap,
  MapPin,
  Activity,
  ArrowRight,
  Check,
  Server,
  Gauge,
  Shield,
  Clock,
  Network,
  Cpu
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Edge Network - Ovmon',
  description: 'Global edge network with 150+ locations for ultra-low latency content delivery.',
};

const edgeStats = [
  { value: '150+', label: 'Edge Locations', icon: MapPin },
  { value: '<50ms', label: 'Global Latency', icon: Gauge },
  { value: '99.99%', label: 'Uptime SLA', icon: Activity },
  { value: '10Tbps', label: 'Network Capacity', icon: Network },
];

const regions = [
  { name: 'North America', locations: 45, cities: ['New York', 'San Francisco', 'Toronto', 'Chicago'] },
  { name: 'Europe', locations: 38, cities: ['London', 'Frankfurt', 'Amsterdam', 'Paris'] },
  { name: 'Asia Pacific', locations: 42, cities: ['Tokyo', 'Singapore', 'Sydney', 'Mumbai'] },
  { name: 'South America', locations: 12, cities: ['Sao Paulo', 'Buenos Aires', 'Bogota'] },
  { name: 'Middle East & Africa', locations: 8, cities: ['Dubai', 'Johannesburg', 'Tel Aviv'] },
  { name: 'Oceania', locations: 5, cities: ['Sydney', 'Melbourne', 'Auckland'] },
];

const edgeFeatures = [
  {
    icon: Zap,
    title: 'Edge Functions',
    description: 'Run serverless functions at the edge for sub-millisecond response times. Execute code closer to your users.',
    benefits: ['Cold start <50ms', 'Automatic scaling', 'V8 isolates', 'Global deployment'],
  },
  {
    icon: Server,
    title: 'Edge Caching',
    description: 'Intelligent caching at every edge location. Cache static and dynamic content with fine-grained control.',
    benefits: ['Stale-while-revalidate', 'Cache tags', 'Instant purge', 'Custom TTLs'],
  },
  {
    icon: Shield,
    title: 'Edge Security',
    description: 'DDoS protection, WAF, and bot detection at the edge. Stop attacks before they reach your origin.',
    benefits: ['Layer 7 protection', 'Rate limiting', 'Bot detection', 'IP filtering'],
  },
  {
    icon: Globe,
    title: 'Edge Routing',
    description: 'Intelligent routing based on geography, performance, and custom rules. A/B testing at the edge.',
    benefits: ['Geo-routing', 'Performance routing', 'A/B testing', 'Custom headers'],
  },
];

const performanceMetrics = [
  { metric: 'Time to First Byte', traditional: '200-500ms', edge: '<50ms' },
  { metric: 'Full Page Load', traditional: '2-4s', edge: '<1s' },
  { metric: 'API Response', traditional: '100-300ms', edge: '<20ms' },
  { metric: 'Global Availability', traditional: '99.9%', edge: '99.99%' },
];

export default function EdgeNetworkPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Globe className="h-3 w-3 mr-1" />
              Edge Network
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Globally Distributed,{' '}
              <span className="text-accent">Locally Fast</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Deploy to 150+ edge locations worldwide. Your content and compute run milliseconds away from every user.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Deploy to Edge
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/edge-network">Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {edgeStats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border/50 text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 text-accent mx-auto mb-4" />
                  <p className="text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Coverage Map */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Global Coverage
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Edge Locations Worldwide
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Our network spans every continent, ensuring low-latency access for users anywhere in the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <Card key={region.name} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{region.name}</h3>
                    <Badge variant="outline" className="text-accent border-accent/30">
                      {region.locations} locations
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {region.cities.map((city) => (
                      <span key={city} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {city}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Edge Features */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Edge Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Compute at the Edge
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {edgeFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50">
                <CardContent className="p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 mb-6">
                    <feature.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Check className="h-4 w-4 text-accent shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Comparison */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Performance
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Edge vs Traditional Hosting
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-card border-border/50 overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 border-b border-border/50 p-4 font-semibold text-sm">
                <div className="text-foreground">Metric</div>
                <div className="text-center text-muted-foreground">Traditional</div>
                <div className="text-center text-accent">Edge Network</div>
              </div>
              <div className="divide-y divide-border/50">
                {performanceMetrics.map((item) => (
                  <div key={item.metric} className="grid grid-cols-3 p-4 text-sm items-center">
                    <div className="text-foreground font-medium">{item.metric}</div>
                    <div className="text-center text-muted-foreground">{item.traditional}</div>
                    <div className="text-center text-accent font-semibold">{item.edge}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Edge Functions Highlight */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                <Cpu className="h-3 w-3 mr-1" />
                Edge Functions
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Serverless at the Edge
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                Run serverless functions in 150+ locations worldwide. Execute code milliseconds from your users with V8 isolates for maximum performance.
              </p>
              <ul className="space-y-3 mb-8">
                {['Sub-50ms cold starts', 'Automatic scaling', 'TypeScript support', 'No infrastructure management'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground/80">
                    <Check className="h-5 w-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/docs/edge-functions">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-xl bg-background border border-border/50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">edge-function.ts</span>
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-foreground/90 font-mono">{`export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { city } = req.geo;
  
  return new Response(
    JSON.stringify({ 
      message: \`Hello from \${city}!\`,
      latency: '<10ms'
    }),
    { headers: { 'content-type': 'application/json' }}
  );
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Go Global Today
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Deploy to 150+ edge locations with a single command. No configuration required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/infrastructure">View Infrastructure</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
