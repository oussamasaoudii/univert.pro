import { Metadata } from "next";
import {
  HeroSection,
  IndustryCards,
  FeatureShowcase,
  TrustMetrics,
  TestimonialSection,
  CTABand,
  BenefitsGrid,
  LogoCloud,
  FAQSection,
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
    iconName: "ShoppingCart" as const,
    features: ["Sub-second page loads", "Global CDN delivery", "Headless commerce ready"],
    stat: "40%",
    statLabel: "Faster checkout",
  },
  {
    title: "SaaS",
    description: "Scale your application from zero to millions of users. Focus on building features while we handle infrastructure.",
    href: "/solutions/saas",
    iconName: "Layers" as const,
    features: ["Auto-scaling infrastructure", "99.99% uptime SLA", "Built-in analytics"],
    stat: "99.99%",
    statLabel: "Uptime SLA",
  },
  {
    title: "Enterprise",
    description: "Enterprise-grade security, compliance, and support. Built for organizations with demanding requirements.",
    href: "/solutions/enterprise",
    iconName: "Building2" as const,
    features: ["SOC2 Type II certified", "Dedicated support", "Custom SLAs"],
    stat: "SOC2",
    statLabel: "Certified",
  },
  {
    title: "Agencies",
    description: "Manage multiple client sites from one dashboard. Streamline deployments and collaborate with your team.",
    href: "/solutions/agencies",
    iconName: "Briefcase" as const,
    features: ["Multi-site management", "White-label options", "Client billing integration"],
    stat: "100+",
    statLabel: "Sites per account",
  },
  {
    title: "Creators",
    description: "Build your online presence with beautiful, fast websites. Perfect for content creators and personal brands.",
    href: "/solutions/creators",
    iconName: "Heart" as const,
    features: ["Beautiful templates", "Built-in analytics", "Social integrations"],
    stat: "60s",
    statLabel: "Setup time",
  },
  {
    title: "Education",
    description: "Build learning platforms that scale. Perfect for online courses, educational content, and student portals.",
    href: "/solutions/education",
    iconName: "GraduationCap" as const,
    features: ["LMS integrations", "Video hosting", "Student analytics"],
    stat: "10M+",
    statLabel: "Students served",
  },
];

// Core capabilities
const capabilities = [
  {
    iconName: "Globe" as const,
    title: "Global Edge Network",
    description: "Deploy to 150+ edge locations for sub-50ms latency worldwide.",
    stat: "150+",
    statLabel: "Locations",
    highlight: true,
  },
  {
    iconName: "Zap" as const,
    title: "Instant Deployments",
    description: "Push to deploy in under 3 seconds with atomic rollbacks.",
    stat: "<3s",
    statLabel: "Deploy time",
  },
  {
    iconName: "Lock" as const,
    title: "Enterprise Security",
    description: "DDoS protection, WAF, and automatic SSL for every deployment.",
    stat: "SOC2",
    statLabel: "Certified",
  },
  {
    iconName: "Server" as const,
    title: "Serverless Functions",
    description: "Run backend code at the edge with zero cold starts.",
    stat: "0ms",
    statLabel: "Cold starts",
  },
];

// Trust metrics
const trustItems = [
  { iconName: "Shield" as const, label: 'SOC2 Type II', sublabel: 'Security certified' },
  { iconName: "Globe" as const, label: '150+ Regions', sublabel: 'Global coverage' },
  { iconName: "Server" as const, label: '99.99% Uptime', sublabel: 'SLA guaranteed' },
  { iconName: "Users" as const, label: '50,000+ Devs', sublabel: 'Trust Ovmon' },
];

// Why choose us benefits
const whyChooseUs = [
  {
    iconName: "Zap" as const,
    title: "Lightning Fast Performance",
    description: "Sub-50ms response times globally with our edge network and smart caching.",
  },
  {
    iconName: "Shield" as const,
    title: "Enterprise-Grade Security",
    description: "SOC2 certified with DDoS protection, WAF, and automatic SSL included.",
  },
  {
    iconName: "BarChart3" as const,
    title: "Real-Time Analytics",
    description: "Deep insights into traffic, performance, and user behavior in real-time.",
  },
  {
    iconName: "Server" as const,
    title: "Automatic Scaling",
    description: "Handle traffic spikes automatically without any configuration required.",
  },
  {
    iconName: "Headphones" as const,
    title: "24/7 Expert Support",
    description: "Round-the-clock support from our team of deployment experts.",
  },
  {
    iconName: "Lock" as const,
    title: "Compliance Ready",
    description: "GDPR, HIPAA, and PCI compliance features built into the platform.",
  },
];

// Customer logos
const customerLogos = [
  { name: "TechCorp" },
  { name: "ScaleUp" },
  { name: "DataFlow" },
  { name: "CloudBase" },
  { name: "NextGen" },
  { name: "Innovate" },
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

// FAQ items
const solutionsFAQs = [
  {
    question: "Which solution is right for my business?",
    answer: "The best solution depends on your specific needs. E-commerce businesses benefit from our optimized checkout and CDN. SaaS companies love our auto-scaling. Enterprises need our compliance and dedicated support. Agencies appreciate multi-site management. Contact our sales team for a personalized recommendation.",
  },
  {
    question: "Can I switch between plans as my business grows?",
    answer: "Absolutely! Ovmon is designed to scale with you. You can upgrade or change your plan at any time. Your data, configurations, and deployments seamlessly transfer between plans with zero downtime.",
  },
  {
    question: "What kind of support is included?",
    answer: "All plans include access to our documentation, community forums, and email support. Pro plans add priority support with faster response times. Enterprise plans include dedicated support engineers, custom SLAs, and 24/7 phone support.",
  },
  {
    question: "How does Ovmon handle traffic spikes?",
    answer: "Our infrastructure automatically scales to handle traffic spikes without any configuration needed. Whether you're featured on Product Hunt or running a Super Bowl ad, Ovmon scales instantly to meet demand and scales back down to save costs when traffic normalizes.",
  },
  {
    question: "Is Ovmon compliant with industry regulations?",
    answer: "Yes. Ovmon is SOC2 Type II certified and offers GDPR, HIPAA, and PCI compliance features. Enterprise customers can also request custom compliance configurations and dedicated security reviews.",
  },
  {
    question: "Can I try Ovmon before committing?",
    answer: "Yes! We offer a generous free tier that lets you deploy and test real projects. You can upgrade to a paid plan whenever you need more resources, bandwidth, or advanced features.",
  },
];

export default function SolutionsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: "Solutions", iconName: "Sparkles" }}
        title="Built for every stage of"
        titleHighlight="growth"
        description="Whether you're a startup launching your first product or an enterprise serving millions, Ovmon scales with you. Join 50,000+ developers who trust us with their most critical applications."
        actions={[
          { label: "Start for free", href: "/auth/signup", variant: "primary" },
          { label: "Talk to sales", href: "/contact", variant: "outline" },
        ]}
        variant="centered"
        backgroundVariant="gradient"
        socialProof={{
          text: "Trusted by 50,000+ developers worldwide",
          rating: 4.9,
          count: 2500,
        }}
      />

      {/* Customer Logos */}
      <LogoCloud
        title="Trusted by innovative companies"
        logos={customerLogos}
        variant="minimal"
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

      {/* FAQ Section */}
      <FAQSection
        badge="FAQ"
        title="Frequently asked questions"
        description="Everything you need to know about our solutions and how they can help your business."
        faqs={solutionsFAQs}
        variant="default"
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
