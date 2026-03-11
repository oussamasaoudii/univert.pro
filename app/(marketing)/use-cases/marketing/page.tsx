import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Megaphone,
  Zap,
  Globe,
  BarChart3,
  ArrowRight,
  Check,
  Palette,
  Search,
  Share2,
  MousePointer2,
  Users,
  Clock,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Marketing Sites - Ovmon',
  description: 'Build fast, SEO-optimized marketing websites that convert visitors into customers.',
};

const marketingFeatures = [
  {
    icon: Zap,
    title: 'Lightning Performance',
    description: 'Sub-second load times that keep visitors engaged and boost conversions.',
    stat: '<1s',
    statLabel: 'Avg load time',
  },
  {
    icon: Search,
    title: 'SEO Optimized',
    description: 'Server-side rendering and perfect Core Web Vitals for top search rankings.',
    stat: '100',
    statLabel: 'Lighthouse score',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Content delivered from 150+ edge locations for instant access worldwide.',
    stat: '150+',
    statLabel: 'Edge locations',
  },
  {
    icon: MousePointer2,
    title: 'Higher Conversions',
    description: 'Faster sites convert better. See up to 3x improvement in conversion rates.',
    stat: '3x',
    statLabel: 'Better conversions',
  },
];

const capabilities = [
  {
    icon: Palette,
    title: 'Beautiful Templates',
    description: 'Start with professionally designed templates or build custom from scratch.',
  },
  {
    icon: BarChart3,
    title: 'Built-in Analytics',
    description: 'Track visitors, conversions, and engagement without third-party scripts.',
  },
  {
    icon: Share2,
    title: 'Social Previews',
    description: 'Automatic Open Graph images and Twitter cards for perfect social sharing.',
  },
  {
    icon: Users,
    title: 'A/B Testing',
    description: 'Test different versions of your pages at the edge with no performance impact.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Responsive designs that look great on every device, every time.',
  },
  {
    icon: Sparkles,
    title: 'Dynamic Content',
    description: 'Personalize content based on location, device, or user preferences.',
  },
];

const frameworks = [
  { name: 'Next.js', description: 'React framework with SSR & SSG', popular: true },
  { name: 'Astro', description: 'Content-focused static sites', popular: true },
  { name: 'Gatsby', description: 'React-based static generator', popular: false },
  { name: 'Hugo', description: 'Fastest static site generator', popular: false },
  { name: 'Nuxt', description: 'Vue.js framework', popular: true },
  { name: 'SvelteKit', description: 'Svelte framework', popular: true },
];

const testimonials = [
  {
    quote: "Our page speed improved by 60% after moving to Ovmon. Our bounce rate dropped significantly.",
    author: "Sarah Chen",
    role: "Head of Marketing, TechStart",
  },
  {
    quote: "The built-in analytics and A/B testing features have been game changers for our marketing team.",
    author: "Michael Ross",
    role: "CMO, GrowthCo",
  },
];

export default function MarketingUseCasePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Megaphone className="h-3 w-3 mr-1" />
              Marketing Sites
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Websites That{' '}
              <span className="text-accent">Convert</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Build fast, SEO-optimized marketing websites that turn visitors into customers. Perfect Core Web Vitals, instant global delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Building
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

      {/* Stats */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketingFeatures.map((feature) => (
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

      {/* Why Performance Matters */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                <Clock className="h-3 w-3 mr-1" />
                Why Speed Matters
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Every Second Counts
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                Studies show that a 1-second delay in page load time can result in 7% fewer conversions. Our platform ensures your marketing sites load instantly, everywhere.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">53% of mobile users leave</p>
                    <p className="text-sm text-muted-foreground">if a page takes longer than 3 seconds to load</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Page speed is a ranking factor</p>
                    <p className="text-sm text-muted-foreground">Google uses Core Web Vitals for search rankings</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Faster sites build trust</p>
                    <p className="text-sm text-muted-foreground">Speed signals professionalism and reliability</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-xl bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-accent/20 p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50 text-center">
                    <p className="text-3xl font-bold text-accent mb-1">98</p>
                    <p className="text-xs text-muted-foreground">Performance Score</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50 text-center">
                    <p className="text-3xl font-bold text-accent mb-1">100</p>
                    <p className="text-xs text-muted-foreground">SEO Score</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50 text-center">
                    <p className="text-3xl font-bold text-accent mb-1">0.8s</p>
                    <p className="text-xs text-muted-foreground">LCP</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50 text-center">
                    <p className="text-3xl font-bold text-accent mb-1">0</p>
                    <p className="text-xs text-muted-foreground">CLS</p>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Lighthouse scores for sites hosted on Ovmon
                </p>
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
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Built for Marketing Teams
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

      {/* Frameworks */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Frameworks
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Use Any Framework
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {frameworks.map((framework) => (
              <Card key={framework.name} className="bg-card/50 border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{framework.name}</h3>
                      <p className="text-xs text-muted-foreground">{framework.description}</p>
                    </div>
                    {framework.popular && (
                      <Badge className="bg-accent/10 text-accent border-0 text-xs shrink-0">Popular</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Loved by Marketing Teams
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border/50">
                <CardContent className="p-8">
                  <p className="text-foreground/90 mb-6 leading-relaxed italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
              Ready to Build Better Marketing Sites?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Join thousands of marketing teams building faster, higher-converting websites with Ovmon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demos">Browse Templates</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
