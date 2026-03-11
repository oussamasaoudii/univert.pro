import { Metadata } from "next";
import {
  Building2,
  ShoppingCart,
  Layers,
  Briefcase,
  Globe,
  Zap,
  Lock,
  Server,
  Heart,
  GraduationCap,
  Users,
  Shield,
  BarChart3,
  Headphones,
} from "lucide-react";
import {
  HeroSection,
  IndustryCards,
  FeatureShowcase,
  TrustMetrics,
  TestimonialSection,
  CTABand,
  BenefitsGrid,
} from "@/components/marketing/sections";

export const metadata: Metadata = {
  title: "Solutions - Ovmon",
  description: "Discover how Ovmon helps businesses of all sizes build, deploy, and scale their web presence.",
};

// Industry solutions data
const industries = [
  {
    title: "E-commerce",
    description: "Build lightning-fast storefronts that convert. Handle flash sales, global traffic, and seamless checkout experiences.",
    href: "/solutions/ecommerce",
    icon: ShoppingCart,
    features: ["Sub-second page loads", "Global CDN delivery", "Headless commerce ready"],
    stat: "40%",
    statLabel: "Faster checkout",
  },
  {
    title: "SaaS",
    description: "Scale your application from zero to millions of users. Focus on building features while we handle infrastructure.",
    href: "/solutions/saas",
    icon: Layers,
    features: ["Auto-scaling infrastructure", "99.99% uptime SLA", "Built-in analytics"],
    stat: "99.99%",
    statLabel: "Uptime SLA",
  },
  {
    title: "Enterprise",
    description: "Enterprise-grade security, compliance, and support. Built for organizations with demanding requirements.",
    href: "/solutions/enterprise",
    icon: Building2,
    features: ["SOC2 Type II certified", "Dedicated support", "Custom SLAs"],
    stat: "SOC2",
    statLabel: "Certified",
  },
  {
    title: "Agencies",
    description: "Manage multiple client sites from one dashboard. Streamline deployments and collaborate with your team.",
    href: "/solutions/agencies",
    icon: Briefcase,
    features: ["Multi-site management", "White-label options", "Client billing integration"],
    stat: "100+",
    statLabel: "Sites per account",
  },
  {
    title: "Creators",
    description: "Build your online presence with beautiful, fast websites. Perfect for content creators and personal brands.",
    href: "/solutions/creators",
    icon: Heart,
    features: ["Beautiful templates", "Built-in analytics", "Social integrations"],
    stat: "60s",
    statLabel: "Setup time",
  },
  {
    title: "Education",
    description: "Build learning platforms that scale. Perfect for online courses, educational content, and student portals.",
    href: "/solutions/education",
    icon: GraduationCap,
    features: ["LMS integrations", "Video hosting", "Student analytics"],
    stat: "10M+",
    statLabel: "Students served",
  },
];

// Core capabilities
const capabilities = [
  {
    icon: Globe,
    title: "Global Edge Network",
    description: "Deploy to 150+ edge locations for sub-50ms latency worldwide.",
    stat: "150+",
    statLabel: "Locations",
    highlight: true,
  },
  {
    icon: Zap,
    title: "Instant Deployments",
    description: "Push to deploy in under 3 seconds with atomic rollbacks.",
    stat: "<3s",
    statLabel: "Deploy time",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "DDoS protection, WAF, and automatic SSL for every deployment.",
    stat: "SOC2",
    statLabel: "Certified",
  },
  {
    icon: Server,
    title: "Serverless Functions",
    description: "Run backend code at the edge with zero cold starts.",
    stat: "0ms",
    statLabel: "Cold starts",
  },
];

// Trust metrics
const trustItems = [
  { icon: Shield, label: 'SOC2 Type II', sublabel: 'Security certified' },
  { icon: Globe, label: '150+ Regions', sublabel: 'Global coverage' },
  { icon: Server, label: '99.99% Uptime', sublabel: 'SLA guaranteed' },
  { icon: Users, label: '50,000+ Devs', sublabel: 'Trust Ovmon' },
];

// Why choose us benefits
const whyChooseUs = [
  {
    icon: Zap,
    title: "Lightning Fast Performance",
    description: "Sub-50ms response times globally with our edge network and smart caching.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "SOC2 certified with DDoS protection, WAF, and automatic SSL included.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Deep insights into traffic, performance, and user behavior in real-time.",
  },
  {
    icon: Server,
    title: "Automatic Scaling",
    description: "Handle traffic spikes automatically without any configuration required.",
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    description: "Round-the-clock support from our team of deployment experts.",
  },
  {
    icon: Lock,
    title: "Compliance Ready",
    description: "GDPR, HIPAA, and PCI compliance features built into the platform.",
  },
];

// Testimonials
const solutionsTestimonials = [
  {
    quote: "Switching to Ovmon reduced our deployment time from 30 minutes to under 10 seconds. Our engineering team can now focus on building features instead of managing infrastructure.",
    author: {
      name: "Alex Thompson",
      title: "VP of Engineering",
      company: "ScaleUp Inc",
    },
    rating: 5,
    featured: true,
  },
  {
    quote: "The global edge network made a huge difference for our international customers. Page load times dropped by 60% in Asia Pacific.",
    author: {
      name: "Priya Sharma",
      title: "Head of Platform",
      company: "GlobalRetail",
    },
    rating: 5,
  },
  {
    quote: "Managing 50+ client sites from one dashboard changed how our agency operates. We saved 20 hours per week on deployments alone.",
    author: {
      name: "Jordan Lee",
      title: "Technical Director",
      company: "Digital Agency Co",
    },
    rating: 5,
  },
];

export default function SolutionsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: "Solutions" }}
        title="Built for every stage of"
        titleHighlight="growth"
        description="Whether you're a startup launching your first product or an enterprise serving millions, Ovmon scales with you."
        actions={[
          { label: "Start for free", href: "/auth/signup", variant: "primary" },
          { label: "Talk to sales", href: "/contact", variant: "outline" },
        ]}
        variant="centered"
        backgroundVariant="gradient"
      />

      {/* Industry Solutions */}
      <IndustryCards
        badge="By Industry"
        title="Solutions for every business"
        description="Purpose-built solutions designed for your specific industry needs."
        industries={industries}
        variant="cards"
      />

      {/* Trust Metrics */}
      <TrustMetrics
        items={trustItems}
        variant="badges"
        title="Trusted by leading companies worldwide"
      />

      {/* Core Capabilities */}
      <FeatureShowcase
        badge="Core Capabilities"
        title="Enterprise-grade infrastructure"
        description="The power and reliability your business demands."
        features={capabilities}
        variant="bento"
      />

      {/* Why Choose Us */}
      <section className="bg-secondary/20">
        <BenefitsGrid
          badge="Why Ovmon"
          title="Everything you need to succeed"
          description="Comprehensive tools and infrastructure to power your growth."
          benefits={whyChooseUs}
          variant="cards"
          columns={3}
        />
      </section>

      {/* Testimonials */}
      <TestimonialSection
        badge="Customer Stories"
        title="Trusted by industry leaders"
        description="See how companies are transforming their deployment workflow with Ovmon."
        testimonials={solutionsTestimonials}
        variant="featured"
      />

      {/* Final CTA */}
      <CTABand
        title="Ready to transform your deployment workflow?"
        description="Join 50,000+ developers who build and deploy with confidence."
        actions={[
          { label: "Start building for free", href: "/auth/signup", variant: "primary" },
          { label: "Watch demo", href: "/demo", variant: "outline" },
        ]}
        variant="centered"
      />
    </main>
  );
}
