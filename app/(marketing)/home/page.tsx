'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, useInView, animate } from 'framer-motion';
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
  RefreshCw,
  ExternalLink,
  Server,
  CreditCard,
  Fingerprint,
  Headphones
} from 'lucide-react';

// Import reusable section components
import { 
  CTABand, 
  TrustMetrics, 
  FAQSection,
  TestimonialSection 
} from '@/components/marketing/sections';

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

// Floating stat badge component with enhanced styling
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
      whileHover={{ scale: 1.02, y: -2 }}
      className={`absolute bg-card/95 backdrop-blur-md border border-border/60 rounded-xl px-4 py-3 shadow-2xl shadow-black/10 ${className}`}
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
    description: 'Deploy to 100+ edge locations worldwide. Sub-50ms latency guaranteed for users everywhere.',
    stat: '100+',
    statLabel: 'Edge Locations',
    highlight: true,
  },
  {
    icon: Zap,
    title: 'Instant Deployments',
    description: 'Push to deploy in under 3 seconds. Zero-downtime updates every time with automatic rollbacks.',
    stat: '<3s',
    statLabel: 'Deploy Time',
    highlight: false,
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 Type II certified with DDoS protection and WAF included by default. Sleep easy at night.',
    stat: 'SOC2',
    statLabel: 'Certified',
    highlight: true,
  },
  {
    icon: RefreshCw,
    title: 'Auto-Scaling',
    description: 'Handle traffic spikes automatically. Scale from 0 to millions of requests instantly without config.',
    stat: '10M+',
    statLabel: 'Requests/sec',
    highlight: false,
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

const platformCredentials = [
  { icon: Shield, label: 'SOC2 Type II', sublabel: 'Compliant', description: 'Enterprise-grade security audited annually' },
  { icon: Server, label: '99.99%', sublabel: 'Uptime SLA', description: 'Backed by financial guarantee' },
  { icon: Globe, label: '150+', sublabel: 'Edge Locations', description: 'Global CDN coverage' },
  { icon: Lock, label: 'DDoS', sublabel: 'Protection', description: 'Enterprise WAF included' },
];

const developerSignals = [
  { label: '50,000+', sublabel: 'Active developers', icon: Users },
  { label: '2B+', sublabel: 'Monthly requests served', icon: BarChart3 },
  { label: '<50ms', sublabel: 'Global P95 latency', icon: Zap },
  { label: '3s', sublabel: 'Average deploy time', icon: Rocket },
];

// FAQ data for homepage
const homepageFAQs = [
  {
    question: 'How do I get started with Ovmon?',
    answer: 'Getting started is easy! Sign up for a free account, connect your Git repository, and deploy with a single click. Your site will be live in under 60 seconds.',
  },
  {
    question: 'What frameworks does Ovmon support?',
    answer: 'Ovmon supports all major frameworks including Next.js, React, Vue, Nuxt, Angular, Svelte, and more. We also support static sites, serverless functions, and full-stack applications.',
  },
  {
    question: 'Is there a free tier available?',
    answer: 'Yes! Our Starter plan is completely free and includes 3 projects, 100GB bandwidth, free SSL, and community support. No credit card required.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We offer community support for free users, priority email support for Pro users, and dedicated support with SLA guarantees for Enterprise customers.',
  },
];

// Testimonials data
const homepageTestimonials = [
  {
    quote: 'Ovmon transformed our deployment workflow. What used to take hours now takes seconds. Our team productivity has increased dramatically.',
    author: {
      name: 'Sarah Chen',
      title: 'CTO',
      company: 'TechFlow',
    },
    rating: 5,
    featured: true,
  },
  {
    quote: 'The global edge network is incredible. Our users in Asia saw a 60% improvement in load times.',
    author: {
      name: 'Marcus Rivera',
      title: 'Lead Engineer',
      company: 'GlobalApp',
    },
    rating: 5,
  },
  {
    quote: 'Best developer experience I have ever used. The preview deployments for PRs changed how our team works.',
    author: {
      name: 'Emma Wilson',
      title: 'Frontend Developer',
      company: 'StartupXYZ',
    },
    rating: 5,
  },
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
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight text-balance">
                Ship websites{' '}
                <span className="text-accent">10x faster</span>{' '}
                without the complexity
              </h1>
              
              <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
                The complete platform to build, deploy, and scale modern web applications. 
                Trusted by 50,000+ developers worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 text-base font-medium shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all" asChild>
                  <Link href="/auth/signup">
                    Start Building Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6 text-base group hover:border-accent/50 transition-colors" asChild>
                  <Link href="/demos">
                    <Play className="mr-2 h-4 w-4 group-hover:text-accent transition-colors" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Social proof mini */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span>Join <strong className="text-foreground">50,000+</strong> developers</span>
                </div>

                {/* Trustpilot badge */}
                <a
                  href="https://www.trustpilot.com/review/ovmon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-secondary/40 hover:border-accent/50 hover:bg-secondary/70 transition-all group"
                  aria-label="View our Trustpilot reviews"
                >
                  {/* Trustpilot star (green) */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2L14.09 8.26L21 9.27L16.5 13.64L17.82 20.5L12 17.27L6.18 20.5L7.5 13.64L3 9.27L9.91 8.26L12 2Z" fill="#00b67a"/>
                  </svg>
                  <span className="text-xs font-semibold text-foreground">4.8</span>
                  <span className="text-xs text-muted-foreground">on Trustpilot</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              </div>
            </motion.div>

            {/* Right - Browser mockup with floating stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="relative lg:pl-8"
            >
              {/* Browser mockup with enhanced styling */}
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-accent/5 to-accent/20 rounded-2xl blur-2xl opacity-60" />
                
                <div className="relative bg-card border border-border/80 rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-background/50 rounded-md px-4 py-1 text-xs text-muted-foreground flex items-center gap-2">
                        <Lock className="w-3 h-3 text-green-500" />
                        app.ovmon.com/dashboard
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded bg-secondary/80" />
                      <div className="w-4 h-4 rounded bg-secondary/80" />
                    </div>
                  </div>
                  
                  {/* Dashboard content */}
                  <div className="p-6 bg-background min-h-[320px]">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { label: 'Total Deployments', value: '2,847', change: '+12%', positive: true },
                        { label: 'Avg Response Time', value: '42ms', change: '-8%', positive: true },
                        { label: 'Uptime', value: '99.99%', change: '+0.01%', positive: true },
                      ].map((stat, i) => (
                        <div key={i} className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                          <p className={`text-xs ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>{stat.change}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chart placeholder */}
                    <div className="bg-secondary/20 rounded-lg p-4 mb-4 border border-border/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Traffic Overview</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary/50 rounded">Last 7 days</span>
                      </div>
                      <div className="flex items-end gap-1 h-20">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                            className="flex-1 bg-gradient-to-t from-accent/80 to-accent/40 rounded-sm"
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
                        <div key={i} className="flex items-center justify-between text-sm bg-secondary/20 rounded-lg px-3 py-2 border border-border/20">
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deploy Time</p>
                      <p className="text-base font-bold text-foreground">2.3s avg</p>
                    </div>
                  </div>
                </FloatingBadge>

                <FloatingBadge className="-bottom-4 -right-4 lg:-right-8" delay={0.8}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Performance</p>
                      <p className="text-base font-bold text-foreground">+45% faster</p>
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

      {/* Platform Highlights Bar */}
      <section className="py-6 border-y border-border/50 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { label: 'Zero config deploys', icon: Zap },
              { label: 'Git-connected', icon: RefreshCw },
              { label: 'Free SSL included', icon: Lock },
              { label: 'Instant rollbacks', icon: Clock },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <item.icon className="w-4 h-4 text-accent" />
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Counters - Enhanced with container */}
      <AnimatedSection className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-secondary/30 border border-border/40 rounded-2xl p-8 lg:p-12">
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
                  whileHover={{ y: -2 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 mb-4 group-hover:bg-accent/20 group-hover:scale-105 transition-all">
                    <stat.icon className="w-7 h-7 text-accent" />
                  </div>
                  <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section - Enhanced with varied sizing */}
      <AnimatedSection className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Platform Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything you need to ship faster
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Built for modern development teams who demand performance, reliability, and simplicity.
            </p>
          </div>

          {/* Bento-style grid with varied sizing */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Large featured card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="lg:col-span-2 group"
            >
              <Card className="h-full bg-gradient-to-br from-accent/5 via-card/50 to-card/50 border-accent/30 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                <CardContent className="p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-5 group-hover:bg-accent/30 transition-colors">
                        <Globe className="w-7 h-7 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Global Edge Network</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        Deploy to 100+ edge locations worldwide. Your users get sub-50ms latency guaranteed, no matter where they are.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {['North America', 'Europe', 'Asia Pacific', 'South America'].map((region) => (
                          <span key={region} className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-full">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-4xl font-bold text-accent">100+</p>
                      <p className="text-sm text-muted-foreground">Edge Locations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instant Deploy card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card className="h-full bg-card/50 border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
                <CardContent className="p-6 lg:p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">{'<3s'}</p>
                      <p className="text-xs text-muted-foreground">Deploy Time</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Instant Deployments</h3>
                  <p className="text-muted-foreground flex-1">Push to deploy in under 3 seconds. Zero-downtime updates every time with automatic rollbacks.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card className="h-full bg-card/50 border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
                <CardContent className="p-6 lg:p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Shield className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">SOC2</p>
                      <p className="text-xs text-muted-foreground">Certified</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Enterprise Security</h3>
                  <p className="text-muted-foreground flex-1">SOC2 Type II certified with DDoS protection and WAF included by default.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Large auto-scaling card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="lg:col-span-2 group"
            >
              <Card className="h-full bg-card/50 border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
                <CardContent className="p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1">
                      <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                        <RefreshCw className="w-7 h-7 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Auto-Scaling Infrastructure</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Handle traffic spikes automatically. Scale from 0 to millions of requests instantly without any configuration. Pay only for what you use.
                      </p>
                    </div>
                    <div className="text-center lg:text-right shrink-0 lg:border-l lg:border-border/50 lg:pl-8">
                      <p className="text-4xl font-bold text-accent mb-1">10M+</p>
                      <p className="text-sm text-muted-foreground">Requests/sec capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Product Showcase Section - Enhanced terminal */}
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
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>

              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20" asChild>
                <Link href="/docs/getting-started">
                  Read the Docs
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Terminal mockup - Enhanced */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Outer glow */}
              <div className="absolute -inset-6 bg-accent/10 rounded-2xl blur-3xl opacity-50" />
              
              <div className="relative bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                {/* Terminal header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
                    </div>
                    <span className="text-xs text-muted-foreground/80 font-mono">zsh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/60 font-mono px-2 py-0.5 bg-white/5 rounded">~/projects/my-app</span>
                  </div>
                </div>
                
                {/* Terminal content */}
                <div className="p-6 font-mono text-sm bg-[#0d0d0d] min-h-[320px]">
                  <div className="text-green-400 mb-3">
                    <span className="text-muted-foreground/70">$</span> ovmon deploy
                  </div>
                  <div className="text-foreground/90 mb-3">
                    <span className="text-accent font-semibold">Ovmon</span> <span className="text-muted-foreground">Deploying to production...</span>
                  </div>
                  <div className="space-y-2 mb-4 pl-2 border-l-2 border-accent/30">
                    {[
                      { text: 'Building application...', done: true },
                      { text: 'Optimizing assets...', done: true },
                      { text: 'Deploying to 100+ edge locations...', done: true },
                      { text: 'SSL certificate issued', done: true },
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + i * 0.3 }}
                        className="flex items-center gap-2 text-muted-foreground/80 text-xs"
                      >
                        <span className="text-green-500">✓</span> {step.text}
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-4"
                  >
                    <div className="text-foreground">
                      <span className="text-green-500 font-semibold">Success!</span> Deployed to{' '}
                      <span className="text-accent underline decoration-accent/50">https://app.ovmon.com</span>
                    </div>
                    <div className="text-muted-foreground/70 text-xs mt-2 flex items-center gap-4">
                      <span>Deploy time: <span className="text-accent font-medium">2.3s</span></span>
                      <span>Build: <span className="text-green-500">Passed</span></span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Platform Trust Section - Premium trust-building block */}
      <AnimatedSection className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                Enterprise-Ready Infrastructure
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                Infrastructure you can trust
              </h2>
              <p className="text-foreground/60 max-w-2xl mx-auto">
                Built on battle-tested infrastructure with enterprise-grade security, reliability, and performance.
              </p>
            </div>

            {/* Security & Compliance Credentials */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {platformCredentials.map((credential, i) => (
                <motion.div
                  key={credential.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -3 }}
                  className="group"
                >
                  <Card className="h-full bg-card/60 border-border/50 hover:border-accent/40 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                          <credential.icon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">{credential.label}</p>
                          <p className="text-sm text-accent font-medium">{credential.sublabel}</p>
                          <p className="text-xs text-muted-foreground mt-1">{credential.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Platform Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-card/80 via-card/60 to-card/40 border-border/50">
                <CardContent className="p-8 lg:p-10">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Platform Performance</h3>
                    <p className="text-sm text-muted-foreground">Real-time metrics from our global infrastructure</p>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {developerSignals.map((signal, i) => (
                      <motion.div
                        key={signal.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="text-center group"
                      >
                        <div className="w-14 h-14 mx-auto rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-105 transition-all">
                          <signal.icon className="w-7 h-7 text-accent" />
                        </div>
                        <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{signal.label}</p>
                        <p className="text-sm text-muted-foreground">{signal.sublabel}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Developer Trust Signals - Horizontal compact bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6 px-4 rounded-xl bg-card/30 border border-border/30">
                {/* Open Source */}
                <a href="https://github.com/ovmon" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-foreground/80 hover:text-foreground transition-colors group">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Open Source CLI</span>
                </a>

                <span className="hidden sm:block w-px h-4 bg-border/50" aria-hidden="true" />

                {/* Docs */}
                <Link href="/docs" className="flex items-center gap-2.5 text-foreground/80 hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium">Documentation</span>
                </Link>

                <span className="hidden sm:block w-px h-4 bg-border/50" aria-hidden="true" />

                {/* Status */}
                <a href="/status" className="flex items-center gap-2.5 text-foreground/80 hover:text-foreground transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">All Systems Operational</span>
                </a>

                <span className="hidden sm:block w-px h-4 bg-border/50" aria-hidden="true" />

                {/* Trustpilot */}
                <a
                  href="https://www.trustpilot.com/review/ovmon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2L14.09 8.26L21 9.27L16.5 13.64L17.82 20.5L12 17.27L6.18 20.5L7.5 13.64L3 9.27L9.91 8.26L12 2Z" fill="#00b67a"/>
                  </svg>
                  <span className="text-sm font-medium">4.8 on Trustpilot</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing Section - Enhanced with trust notes */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Pricing Plans
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Simple, transparent pricing
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-accent text-accent-foreground shadow-lg shadow-accent/30 px-4">Recommended</Badge>
                  </div>
                )}
                <Card className={`h-full transition-all duration-300 ${plan.popular ? 'border-accent bg-card shadow-2xl shadow-accent/10 scale-[1.02]' : 'bg-card/50 border-border/50 hover:border-border'}`}>
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
                      className={`w-full ${plan.popular ? 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20' : ''}`}
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

          {/* Trust notes below pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>Instant SSL included</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-accent" />
              <span>Deploy in 60 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-accent" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>

          {/* Enterprise callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 max-w-3xl mx-auto"
          >
            <Card className="bg-secondary/30 border-border/50 hover:border-accent/30 transition-colors">
              <CardContent className="p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Need something custom?</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a tailored solution with dedicated support, custom SLAs, and enterprise features.
                  </p>
                </div>
                <Button variant="outline" className="shrink-0 hover:border-accent/50" asChild>
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

      {/* Testimonials Section - Using reusable component */}
      <TestimonialSection
        badge="Customer Stories"
        title="Loved by developers worldwide"
        description="See what developers and teams are saying about building with Ovmon."
        testimonials={homepageTestimonials}
        variant="featured"
      />

      {/* FAQ Section - Using reusable component */}
      <FAQSection
        badge="FAQ"
        title="Frequently Asked Questions"
        description="Everything you need to know about getting started with Ovmon."
        faqs={homepageFAQs}
        variant="default"
      />

      {/* Final CTA Section - Using reusable component */}
      <CTABand
        title="Start shipping faster today"
        description="Join 50,000+ developers who build and deploy with confidence. Get started in under 60 seconds."
        actions={[
          { label: 'Start Building Free', href: '/auth/signup', variant: 'primary' },
          { label: 'Talk to Sales', href: '/contact', variant: 'outline' },
        ]}
        variant="centered"
      />
    </div>
  );
}
