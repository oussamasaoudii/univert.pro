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
  Users,
  TrendingUp,
  Play,
  ChevronRight,
  Sparkles,
  Code2,
  Database,
  Lock,
  RefreshCw,
  ExternalLink,
  Server,
  FileText,
  Layers,
  BarChart3,
  Rocket,
  Terminal,
  GitBranch,
  Eye,
  RotateCcw,
  Cpu,
  Gauge,
  Smartphone,
  Boxes,
  MessageSquare,
} from 'lucide-react';

import {
  CTABand,
  TrustMetrics,
  FAQSection,
  TestimonialSection,
  StatsSection,
  IntegrationGrid,
  ComparisonTable,
  FeatureShowcase,
  HeroSection,
} from '@/components/marketing/sections';

// Animated counter
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

// Floating metric badge
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

export default function ProductPage() {
  const platformPillars = [
    {
      icon: Globe,
      title: 'Global Edge Performance',
      description: 'Deploy code to 150+ edge locations worldwide with sub-50ms latency',
    },
    {
      icon: Rocket,
      title: 'Deploy in Seconds',
      description: 'Git-based workflows with zero-downtime deployments and instant rollbacks',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC2 Type II certified with built-in DDoS protection and WAF',
    },
    {
      icon: Code2,
      title: 'Developer-First Workflow',
      description: 'CLI, SDK, and APIs designed for modern development teams',
    },
  ];

  const coreFeatures = [
    {
      icon: Globe,
      title: 'Global Edge Network',
      description: '150+ edge locations with automatic request routing and sub-50ms latency worldwide.',
      stat: '150+',
      statLabel: 'Edge Locations',
    },
    {
      icon: Rocket,
      title: 'Instant Deploys',
      description: 'Push to deploy in under 3 seconds. Git-based workflows with zero-downtime updates.',
      stat: '<3s',
      statLabel: 'Deploy Time',
    },
    {
      icon: RefreshCw,
      title: 'Auto-Scaling',
      description: 'Handle traffic spikes automatically. Scale from zero to millions without configuration.',
      stat: '10M+',
      statLabel: 'Req/second',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC2 Type II certified with DDoS protection, WAF, and access controls included.',
      stat: 'SOC2',
      statLabel: 'Certified',
    },
    {
      icon: Server,
      title: 'Serverless Functions',
      description: 'Run backend code at the edge. No servers to manage, scales automatically.',
      stat: '0ms',
      statLabel: 'Cold Start',
    },
    {
      icon: Code2,
      title: 'Developer Tools',
      description: 'Comprehensive CLI, SDK, and REST APIs for seamless integration with your workflow.',
      stat: '100%',
      statLabel: 'API Coverage',
    },
  ];

  const performanceFeatures = [
    {
      icon: Gauge,
      title: 'Global Caching',
      description: 'Intelligent edge caching reduces origin load by 90% and accelerates content delivery.',
    },
    {
      icon: Cpu,
      title: 'Smart Routing',
      description: 'Automatic geographic routing ensures users always connect to the nearest edge server.',
    },
    {
      icon: Zap,
      title: 'HTTP/3 Support',
      description: 'Latest protocol support for faster, more reliable connections across all networks.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Metrics',
      description: 'Live performance analytics and detailed latency insights at your fingertips.',
    },
  ];

  const deploymentFeatures = [
    {
      icon: GitBranch,
      title: 'Git Integration',
      description: 'Deploy automatically with every push. Connect any GitHub, GitLab, or Bitbucket repo.',
    },
    {
      icon: Eye,
      title: 'Preview Environments',
      description: 'Generate unique URLs for every pull request to preview changes before merging.',
    },
    {
      icon: RotateCcw,
      title: 'One-Click Rollbacks',
      description: 'Revert to any previous version instantly if something goes wrong in production.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Manage deployments, environment variables, and access controls for your entire team.',
    },
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: 'SSL/TLS Encryption',
      description: 'Automatic HTTPS with free SSL certificates and secure domain management.',
    },
    {
      icon: Shield,
      title: 'DDoS Protection',
      description: 'Enterprise-grade DDoS mitigation protects your infrastructure from attacks.',
    },
    {
      icon: Sparkles,
      title: 'Web Application Firewall',
      description: 'Built-in WAF rules protect against common web vulnerabilities and threats.',
    },
    {
      icon: Check,
      title: 'Access Control',
      description: 'Fine-grained permissions, API keys, and OAuth 2.0 for secure integrations.',
    },
  ];

  const integrations = [
    { name: 'GitHub', category: 'Version Control', featured: true },
    { name: 'GitLab', category: 'Version Control', featured: true },
    { name: 'Bitbucket', category: 'Version Control', featured: false },
    { name: 'Slack', category: 'Notifications', featured: true },
    { name: 'Sentry', category: 'Monitoring', featured: false },
    { name: 'DataDog', category: 'Monitoring', featured: false },
    { name: 'New Relic', category: 'Monitoring', featured: false },
    { name: 'PagerDuty', category: 'Alerts', featured: false },
  ];

  const useCases = [
    {
      title: 'Agencies',
      description: 'White-label hosting for client projects with advanced billing and team management.',
      icon: Users,
    },
    {
      title: 'E-commerce',
      description: 'Optimized for high-traffic online stores with instant checkouts and sub-50ms latency.',
      icon: TrendingUp,
    },
    {
      title: 'SaaS Platforms',
      description: 'Reliable infrastructure for multi-tenant applications with enterprise security.',
      icon: Layers,
    },
    {
      title: 'Content Creators',
      description: 'Perfect for blogs, portfolios, and media sites with CDN acceleration built-in.',
      icon: FileText,
    },
    {
      title: 'Enterprise Apps',
      description: 'Compliance-ready with SOC2, HIPAA-compatible infrastructure and advanced controls.',
      icon: Database,
    },
    {
      title: 'Education',
      description: 'Affordable hosting for student projects with educational discounts and free tier.',
      icon: Sparkles,
    },
  ];

  const comparisons = [
    {
      feature: 'Edge Network Coverage',
      description: 'Number of global edge locations',
      values: ['150+ locations', 'Limited', '50+ locations'],
    },
    {
      feature: 'Deploy Time',
      description: 'Average time from push to production',
      values: ['<3 seconds', '2-5 minutes', '1-3 minutes'],
    },
    {
      feature: 'Automatic Scaling',
      description: 'Handle traffic spikes without configuration',
      values: [true, true, 'partial'],
    },
    {
      feature: 'Zero-Downtime Deployments',
      description: 'Deploy without interrupting service',
      values: [true, true, false],
    },
    {
      feature: 'DDoS Protection',
      description: 'Built-in security against attacks',
      values: [true, false, false],
    },
    {
      feature: 'Serverless Functions',
      description: 'Run backend code at the edge',
      values: [true, true, false],
    },
    {
      feature: 'SOC2 Certified',
      description: 'Enterprise security certification',
      values: [true, true, false],
    },
    {
      feature: 'Transparent Pricing',
      description: 'No hidden fees, pay for what you use',
      values: [true, 'partial', false],
    },
  ];

  const faqs = [
    {
      question: 'What can I deploy on Ovmon?',
      answer: 'You can deploy static sites, Next.js apps, APIs, serverless functions, and any Node.js-based application. Ovmon supports all major frameworks and languages.',
    },
    {
      question: 'How fast is deployment?',
      answer: 'Average deployment time is under 3 seconds from when you push to git. Preview environments are deployed instantly for testing.',
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer: 'Your site continues to run. We charge automatically for overage usage based on our transparent pricing. No surprises, no rate limiting.',
    },
    {
      question: 'Can I use a custom domain?',
      answer: 'Yes, you can use any custom domain. We provide free SSL certificates and automatic HTTPS for all domains.',
    },
    {
      question: 'Do you offer team collaboration?',
      answer: 'Yes. You can invite team members, set role-based permissions, manage environment variables, and control deployments per team.',
    },
    {
      question: 'What if I need to migrate from another host?',
      answer: 'Our team can help you migrate. Most sites move in minutes with our seamless migration tools and support.',
    },
  ];

const testimonials = [
  {
    quote: 'Ovmon reduced our deployment time from 15 minutes to under 3 seconds. The edge network keeps our users happy everywhere.',
    author: {
      name: 'Sarah Chen',
      title: 'CTO',
      company: 'TechFlow',
    },
  },
  {
    quote: 'The developer experience is unmatched. CLI, preview environments, and rollbacks make shipping code a joy.',
    author: {
      name: 'Marcus Johnson',
      title: 'Lead Developer',
      company: 'GlobalRetail',
    },
  },
  {
    quote: 'Enterprise security without the complexity. SOC2 compliance and DDoS protection out of the box.',
    author: {
      name: 'Elena Rodriguez',
      title: 'VP Engineering',
      company: 'FinanceHub',
    },
  },
];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection
        badge={{
          text: 'Product Overview',
          icon: Sparkles,
        }}
        title="Everything you need to build, deploy, and scale modern websites"
        description="Ovmon is the unified platform for high-performance, globally distributed applications. Deploy to 150+ edge locations, scale instantly, and sleep soundly with enterprise security."
        actions={[
          {
            label: 'Start Building Free',
            href: '/auth/signup',
            variant: 'primary',
          },
          {
            label: 'Book a Demo',
            href: '/contact-sales',
            variant: 'outline',
            icon: Play,
          },
        ]}
        socialProof={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-accent/20 border-2 border-background flex items-center justify-center text-xs font-semibold text-accent"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-sm text-foreground/70">
                <span className="font-semibold text-foreground">50,000+</span> developers trust Ovmon
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Check className="w-4 h-4 text-accent" />
              99.99% uptime SLA
            </div>
          </div>
        }
        visual={
          <div className="relative w-full h-96 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20 flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="space-y-4 text-center">
                <Layers className="w-16 h-16 text-accent/60 mx-auto" />
                <p className="text-sm text-foreground/50">Dashboard Preview</p>
              </div>
            </motion.div>
            
            {/* Floating metric badges */}
            <FloatingBadge className="top-8 left-6" delay={0.1}>
              <div className="text-xs font-semibold text-foreground">Response: 45ms</div>
              <div className="text-xs text-foreground/60">Frankfurt Edge</div>
            </FloatingBadge>
            
            <FloatingBadge className="top-32 right-6" delay={0.2}>
              <div className="text-xs font-semibold text-foreground">Uptime: 99.99%</div>
              <div className="text-xs text-foreground/60">This month</div>
            </FloatingBadge>
            
            <FloatingBadge className="bottom-8 left-1/2 -translate-x-1/2" delay={0.3}>
              <div className="text-xs font-semibold text-foreground">Deploy: 2.3s</div>
              <div className="text-xs text-foreground/60">Latest push</div>
            </FloatingBadge>
          </div>
        }
      />

      {/* Platform Pillars Strip */}
      <section className="py-16 bg-secondary/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformPillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors">
                  <pillar.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Overview */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Core Platform
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything built into one platform
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              No integrations required. All the features modern teams need are baked in from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-5 group-hover:bg-accent/30 transition-colors">
                      <feature.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/60 leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-2xl font-bold text-accent">{feature.stat}</p>
                      <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Showcase */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                Performance
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
                Lightning-fast edge delivery, everywhere
              </h2>
              <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
                Ovmon's global edge network ensures your content reaches users with sub-50ms latency. Intelligent caching and smart routing automatically optimize performance.
              </p>
              
              <div className="space-y-4">
                {performanceFeatures.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-foreground/60">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-96 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20 flex items-center justify-center overflow-hidden"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                <Gauge className="w-24 h-24 text-accent/40 mx-auto" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deployment Workflow */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-96 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20 flex items-center justify-center overflow-hidden order-2 lg:order-1"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Terminal className="w-24 h-24 text-accent/40 mx-auto" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                Deployments
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
                Deploy with confidence in seconds
              </h2>
              <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
                Git-based workflows with preview environments for every pull request. One-click rollbacks if anything goes wrong. Zero-downtime deployments guaranteed.
              </p>
              
              <div className="space-y-4">
                {deploymentFeatures.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-foreground/60">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security & Reliability */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Security & Reliability
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Enterprise security built in
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              SOC2 Type II certified with DDoS protection, WAF, and comprehensive access controls.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full bg-card hover:border-accent/40 transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                      <feature.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Experience */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Developer Tools
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Tools built for developers
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Powerful CLI, comprehensive SDK, REST API, and preview environments for seamless development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Terminal, title: 'Command Line Interface', description: 'Full-featured CLI for deployments, environment management, and local development.' },
              { icon: Code2, title: 'SDK & Libraries', description: 'Official SDKs for JavaScript, Python, Go, Ruby, and more with zero boilerplate.' },
              { icon: FileText, title: 'REST API', description: '100% API coverage for all platform features. Build custom automation and integrations.' },
              { icon: Eye, title: 'Preview Environments', description: 'Unique URLs for every pull request. Share work with stakeholders instantly.' },
              { icon: Users, title: 'Team Collaboration', description: 'Role-based permissions, shared variables, and deployment approvals built-in.' },
              { icon: Database, title: 'Databases', description: 'Connect to PostgreSQL, MongoDB, Redis, and other services. Edge-optimized queries.' },
            ].map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full bg-card hover:border-accent/40 transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                      <tool.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{tool.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <IntegrationGrid
        badge="Integrations"
        title="Works with your entire stack"
        description="Seamlessly integrate with your favorite tools and services."
        integrations={integrations}
        variant="featured"
      />

      {/* Use Cases */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Use Cases
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Perfect for any project
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full bg-card hover:border-accent/40 transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                      <useCase.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{useCase.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics / Proof Section */}
      <StatsSection
        stats={[
          { value: 50000, suffix: '+', label: 'Developers' },
          { value: 2, suffix: 'B+', label: 'Monthly Requests' },
          { value: 150, suffix: '+', label: 'Edge Locations' },
          { value: 99.99, suffix: '%', label: 'Uptime SLA' },
        ]}
        variant="contained"
        columns={4}
      />

      {/* Testimonials */}
      <TestimonialSection
        testimonials={testimonials}
        badge="Customer Proof"
        title="Trusted by teams worldwide"
      />

      {/* Comparison / Why Ovmon Section */}
      <ComparisonTable
        badge="Why Ovmon?"
        title="See why teams choose Ovmon"
        description="The most complete platform for global deployment and performance."
        columns={[
          { name: 'Ovmon', highlighted: true },
          { name: 'Traditional Hosting' },
          { name: 'Other Platforms' },
        ]}
        rows={comparisons}
        variant="cards"
      />

      {/* FAQ */}
      <FAQSection
        badge="Questions?"
        title="Frequently asked questions"
        description="Everything you need to know about Ovmon."
        faqs={faqs}
      />

      {/* Final CTA */}
      <CTABand
        title="Ready to ship faster?"
        description="Join 50,000+ developers who use Ovmon to deploy globally with confidence."
        primaryCta={{
          label: 'Start Building Free',
          href: '/auth/signup',
        }}
        secondaryCta={{
          label: 'Talk to Sales',
          href: '/contact-sales',
        }}
        variant="primary"
      />
    </main>
  );
}
