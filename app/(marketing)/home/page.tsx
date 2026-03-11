'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { 
  Globe, 
  Zap, 
  Shield, 
  Clock, 
  Check,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Play,
  ChevronRight,
  Sparkles,
  BarChart3,
  Rocket,
  Lock,
  RefreshCw
} from 'lucide-react';

// Animated counter component
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setDisplayValue(Math.round(v)),
      });
      return () => controls.stop();
    }
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// Floating stat badge component
function FloatingBadge({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`absolute bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Section wrapper with scroll animation
function AnimatedSection({ 
  children, 
  className = '',
  delay = 0
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const features = [
  {
    icon: Globe,
    title: 'Global Edge Network',
    description: 'Deploy to 100+ edge locations worldwide. Sub-50ms latency guaranteed.',
    stat: '100+',
    statLabel: 'Edge Locations',
  },
  {
    icon: Zap,
    title: 'Instant Deployments',
    description: 'Push to deploy in under 3 seconds. Zero-downtime updates every time.',
    stat: '<3s',
    statLabel: 'Deploy Time',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 Type II certified. DDoS protection and WAF included by default.',
    stat: 'SOC2',
    statLabel: 'Certified',
  },
  {
    icon: RefreshCw,
    title: 'Auto-Scaling',
    description: 'Handle traffic spikes automatically. Scale from 0 to millions instantly.',
    stat: '10M+',
    statLabel: 'Requests/sec',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'For hobby projects and experiments',
    features: ['3 Projects', '100GB Bandwidth', 'Free SSL', 'Community Support', 'Basic Analytics'],
    popular: false,
    cta: 'Start Building',
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'For professional developers and teams',
    features: ['Unlimited Projects', '1TB Bandwidth', 'Priority Support', 'Advanced Analytics', 'Team Collaboration', 'Custom Domains'],
    popular: true,
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced needs',
    features: ['Everything in Pro', 'Dedicated Support', 'SLA Guarantee', 'SSO & SAML', 'Audit Logs', 'Custom Contracts'],
    popular: false,
    cta: 'Contact Sales',
  },
];

const testimonials = [
  {
    quote: "Ovmon cut our deployment time from hours to seconds. It's transformed how we ship products.",
    author: 'Sarah Chen',
    role: 'CTO at TechFlow',
    avatar: 'SC',
  },
  {
    quote: "The performance gains alone paid for the entire year's subscription in the first month.",
    author: 'Marcus Johnson',
    role: 'Lead Developer at Scale',
    avatar: 'MJ',
  },
  {
    quote: "Finally a platform that just works. No more DevOps headaches, just pure productivity.",
    author: 'Emily Rodriguez',
    role: 'Founder at LaunchPad',
    avatar: 'ER',
  },
];

const trustedCompanies = [
  'Acme Corp', 'TechFlow', 'Vertex', 'Quantum', 'Nexus', 'Pulse'
];

export default function HomePage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section with Background Effects */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-12 lg:pt-24 lg:pb-16">
        {/* Background layers */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(45,212,191,0.05),transparent_50%)]" />
        
        {/* Grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="max-w-xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="outline" className="mb-6 border-accent/50 text-accent px-4 py-1.5 text-sm font-medium">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Now with AI-Powered Optimization
                </Badge>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
                Ship websites{' '}
                <span className="text-accent">10x faster</span>{' '}
                without the complexity
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                The complete platform to build, deploy, and scale modern web applications. 
                Trusted by 50,000+ developers worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 text-base font-medium" asChild>
                  <Link href="/auth/signup">
                    Start Building Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6 text-base group" asChild>
                  <Link href="/demos">
                    <Play className="mr-2 h-4 w-4 group-hover:text-accent transition-colors" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Social proof mini */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((letter, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium">
                      {letter}
                    </div>
                  ))}
                </div>
                <span>Join <strong className="text-foreground">50,000+</strong> developers</span>
              </div>
            </motion.div>

            {/* Right - Browser mockup with floating stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="relative lg:pl-8"
            >
              {/* Browser mockup */}
              <div className="relative">
                <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-background/50 rounded-md px-4 py-1 text-xs text-muted-foreground flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        app.ovmon.com/dashboard
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard content */}
                  <div className="p-6 bg-background min-h-[320px]">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { label: 'Total Deployments', value: '2,847', change: '+12%' },
                        { label: 'Avg Response Time', value: '42ms', change: '-8%' },
                        { label: 'Uptime', value: '99.99%', change: '+0.01%' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-secondary/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                          <p className="text-xs text-accent">{stat.change}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chart placeholder */}
                    <div className="bg-secondary/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Traffic Overview</span>
                        <span className="text-xs text-muted-foreground">Last 7 days</span>
                      </div>
                      <div className="flex items-end gap-1 h-20">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                            className="flex-1 bg-accent/60 rounded-sm"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Recent deployments */}
                    <div className="space-y-2">
                      {[
                        { name: 'Production', status: 'Ready', time: '2m ago' },
                        { name: 'Preview', status: 'Building', time: 'Now' },
                      ].map((deploy, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-secondary/20 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${deploy.status === 'Ready' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                            <span>{deploy.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{deploy.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <FloatingBadge className="-top-4 -left-4 lg:-left-8" delay={0.6}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deploy Time</p>
                      <p className="text-sm font-semibold text-foreground">2.3s avg</p>
                    </div>
                  </div>
                </FloatingBadge>

                <FloatingBadge className="-bottom-4 -right-4 lg:-right-8" delay={0.8}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Performance</p>
                      <p className="text-sm font-semibold text-foreground">+45% faster</p>
                    </div>
                  </div>
                </FloatingBadge>

                <FloatingBadge className="top-1/2 -right-4 lg:-right-12 -translate-y-1/2" delay={1}>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px]">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">+12 online</span>
                  </div>
                </FloatingBadge>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar / Logo Marquee */}
      <section className="py-8 border-y border-border/50 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <p className="text-sm text-muted-foreground shrink-0">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {trustedCompanies.map((company, i) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-muted-foreground/60 font-semibold text-lg tracking-tight hover:text-foreground transition-colors cursor-default"
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Counters */}
      <AnimatedSection className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: 50000, suffix: '+', label: 'Developers', icon: Users },
              { value: 99.99, suffix: '%', label: 'Uptime SLA', icon: Shield },
              { value: 150, suffix: '+', label: 'Edge Locations', icon: Globe },
              { value: 2, suffix: 'B+', label: 'Requests/Month', icon: BarChart3 },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4 group-hover:bg-accent/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section - Alternating Layout */}
      <AnimatedSection className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Platform Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything you need to ship faster
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for modern development teams who demand performance, reliability, and simplicity.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-accent" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">{feature.stat}</p>
                        <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Product Showcase Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                Developer Experience
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
                Deploy with a single command
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Push your code and let Ovmon handle the rest. Automatic builds, instant previews, and 
                seamless collaboration built for the modern development workflow.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Git-based deployments with instant rollbacks',
                  'Preview deployments for every pull request',
                  'Automatic HTTPS and custom domains',
                  'Real-time collaboration and comments',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>

              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/docs/getting-started">
                  Read the Docs
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Terminal mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 font-mono">terminal</span>
                </div>
                <div className="p-6 font-mono text-sm bg-[#0a0a0a] min-h-[300px]">
                  <div className="text-muted-foreground mb-2">$ ovmon deploy</div>
                  <div className="text-foreground mb-1">
                    <span className="text-accent">Ovmon</span> Deploying to production...
                  </div>
                  <div className="text-muted-foreground text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Building application...
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Optimizing assets...
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Deploying to edge...
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> SSL certificate issued
                    </div>
                  </div>
                  <div className="mt-4 text-foreground">
                    <span className="text-green-500">Success!</span> Deployed to{' '}
                    <span className="text-accent underline">https://app.ovmon.com</span>
                  </div>
                  <div className="text-muted-foreground text-xs mt-2">
                    Deploy time: <span className="text-accent">2.3s</span>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-4 bg-accent/5 rounded-2xl blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Customer Stories
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Loved by developers worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-accent/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Pricing Plans
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-accent text-accent-foreground shadow-lg">Recommended</Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? 'border-accent bg-card shadow-xl shadow-accent/10' : 'bg-card/50 border-border/50'}`}>
                  <CardContent className="p-6 lg:p-8">
                    <h3 className="text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm">
                          <Check className={`h-4 w-4 mr-3 shrink-0 ${plan.popular ? 'text-accent' : 'text-muted-foreground'}`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href={plan.name === 'Enterprise' ? '/contact' : '/auth/signup'}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enterprise callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 max-w-3xl mx-auto"
          >
            <Card className="bg-secondary/30 border-border/50">
              <CardContent className="p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Need something custom?</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a tailored solution with dedicated support, custom SLAs, and enterprise features.
                  </p>
                </div>
                <Button variant="outline" className="shrink-0" asChild>
                  <Link href="/contact">
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(45,212,191,0.15),transparent)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Ready to ship your next project?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of developers who are building faster with Ovmon. Start free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-8 text-base font-medium" asChild>
                <Link href="/auth/signup">
                  Start Building Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
