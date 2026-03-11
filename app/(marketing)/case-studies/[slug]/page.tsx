import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ShoppingCart,
  Layers,
  Globe,
  Quote,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  Shield,
} from "lucide-react";

const caseStudiesData: Record<string, CaseStudy> = {
  techcorp: {
    company: "TechCorp",
    industry: "SaaS",
    logo: Layers,
    title: "How TechCorp reduced page load times by 60%",
    subtitle: "A journey from slow dashboards to lightning-fast user experiences",
    heroColor: "from-blue-500/20 via-blue-500/10 to-transparent",
    accentColor: "blue",
    overview: "TechCorp, a leading SaaS provider serving over 50,000 businesses worldwide, faced a critical challenge: their customer dashboard was becoming increasingly slow as they scaled. With page load times exceeding 5 seconds, customer satisfaction was declining and churn rates were rising.",
    challenge: "Their legacy infrastructure couldn't handle the growing complexity of their application. Server-side rendering was slow, caching was inconsistent, and deployments were risky and time-consuming. The engineering team spent more time firefighting than building new features.",
    solution: "By migrating to Ovmon, TechCorp leveraged edge computing, automatic caching, and instant deployments. The platform's smart CDN automatically optimized asset delivery, while incremental static regeneration ensured data freshness without sacrificing speed.",
    results: [
      { value: "60%", label: "Faster page loads", description: "Average load time dropped from 5.2s to 2.1s" },
      { value: "99.99%", label: "Uptime achieved", description: "Zero unplanned downtime in 12 months" },
      { value: "3s", label: "Deploy time", description: "Down from 15+ minutes per deployment" },
      { value: "40%", label: "Cost reduction", description: "Infrastructure costs significantly reduced" },
    ],
    quote: {
      text: "Ovmon transformed how we think about performance. Our customers notice the difference, and our engineering team can finally focus on building features instead of managing infrastructure.",
      author: "Sarah Chen",
      role: "VP of Engineering, TechCorp",
    },
    timeline: [
      { phase: "Discovery", duration: "1 week", description: "Initial assessment and migration planning" },
      { phase: "Migration", duration: "2 weeks", description: "Gradual migration with zero downtime" },
      { phase: "Optimization", duration: "1 week", description: "Fine-tuning caching and edge functions" },
      { phase: "Launch", duration: "1 day", description: "Full cutover to Ovmon platform" },
    ],
    features: [
      "Edge Functions for API routes",
      "Automatic image optimization",
      "Smart caching with ISR",
      "Real-time analytics",
      "Preview deployments",
      "Automatic HTTPS",
    ],
  },
  shopnow: {
    company: "ShopNow",
    industry: "E-commerce",
    logo: ShoppingCart,
    title: "ShopNow handles 10x Black Friday traffic",
    subtitle: "Scaling confidently for the biggest shopping day of the year",
    heroColor: "from-orange-500/20 via-orange-500/10 to-transparent",
    accentColor: "orange",
    overview: "ShopNow is a fast-growing e-commerce platform with millions of monthly visitors. As their business grew, so did their anxiety around peak shopping events. Previous Black Fridays had been marred by slow pages and even outages during critical moments.",
    challenge: "Their existing infrastructure required manual scaling, which was expensive and unreliable. Engineers had to estimate traffic weeks in advance, often over-provisioning to avoid outages. Despite this, the site still struggled during traffic spikes.",
    solution: "Ovmon's automatic scaling and edge network eliminated the guesswork. The platform handles traffic spikes automatically, serving content from the edge location nearest to each customer. Combined with real-time analytics, ShopNow could monitor and optimize in real-time.",
    results: [
      { value: "10x", label: "Traffic handled", description: "Peak Black Friday traffic managed seamlessly" },
      { value: "45%", label: "Revenue increase", description: "Year-over-year Black Friday sales growth" },
      { value: "100%", label: "Zero downtime", description: "Perfect uptime during peak hours" },
      { value: "200ms", label: "Avg response", description: "Sub-second responses globally" },
    ],
    quote: {
      text: "For the first time ever, our team actually enjoyed Black Friday. We watched traffic climb to 10x our normal levels while the site stayed fast and stable. That's priceless peace of mind.",
      author: "Marcus Johnson",
      role: "CTO, ShopNow",
    },
    timeline: [
      { phase: "Planning", duration: "2 weeks", description: "Architecture review and optimization strategy" },
      { phase: "Preparation", duration: "3 weeks", description: "Migration and load testing" },
      { phase: "Dry Run", duration: "1 week", description: "Simulated Black Friday testing" },
      { phase: "Success", duration: "1 day", description: "Flawless Black Friday execution" },
    ],
    features: [
      "Automatic scaling",
      "Global edge network",
      "Real-time analytics",
      "A/B testing built-in",
      "Cart optimization",
      "DDoS protection",
    ],
  },
  globalbank: {
    company: "GlobalBank",
    industry: "Enterprise",
    logo: Building2,
    title: "GlobalBank achieves SOC2 compliance",
    subtitle: "Meeting enterprise security requirements without sacrificing speed",
    heroColor: "from-purple-500/20 via-purple-500/10 to-transparent",
    accentColor: "purple",
    overview: "GlobalBank serves millions of customers across 30 countries. Their digital transformation initiative required modernizing their customer portal while maintaining strict compliance with financial regulations and security standards.",
    challenge: "The bank needed a platform that could meet SOC2 Type II, GDPR, and PCI DSS requirements while still providing a modern development experience. Their compliance team had vetoed previous modernization attempts due to security concerns.",
    solution: "Ovmon's enterprise features, including SOC2 compliance, SSO integration, audit logs, and custom security policies, satisfied even the most stringent requirements. The platform's security-first architecture meant compliance was built-in, not bolted on.",
    results: [
      { value: "SOC2", label: "Compliance", description: "Full Type II certification achieved" },
      { value: "100%", label: "Audits passed", description: "All security audits passed on first attempt" },
      { value: "40%", label: "Cost savings", description: "Reduced infrastructure and compliance costs" },
      { value: "6 mo", label: "Time to market", description: "Launched new portal in record time" },
    ],
    quote: {
      text: "When our compliance team approved Ovmon, we knew we had found the right partner. We got the modern developer experience we wanted without any security compromises. That's rare in enterprise.",
      author: "Dr. Elena Rodriguez",
      role: "Chief Digital Officer, GlobalBank",
    },
    timeline: [
      { phase: "Security Review", duration: "4 weeks", description: "Comprehensive security assessment" },
      { phase: "Compliance", duration: "6 weeks", description: "SOC2 and regulatory documentation" },
      { phase: "Development", duration: "12 weeks", description: "Portal development with security reviews" },
      { phase: "Launch", duration: "2 weeks", description: "Phased rollout to all regions" },
    ],
    features: [
      "SOC2 Type II compliant",
      "SSO/SAML integration",
      "Audit logging",
      "Role-based access",
      "Data residency options",
      "DDoS protection",
    ],
  },
  travelhub: {
    company: "TravelHub",
    industry: "Travel",
    logo: Globe,
    title: "TravelHub expands to 40 countries",
    subtitle: "Delivering fast experiences to travelers worldwide",
    heroColor: "from-cyan-500/20 via-cyan-500/10 to-transparent",
    accentColor: "cyan",
    overview: "TravelHub is an online travel agency that helps millions of travelers find and book their perfect trips. As they expanded internationally, they needed to ensure fast, reliable experiences for users regardless of their location.",
    challenge: "Users in Asia and Europe were experiencing slow load times due to their US-based servers. Localization added complexity, and maintaining consistent performance across 40+ countries seemed impossible with their existing setup.",
    solution: "Ovmon's global edge network, with points of presence in over 100 locations, brought content closer to users worldwide. Combined with automatic localization handling and smart routing, TravelHub could deliver consistent sub-second experiences globally.",
    results: [
      { value: "40+", label: "Countries served", description: "Expanded from 5 to 40+ countries" },
      { value: "70%", label: "Latency reduction", description: "Global average latency dropped significantly" },
      { value: "25%", label: "Bounce rate down", description: "Users stay longer on faster pages" },
      { value: "35%", label: "Booking increase", description: "More conversions from international users" },
    ],
    quote: {
      text: "Our users in Tokyo now have the same fast experience as users in New York. Ovmon's edge network made our global expansion possible without the complexity of managing infrastructure in every region.",
      author: "James Park",
      role: "Head of Engineering, TravelHub",
    },
    timeline: [
      { phase: "Assessment", duration: "2 weeks", description: "Performance audit across regions" },
      { phase: "Migration", duration: "4 weeks", description: "Phased rollout by region" },
      { phase: "Localization", duration: "2 weeks", description: "i18n optimization and testing" },
      { phase: "Global Launch", duration: "1 week", description: "Full global availability" },
    ],
    features: [
      "100+ edge locations",
      "Automatic geo-routing",
      "i18n optimization",
      "Image CDN",
      "Real-time monitoring",
      "Multi-region failover",
    ],
  },
};

interface CaseStudy {
  company: string;
  industry: string;
  logo: React.ElementType;
  title: string;
  subtitle: string;
  heroColor: string;
  accentColor: string;
  overview: string;
  challenge: string;
  solution: string;
  results: Array<{ value: string; label: string; description: string }>;
  quote: { text: string; author: string; role: string };
  timeline: Array<{ phase: string; duration: string; description: string }>;
  features: string[];
}

export async function generateStaticParams() {
  return Object.keys(caseStudiesData).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudiesData[slug];
  if (!study) return { title: "Case Study Not Found" };

  return {
    title: `${study.company} Case Study - Ovmon`,
    description: study.subtitle,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudiesData[slug];

  if (!study) {
    notFound();
  }

  const slugs = Object.keys(caseStudiesData);
  const currentIndex = slugs.indexOf(slug);
  const nextSlug = slugs[(currentIndex + 1) % slugs.length];
  const nextStudy = caseStudiesData[nextSlug];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b ${study.heroColor}`}>
        <div className="container relative">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to case studies
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center">
              <study.logo className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{study.company}</h2>
              <Badge variant="outline" className="border-accent/50 text-accent">
                {study.industry}
              </Badge>
            </div>
          </div>

          <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 max-w-4xl text-balance">
            {study.title}
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            {study.subtitle}
          </p>
        </div>
      </section>

      {/* Results Highlight */}
      <section className="py-12 border-b border-border/50 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {study.results.map((result) => (
              <div key={result.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-accent mb-1">{result.value}</p>
                <p className="font-medium text-foreground mb-1">{result.label}</p>
                <p className="text-xs text-foreground/60">{result.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Story */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Overview</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed">
                  {study.overview}
                </p>
              </div>

              {/* Challenge */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">The Challenge</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed">
                  {study.challenge}
                </p>
              </div>

              {/* Solution */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">The Solution</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed">
                  {study.solution}
                </p>
              </div>

              {/* Quote */}
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-6 lg:p-8">
                  <Quote className="w-10 h-10 text-accent/40 mb-4" />
                  <blockquote className="text-lg text-foreground italic mb-4 leading-relaxed">
                    &ldquo;{study.quote.text}&rdquo;
                  </blockquote>
                  <div>
                    <p className="font-semibold text-foreground">{study.quote.author}</p>
                    <p className="text-sm text-foreground/60">{study.quote.role}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Implementation Timeline</h3>
                </div>
                <div className="space-y-4">
                  {study.timeline.map((item, index) => (
                    <div key={item.phase} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
                          {index + 1}
                        </div>
                        {index < study.timeline.length - 1 && (
                          <div className="w-px h-full bg-border/50 my-2" />
                        )}
                      </div>
                      <div className="pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{item.phase}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {item.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/60">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Features Used */}
              <Card className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Features Used</h4>
                  <ul className="space-y-3">
                    {study.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-foreground/70">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    Ready to achieve similar results?
                  </h4>
                  <p className="text-sm text-foreground/60 mb-4">
                    Start building with Ovmon today and see the difference.
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full" asChild>
                      <Link href="/auth/signup">Start for free</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact">Talk to sales</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Next Case Study */}
      <section className="py-16 border-t border-border/50 bg-secondary/20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-foreground/60 mb-2">Next case study</p>
            <Link href={`/case-studies/${nextSlug}`} className="group">
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-accent transition-colors">
                {nextStudy.title}
              </h3>
              <div className="flex items-center justify-center gap-2 text-accent font-medium">
                Read {nextStudy.company}&apos;s story
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
