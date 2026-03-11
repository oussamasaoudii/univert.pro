import { Metadata } from "next";
import {
  ShoppingCart,
  Layers,
  Building2,
  Briefcase,
  Globe,
  Zap,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  HeroSection,
  TrustMetrics,
  LogoCloud,
  CTABand,
} from "@/components/marketing/sections";
import { CustomerCaseStudies } from "./customer-case-studies";
import { CustomerStats } from "./customer-stats";
import { CustomerQuotes } from "./customer-quotes";

export const metadata: Metadata = {
  title: "Customer Stories - Ovmon",
  description: "See how leading companies use Ovmon to build, deploy, and scale their web applications.",
};

// Featured case studies
const caseStudies = [
  {
    company: "TechFlow",
    industry: "SaaS",
    logo: "/logos/techflow.svg",
    icon: Layers,
    title: "How TechFlow reduced deployment time by 95%",
    description: "TechFlow migrated from a complex CI/CD pipeline to Ovmon and transformed their development workflow.",
    quote: "Ovmon transformed our deployment workflow. What used to take hours now takes seconds.",
    author: {
      name: "Sarah Chen",
      title: "CTO",
    },
    stats: [
      { value: "95%", label: "Faster deploys" },
      { value: "99.99%", label: "Uptime achieved" },
      { value: "3x", label: "Developer velocity" },
    ],
    href: "/customers/techflow",
    featured: true,
  },
  {
    company: "GlobalRetail",
    industry: "E-commerce",
    logo: "/logos/globalretail.svg",
    icon: ShoppingCart,
    title: "GlobalRetail scales to handle Black Friday traffic",
    description: "How the leading e-commerce platform serves millions of customers worldwide without breaking a sweat.",
    quote: "The global edge network made a huge difference. Load times dropped by 60% in Asia Pacific.",
    author: {
      name: "Priya Sharma",
      title: "Head of Platform",
    },
    stats: [
      { value: "60%", label: "Faster page loads" },
      { value: "10M+", label: "Users served" },
      { value: "$2M", label: "Infrastructure savings" },
    ],
    href: "/customers/globalretail",
    featured: true,
  },
  {
    company: "FinanceHub",
    industry: "Enterprise",
    logo: "/logos/financehub.svg",
    icon: Building2,
    title: "FinanceHub achieves SOC2 compliance with ease",
    description: "Enterprise-grade security and compliance features that met their stringent requirements.",
    quote: "The security features and compliance certifications gave us confidence to move forward.",
    author: {
      name: "Michael Torres",
      title: "VP of Engineering",
    },
    stats: [
      { value: "SOC2", label: "Compliant" },
      { value: "100%", label: "Audit passed" },
      { value: "50%", label: "Less overhead" },
    ],
    href: "/customers/financehub",
  },
  {
    company: "Digital Agency Co",
    industry: "Agencies",
    logo: "/logos/digitalagency.svg",
    icon: Briefcase,
    title: "Managing 50+ client sites from one dashboard",
    description: "How a leading digital agency streamlined their operations with Ovmon's multi-site management.",
    quote: "We saved 20 hours per week on deployments alone. It changed how our agency operates.",
    author: {
      name: "Jordan Lee",
      title: "Technical Director",
    },
    stats: [
      { value: "50+", label: "Sites managed" },
      { value: "20hrs", label: "Saved weekly" },
      { value: "5x", label: "Client onboarding" },
    ],
    href: "/customers/digitalagency",
  },
];

// Customer logos for logo cloud
const customerLogos = [
  { name: "TechFlow", logo: "/logos/techflow.svg" },
  { name: "GlobalRetail", logo: "/logos/globalretail.svg" },
  { name: "FinanceHub", logo: "/logos/financehub.svg" },
  { name: "Digital Agency Co", logo: "/logos/digitalagency.svg" },
  { name: "StartupXYZ", logo: "/logos/startupxyz.svg" },
  { name: "MegaCorp", logo: "/logos/megacorp.svg" },
];

// Trust metrics
const trustItems = [
  { icon: Users, label: '50,000+', sublabel: 'Active developers' },
  { icon: Globe, label: '150+ Regions', sublabel: 'Global coverage' },
  { icon: TrendingUp, label: '2B+', sublabel: 'Requests monthly' },
  { icon: Clock, label: '99.99%', sublabel: 'Uptime SLA' },
];

// Overall customer stats
const overallStats = [
  { value: "50,000+", label: "Developers trust Ovmon", icon: Users },
  { value: "95%", label: "Customer satisfaction", icon: TrendingUp },
  { value: "60%", label: "Average performance gain", icon: Zap },
  { value: "$1M+", label: "Average annual savings", icon: Globe },
];

// Customer quotes for testimonial carousel
const customerQuotes = [
  {
    quote: "The developer experience is unmatched. Our team productivity increased dramatically since switching to Ovmon.",
    author: { name: "Alex Thompson", title: "VP of Engineering", company: "ScaleUp Inc" },
    rating: 5,
  },
  {
    quote: "We went from 30-minute deployments to under 10 seconds. It completely transformed our release cycle.",
    author: { name: "Emma Wilson", title: "Frontend Lead", company: "StartupXYZ" },
    rating: 5,
  },
  {
    quote: "The preview deployments for pull requests changed how our team collaborates. Game changer.",
    author: { name: "David Kim", title: "Engineering Manager", company: "TechCorp" },
    rating: 5,
  },
  {
    quote: "Enterprise security without the enterprise complexity. Exactly what we needed.",
    author: { name: "Lisa Chang", title: "Security Lead", company: "SecureApps" },
    rating: 5,
  },
];

export default function CustomersPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: "Customer Stories" }}
        title="Trusted by teams"
        titleHighlight="worldwide"
        description="See how leading companies use Ovmon to build, deploy, and scale their web applications with confidence."
        actions={[
          { label: "Read case studies", href: "#case-studies", variant: "primary" },
          { label: "Start building", href: "/auth/signup", variant: "outline" },
        ]}
        variant="centered"
        backgroundVariant="gradient"
      />

      {/* Trust Metrics */}
      <TrustMetrics
        items={trustItems}
        variant="badges"
        title="Platform-wide impact"
      />

      {/* Overall Stats */}
      <CustomerStats stats={overallStats} />

      {/* Case Studies */}
      <CustomerCaseStudies caseStudies={caseStudies} />

      {/* Customer Quotes */}
      <CustomerQuotes quotes={customerQuotes} />

      {/* Logo Cloud */}
      <LogoCloud
        title="Join industry leaders using Ovmon"
        logos={customerLogos}
      />

      {/* Final CTA */}
      <CTABand
        title="Ready to write your success story?"
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
