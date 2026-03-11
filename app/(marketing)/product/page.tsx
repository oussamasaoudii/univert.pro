'use client';

import {
  Globe,
  Zap,
  Shield,
  Server,
  Code2,
  Layers,
  GitBranch,
  BarChart3,
  Lock,
  Cpu,
  RefreshCw,
  Rocket,
  Users,
  Clock,
  Database,
  Workflow,
} from "lucide-react";
import {
  HeroSection,
  FeatureShowcase,
  TrustMetrics,
  CTABand,
  BenefitsGrid,
  IntegrationGrid,
} from "@/components/marketing/sections";
import { ProductArchitecture } from "./product-architecture";
import { ProductComparison } from "./product-comparison";

// Core platform pillars
const platformPillars = [
  {
    icon: Globe,
    title: "Global Edge Network",
    description: "Deploy to 150+ edge locations worldwide. Automatic routing ensures users always connect to the nearest server for sub-50ms latency.",
    stat: "150+",
    statLabel: "Edge locations",
    highlight: true,
  },
  {
    icon: Rocket,
    title: "Instant Deployments",
    description: "Push to deploy in under 3 seconds. Atomic deployments with instant rollbacks ensure zero downtime updates.",
    stat: "<3s",
    statLabel: "Deploy time",
  },
  {
    icon: RefreshCw,
    title: "Automatic Scaling",
    description: "Handle traffic spikes automatically. Scale from zero to millions of requests without any configuration required.",
    stat: "10M+",
    statLabel: "Requests/sec",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC2 Type II certified with DDoS protection, Web Application Firewall, and automatic SSL for every deployment.",
    stat: "SOC2",
    statLabel: "Certified",
  },
];

// Developer experience features
const developerFeatures = [
  {
    icon: GitBranch,
    title: "Git Integration",
    description: "Connect your GitHub, GitLab, or Bitbucket repositories. Every push triggers an automatic deployment.",
  },
  {
    icon: Code2,
    title: "Framework Detection",
    description: "Automatic detection and optimization for Next.js, React, Vue, Nuxt, Angular, Svelte, and 40+ frameworks.",
  },
  {
    icon: Layers,
    title: "Preview Deployments",
    description: "Every pull request gets a unique preview URL. Review changes before merging to production.",
  },
  {
    icon: Server,
    title: "Serverless Functions",
    description: "Run backend code at the edge with zero cold starts. Node.js, Python, Go, and Rust supported.",
  },
  {
    icon: Database,
    title: "Edge Storage",
    description: "Store and serve assets from the edge. Automatic image optimization and caching built-in.",
  },
  {
    icon: Workflow,
    title: "CI/CD Pipeline",
    description: "Built-in continuous integration with automatic testing, linting, and deployment workflows.",
  },
];

// Platform capabilities for comparison
const platformCapabilities = [
  {
    icon: Zap,
    title: "Lightning Performance",
    description: "Optimized for Core Web Vitals with automatic code splitting, compression, and caching strategies.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Deep insights into traffic, performance, errors, and user behavior with zero configuration.",
  },
  {
    icon: Lock,
    title: "Security First",
    description: "HTTPS everywhere, DNSSEC, and enterprise-grade DDoS protection included by default.",
  },
  {
    icon: Cpu,
    title: "Edge Computing",
    description: "Execute code at the edge for the lowest possible latency. Middleware and API routes at every location.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Role-based access control, audit logs, and shared environments for seamless teamwork.",
  },
  {
    icon: Clock,
    title: "Instant Rollbacks",
    description: "One-click rollbacks to any previous deployment. Never worry about breaking changes again.",
  },
];

// Trust metrics
const trustItems = [
  { icon: Shield, label: 'SOC2 Type II', sublabel: 'Security certified' },
  { icon: Globe, label: '150+ Regions', sublabel: 'Global coverage' },
  { icon: Server, label: '99.99% Uptime', sublabel: 'SLA guaranteed' },
  { icon: Users, label: '50,000+ Devs', sublabel: 'Trust Ovmon' },
];

// Integration categories
const integrations = [
  { name: "Next.js", category: "Frameworks" },
  { name: "React", category: "Frameworks" },
  { name: "Vue", category: "Frameworks" },
  { name: "Nuxt", category: "Frameworks" },
  { name: "Svelte", category: "Frameworks" },
  { name: "Angular", category: "Frameworks" },
  { name: "GitHub", category: "Git" },
  { name: "GitLab", category: "Git" },
  { name: "Bitbucket", category: "Git" },
  { name: "Stripe", category: "Payments" },
  { name: "Auth0", category: "Auth" },
  { name: "Supabase", category: "Database" },
];

export default function ProductPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: "Platform" }}
        title="The complete platform for"
        titleHighlight="modern web"
        description="Build, deploy, and scale your applications with enterprise-grade infrastructure. From code to global deployment in seconds."
        actions={[
          { label: "Start building free", href: "/auth/signup", variant: "primary" },
          { label: "View documentation", href: "/docs", variant: "outline" },
        ]}
        variant="centered"
        backgroundVariant="gradient"
      />

      {/* Platform Pillars */}
      <FeatureShowcase
        badge="Core Platform"
        title="Enterprise infrastructure made simple"
        description="Everything you need to build and scale world-class applications."
        features={platformPillars}
        variant="bento"
      />

      {/* Trust Metrics */}
      <TrustMetrics
        items={trustItems}
        variant="badges"
        title="Trusted by teams worldwide"
      />

      {/* Architecture Visual */}
      <ProductArchitecture />

      {/* Developer Experience */}
      <BenefitsGrid
        badge="Developer Experience"
        title="Built for developers"
        description="Tools and workflows designed to maximize your productivity."
        benefits={developerFeatures}
        variant="cards"
        columns={3}
      />

      {/* Platform Comparison */}
      <ProductComparison />

      {/* Additional Capabilities */}
      <section className="bg-secondary/20">
        <BenefitsGrid
          badge="Platform Capabilities"
          title="Everything you need, nothing you don't"
          description="Comprehensive features without the complexity."
          benefits={platformCapabilities}
          variant="cards"
          columns={3}
        />
      </section>

      {/* Integrations */}
      <IntegrationGrid
        badge="Integrations"
        title="Works with your favorite tools"
        description="Seamless integration with the tools and services you already use."
        integrations={integrations}
      />

      {/* Final CTA */}
      <CTABand
        title="Ready to experience the difference?"
        description="Join 50,000+ developers building on Ovmon."
        actions={[
          { label: "Start building for free", href: "/auth/signup", variant: "primary" },
          { label: "Talk to sales", href: "/contact", variant: "outline" },
        ]}
        variant="centered"
      />
    </main>
  );
}
