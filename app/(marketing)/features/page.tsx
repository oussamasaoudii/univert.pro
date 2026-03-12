import { Metadata } from 'next';
import {
  HeroSection,
  FeatureShowcase,
  TrustMetrics,
  ComparisonTable,
  BenefitsGrid,
  CTABand,
  FAQSection
} from '@/components/marketing/sections';

export const metadata: Metadata = {
  title: 'Features - Ovmon',
  description: 'Discover all the powerful features that make Ovmon the best platform for website hosting and deployment.',
};

// Core features for hero section
const coreFeatures = [
  {
    iconName: 'Zap' as const,
    title: 'Instant Deployment',
    description: 'Deploy your website in seconds with one-click provisioning and automated CI/CD pipelines.',
    stat: '<3s',
    statLabel: 'Deploy Time',
    highlight: true,
  },
  {
    iconName: 'Globe' as const,
    title: 'Global CDN',
    description: 'Lightning-fast content delivery with edge nodes in 150+ locations worldwide.',
    stat: '150+',
    statLabel: 'Edge Locations',
  },
  {
    iconName: 'Shield' as const,
    title: 'Enterprise Security',
    description: 'Bank-grade security with SSL, DDoS protection, and SOC2 compliance built-in.',
    stat: 'SOC2',
    statLabel: 'Certified',
  },
  {
    iconName: 'Clock' as const,
    title: '99.99% Uptime SLA',
    description: 'Guaranteed reliability with automatic failover and redundant infrastructure.',
    stat: '99.99%',
    statLabel: 'Uptime SLA',
  },
];

// Infrastructure features
const infrastructureFeatures = [
  {
    iconName: 'RefreshCw' as const,
    title: 'Auto-Scaling',
    description: 'Automatically scale resources based on traffic demand without any manual intervention.',
    href: '/features/scaling',
  },
  {
    iconName: 'Cpu' as const,
    title: 'Edge Computing',
    description: 'Run serverless functions at the edge for ultra-low latency responses.',
    href: '/features/edge-network',
  },
  {
    iconName: 'Database' as const,
    title: 'Managed Databases',
    description: 'Fully managed PostgreSQL, MySQL, and Redis with automatic backups.',
    href: '/features/databases',
  },
  {
    iconName: 'Server' as const,
    title: 'Serverless Functions',
    description: 'Run backend code without managing servers. Scale automatically.',
    href: '/features/serverless',
  },
];

// Developer experience features
const devExperienceFeatures = [
  {
    iconName: 'Layers' as const,
    title: 'Git Integration',
    description: 'Connect your GitHub, GitLab, or Bitbucket repositories for automatic deployments.',
    href: '/features/git-integration',
  },
  {
    iconName: 'MonitorSmartphone' as const,
    title: 'Preview Deployments',
    description: 'Every pull request gets a unique preview URL for testing and collaboration.',
    href: '/features/previews',
  },
  {
    iconName: 'Settings2' as const,
    title: 'Environment Variables',
    description: 'Securely manage secrets and configuration across all environments.',
    href: '/features/env-vars',
  },
  {
    iconName: 'Code2' as const,
    title: 'Developer Tools',
    description: 'CLI, SDK, and comprehensive API access for full control.',
    href: '/features/developer-tools',
  },
];

// Trust metrics
const trustItems = [
  { iconName: 'Shield' as const, label: 'SOC2 Type II', sublabel: 'Certified', description: 'Annual security audits' },
  { iconName: 'Server' as const, label: '99.99%', sublabel: 'Uptime SLA', description: 'Financial guarantee' },
  { iconName: 'Globe' as const, label: '150+', sublabel: 'Edge Locations', description: 'Global CDN coverage' },
  { iconName: 'Lock' as const, label: 'DDoS', sublabel: 'Protected', description: 'Enterprise WAF included' },
];

// Comparison table data
const comparisonColumns = [
  { name: 'Feature', highlighted: false },
  { name: 'Ovmon', highlighted: true },
  { name: 'Traditional Hosting', highlighted: false },
];

const comparisonRows = [
  { feature: 'Global CDN', values: [true, true, 'Limited'] },
  { feature: 'Auto SSL Certificates', values: [true, true, true] },
  { feature: 'Preview Deployments', values: [true, true, false] },
  { feature: 'Edge Functions', values: [true, true, 'Paid addon'] },
  { feature: 'Git Integration', values: [true, true, true] },
  { feature: '99.99% SLA Guarantee', values: [true, true, false] },
  { feature: 'DDoS Protection', values: [true, true, 'Paid addon'] },
  { feature: 'Real-time Analytics', values: [true, true, 'Paid addon'] },
  { feature: '24/7 Priority Support', values: [true, true, 'Business only'] },
  { feature: 'Automatic Scaling', values: [true, true, false] },
];

// FAQ data
const featuresFAQs = [
  {
    question: 'What frameworks does Ovmon support?',
    answer: 'Ovmon supports all major frameworks including Next.js, React, Vue, Nuxt, Angular, Svelte, Astro, and more. We also support static sites, serverless functions, and full-stack applications.',
  },
  {
    question: 'How does automatic scaling work?',
    answer: 'Our infrastructure automatically detects traffic increases and scales your resources accordingly. You never need to configure scaling rules - we handle everything from zero to millions of requests seamlessly.',
  },
  {
    question: 'Is my data secure with Ovmon?',
    answer: 'Yes. We are SOC2 Type II certified, offer DDoS protection, automatic SSL, and enterprise-grade WAF. All data is encrypted at rest and in transit. We also provide role-based access controls and audit logs.',
  },
  {
    question: 'What is included in the SLA guarantee?',
    answer: 'Our 99.99% uptime SLA is backed by a financial guarantee. If we fail to meet this target, you receive service credits. Enterprise customers can negotiate custom SLAs with dedicated support.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: 'Platform Features', iconName: 'Sparkles' }}
        title="Everything You Need to"
        titleHighlight="Ship Faster"
        description="Ovmon provides a complete suite of tools for deploying, managing, and scaling your web applications with enterprise-grade reliability."
        actions={[
          { label: 'Start Building Free', href: '/auth/signup', variant: 'primary' },
          { label: 'View Pricing', href: '/pricing', variant: 'outline' },
        ]}
        variant="centered"
        backgroundVariant="gradient"
      />

      {/* Core Features - Bento Grid */}
      <FeatureShowcase
        badge="Core Features"
        title="Built for performance and reliability"
        description="Every feature is designed to help you ship faster with confidence."
        features={coreFeatures}
        variant="bento"
      />

      {/* Trust Metrics Bar */}
      <TrustMetrics
        items={trustItems}
        variant="badges"
        title="Enterprise-Grade Infrastructure"
      />

      {/* Infrastructure Features */}
      <FeatureShowcase
        badge="Infrastructure"
        title="Scalable, reliable infrastructure"
        description="Infrastructure that grows with your application without any manual configuration."
        features={infrastructureFeatures}
        variant="grid"
        columns={4}
      />

      {/* Developer Experience Features */}
      <section className="bg-secondary/20">
        <FeatureShowcase
          badge="Developer Experience"
          title="Tools designed for productivity"
          description="Workflows and integrations that maximize developer productivity and collaboration."
          features={devExperienceFeatures}
          variant="grid"
          columns={4}
        />
      </section>

      {/* Security Benefits */}
      <BenefitsGrid
        badge="Security & Compliance"
        title="Enterprise-grade security"
        description="Protect your applications with industry-leading security measures."
        benefits={[
          { iconName: 'Shield' as const, title: 'Automatic SSL', description: 'SSL/TLS certificates provisioned automatically with zero configuration.' },
          { iconName: 'Lock' as const, title: 'DDoS Protection', description: 'Advanced protection against distributed denial-of-service attacks.' },
          { iconName: 'Settings2' as const, title: 'Role-Based Access', description: 'Fine-grained permissions and audit logs for team collaboration.' },
          { iconName: 'BarChart3' as const, title: 'Real-time Monitoring', description: 'Continuous health checks with instant alerts.' },
          { iconName: 'Headphones' as const, title: '24/7 Support', description: 'Round-the-clock support for enterprise customers.' },
          { iconName: 'Workflow' as const, title: 'Compliance Ready', description: 'SOC2 Type II certified with GDPR compliance.' },
        ]}
        variant="cards"
        columns={3}
      />

      {/* Comparison Table */}
      <ComparisonTable
        badge="Why Ovmon"
        title="How we compare"
        description="See how Ovmon stacks up against traditional hosting providers."
        columns={comparisonColumns}
        rows={comparisonRows}
        variant="default"
      />

      {/* FAQ Section */}
      <FAQSection
        badge="FAQ"
        title="Frequently Asked Questions"
        description="Common questions about Ovmon features and capabilities."
        faqs={featuresFAQs}
        variant="default"
      />

      {/* Final CTA */}
      <CTABand
        title="Ready to experience the difference?"
        description="Join thousands of developers and teams who trust Ovmon for their web infrastructure."
        actions={[
          { label: 'Get Started Free', href: '/auth/signup', variant: 'primary' },
          { label: 'Talk to Sales', href: '/contact', variant: 'outline' },
        ]}
        variant="gradient"
      />
    </div>
  );
}
