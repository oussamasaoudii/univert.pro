'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    title: 'Curated Professional Templates',
    description: 'Browse real live demos of WordPress, Laravel, and Next.js websites. Choose what fits your business.',
    stat: '50+',
    statLabel: 'Templates',
    highlight: true,
  },
  {
    icon: Zap,
    title: 'Launch in Days, Not Months',
    description: 'Your website is ready with managed setup included. No technical expertise needed.',
    stat: '1 Day',
    statLabel: 'Average Setup',
    highlight: false,
  },
  {
    icon: Shield,
    title: 'Managed Support Included',
    description: 'Get technical help, updates, and maintenance handled by our team. Focus on your business.',
    stat: '24/7',
    statLabel: 'Support',
    highlight: true,
  },
  {
    icon: RefreshCw,
    title: 'Freedom to Move Later',
    description: 'Export your project and move to your own server anytime. You own your website, not locked in.',
    stat: '100%',
    statLabel: 'Yours',
    highlight: false,
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small businesses and creatives',
    features: ['1 Website', 'Choose Your Stack', 'Managed Setup & Hosting', 'Email Support', 'Basic Analytics', 'Subdomain'],
    popular: false,
    cta: 'Get Started',
  },
  {
    name: 'Growth',
    price: '$79',
    period: '/month',
    description: 'For growing businesses with multiple projects',
    features: ['3 Websites', 'Custom Domains', 'Priority Support', 'Advanced Analytics', 'Backups & Recovery', 'Email + Chat Support'],
    popular: true,
    cta: 'Choose Growth',
  },
  {
    name: 'Business',
    price: 'Custom',
    period: '',
    description: 'Enterprise solutions with dedicated support',
    features: ['Unlimited Websites', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee', 'Advanced Security', 'Strategic Consulting'],
    popular: false,
    cta: 'Contact Sales',
  },
];

const platformCredentials = [
  { icon: Shield, label: 'Managed Setup', sublabel: 'Included', description: 'We handle the technical details' },
  { icon: Globe, label: 'Custom Domain', sublabel: 'Support', description: 'Use your own domain' },
  { icon: Headphones, label: 'Real Support', sublabel: 'Team', description: 'Human support when you need it' },
  { icon: Lock, label: 'Export', sublabel: 'Freedom', description: 'Move your project anytime' },
];

const platformMetrics = [
  { label: 'Hundreds', sublabel: 'Active customers', icon: Users },
  { label: '10M+', sublabel: 'Monthly visitors served', icon: BarChart3 },
  { label: '<100ms', sublabel: 'Global load time', icon: Zap },
  { label: '24/7', sublabel: 'Support available', icon: Headphones },
];

// FAQ data for homepage
const homepageFAQs = [
  {
    question: 'How do I get started with Univert?',
    answer: 'Browse our template gallery, choose one that fits your business, select your subdomain, choose a plan, and we handle the rest. Your website is typically live within 24 hours with our managed setup.',
  },
  {
    question: 'What stacks and templates do you support?',
    answer: 'We offer launch-ready websites in WordPress, Laravel, and Next.js. Each template includes managed hosting, updates, backups, and technical support.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'Absolutely. All plans include support for custom domains. We&apos;ll help you connect your domain and handle the technical setup.',
  },
  {
    question: 'What happens if I want to move my website later?',
    answer: 'You can export your website anytime and move it to your own server. We&apos;ll provide migration support. Your website stays yours—you&apos;re never locked in.',
  },
];

// Testimonials data
const homepageTestimonials = [
  {
    quote: 'We launched our shop in 2 weeks instead of 2 months. The managed support took so much stress off our team.',
    author: {
      name: 'Lisa Chen',
      title: 'Owner',
      company: 'Local Bakery Co.',
    },
    rating: 5,
    featured: true,
  },
  {
    quote: 'Knowing I can move my site to my own server later gives me peace of mind. We&apos;re not locked in.',
    author: {
      name: 'James Riley',
      title: 'Founder',
      company: 'Digital Agency',
    },
    rating: 5,
  },
  {
    quote: 'The templates are professional and modern. Our customers think we hired an expensive developer. The support team is always there when we need them.',
    author: {
      name: 'Maria Santos',
      title: 'Marketing Manager',
      company: 'Consulting Firm',
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
                  Professional Templates with Managed Support
                </Badge>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight text-balance">
                Your ready-made website{' '}
                <span className="text-accent">in minutes</span>—and it stays yours
              </h1>
              
              <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
                Browse professional templates, launch fast on your own subdomain, get managed support, and move your project to your own server later if you choose. No technical skills required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 text-base font-medium shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all" asChild>
                  <Link href="/templates">
                    Browse Templates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6 text-base group hover:border-accent/50 transition-colors" asChild>
                  <Link href="/how-it-works">
                    How It Works
                  </Link>
                </Button>
              </div>

              {/* Social proof mini */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Join hundreds of business owners launching websites on Univert</span>
                </div>
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
                        univert.pro/dashboard
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
                        { label: 'Active Websites', value: '12', change: '+2', positive: true },
                        { label: 'Avg Load Time', value: '42ms', change: '-8%', positive: true },
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

                    {/* Recent websites */}
                    <div className="space-y-2">
                      {[
                        { name: 'Main Website', status: 'Live', time: 'Updated 2m ago' },
                        { name: 'Landing Page', status: 'Setting Up', time: 'Now' },
                      ].map((site, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-secondary/20 rounded-lg px-3 py-2 border border-border/20">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${site.status === 'Live' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                            <span>{site.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{site.time}</span>
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
                      <p className="text-xs text-muted-foreground">Setup Time</p>
                      <p className="text-base font-bold text-foreground">24h avg</p>
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
                      {[
                        'https://randomuser.me/api/portraits/men/22.jpg',
                        'https://randomuser.me/api/portraits/women/28.jpg',
                        'https://randomuser.me/api/portraits/men/45.jpg',
                      ].map((src, i) => (
                        <Image 
                          key={i} 
                          src={src} 
                          alt={`Online user ${i + 1}`}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full border border-background object-cover"
                        />
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
              { label: 'Managed setup', icon: Zap },
              { label: '24/7 support', icon: Headphones },
              { label: 'Free SSL included', icon: Lock },
              { label: 'Daily backups', icon: Clock },
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
                { value: 500, suffix: '+', label: 'Active Customers', icon: Users },
                { value: 99.99, suffix: '%', label: 'Uptime SLA', icon: Shield },
                { value: 50, suffix: '+', label: 'Templates', icon: Globe },
                { value: 24, suffix: '/7', label: 'Support', icon: Headphones },
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
              What You Get
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything included in your plan
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Professional templates, managed hosting, 24/7 support, and complete ownership of your website.
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
                      <h3 className="text-2xl font-bold text-foreground mb-3">Professional Website Templates</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        Choose from 50+ professionally designed, production-ready templates. Each template includes managed setup, hosting, SSL, backups, and 24/7 support.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {['WordPress', 'Laravel', 'Next.js', 'Custom Stacks'].map((stack) => (
                          <span key={stack} className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-full">
                            {stack}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-4xl font-bold text-accent">50+</p>
                      <p className="text-sm text-muted-foreground">Templates Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Setup Speed card */}
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
                      <p className="text-2xl font-bold text-accent">24h</p>
                      <p className="text-xs text-muted-foreground">Avg Setup</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Fast Launch</h3>
                  <p className="text-muted-foreground flex-1">Your website is ready to go in 24 hours. Our team handles setup, configuration, and gets you live with zero downtime.</p>
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

            {/* Large managed operations card */}
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
                        <Headphones className="w-7 h-7 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Managed Operations</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Let our team handle the technical heavy lifting. We manage updates, security patches, backups, monitoring, and support. You focus on your business.
                      </p>
                    </div>
                    <div className="text-center lg:text-right shrink-0 lg:border-l lg:border-border/50 lg:pl-8">
                      <p className="text-4xl font-bold text-accent mb-1">24/7</p>
                      <p className="text-sm text-muted-foreground">Support & Monitoring</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Customer Success Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                Your Success is Our Mission
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
                Launch with confidence
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Choose your template, tell us about your business, and our team manages everything else. Your website is live and ready to serve customers in under 24 hours.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Professional setup and configuration by our team',
                  'Your domain connected and SSL certificate installed',
                  'Email setup and integration support included',
                  'Ongoing updates, security patches, and monitoring',
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
                <Link href="/how-it-works">
                  Learn How It Works
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Success showcase mockup */}
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
                {/* Browser header */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-muted-foreground/80 font-mono">univert.pro</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground/60 font-mono px-2 py-0.5 bg-white/5 rounded">https://yoursite.univert.pro</div>
                </div>
                
                {/* Content */}
                <div className="p-6 bg-foreground/5">
                  <div className="space-y-4">
                    <div className="h-8 bg-accent/20 rounded-lg w-2/3" />
                    <div className="h-4 bg-muted rounded-lg w-full" />
                    <div className="h-4 bg-muted rounded-lg w-5/6" />
                    <div className="h-32 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg mt-6" />
                    <div className="h-4 bg-muted rounded-lg w-1/2 mt-4" />
                  </div>
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
                Trusted Platform
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                Built for business owners
              </h2>
              <p className="text-foreground/60 max-w-2xl mx-auto">
                Secure hosting, reliable uptime, professional support, and the freedom to move whenever you want.
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
                    {platformMetrics.map((metric, i) => (
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
                {/* Knowledge Base */}
                <Link href="/knowledge-base" className="flex items-center gap-2.5 text-foreground/80 hover:text-foreground transition-colors group">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm font-medium">Knowledge Base</span>
                </Link>

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
                  href="https://www.trustpilot.com/review/univert.pro"
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
              <span>Launch in 24 hours</span>
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
        title="Trusted by business owners"
        description="See what customers are saying about launching their websites with Univert."
        testimonials={homepageTestimonials}
        variant="featured"
      />

      {/* FAQ Section - Using reusable component */}
      <FAQSection
        badge="FAQ"
        title="Frequently Asked Questions"
        description="Everything you need to know about getting started with Univert."
        faqs={homepageFAQs}
        variant="default"
      />

      {/* Final CTA Section - Using reusable component */}
      <CTABand
        title="Launch your website today"
        description="Join hundreds of business owners who launched their websites with confidence. Get started in minutes."
        actions={[
          { label: 'Browse Templates', href: '/templates', variant: 'primary' },
          { label: 'Talk to Sales', href: '/contact', variant: 'outline' },
        ]}
        variant="centered"
      />
    </div>
  );
}
