import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Building2,
  ShoppingCart,
  Layers,
  Briefcase,
  Globe,
  Zap,
  Lock,
  Server,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solutions - Ovmon",
  description: "Discover how Ovmon helps businesses of all sizes build, deploy, and scale their web presence.",
};

const industries = [
  {
    title: "E-commerce",
    description: "Build lightning-fast storefronts that convert. Handle flash sales, global traffic, and seamless checkout experiences.",
    href: "/solutions/ecommerce",
    icon: ShoppingCart,
    features: ["Sub-second page loads", "Global CDN delivery", "Headless commerce ready"],
    color: "from-orange-500/20 to-orange-500/5",
  },
  {
    title: "SaaS",
    description: "Scale your application from zero to millions of users. Focus on building features while we handle infrastructure.",
    href: "/solutions/saas",
    icon: Layers,
    features: ["Auto-scaling infrastructure", "99.99% uptime SLA", "Built-in analytics"],
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    title: "Enterprise",
    description: "Enterprise-grade security, compliance, and support. Built for organizations with demanding requirements.",
    href: "/solutions/enterprise",
    icon: Building2,
    features: ["SOC2 Type II certified", "Dedicated support", "Custom SLAs"],
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    title: "Agencies",
    description: "Manage multiple client sites from one dashboard. Streamline deployments and collaborate with your team.",
    href: "/solutions/agencies",
    icon: Briefcase,
    features: ["Multi-site management", "White-label options", "Client billing integration"],
    color: "from-green-500/20 to-green-500/5",
  },
];

const capabilities = [
  {
    icon: Globe,
    title: "Global Edge Network",
    description: "Deploy to 150+ edge locations for sub-50ms latency worldwide.",
  },
  {
    icon: Zap,
    title: "Instant Deployments",
    description: "Push to deploy in under 3 seconds with atomic rollbacks.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "DDoS protection, WAF, and automatic SSL for every deployment.",
  },
  {
    icon: Server,
    title: "Serverless Functions",
    description: "Run backend code at the edge with zero cold starts.",
  },
];

export default function SolutionsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              Solutions
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Built for every stage of growth
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re a startup launching your first product or an enterprise serving millions, 
              Ovmon scales with you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Solutions by industry
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Purpose-built solutions designed for your specific industry needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {industries.map((industry) => (
              <Link key={industry.href} href={industry.href} className="group">
                <Card className="h-full bg-card/60 border-border/50 hover:border-accent/40 transition-all hover:shadow-lg">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-5`}>
                      <industry.icon className="w-7 h-7 text-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {industry.title}
                    </h3>
                    <p className="text-foreground/60 mb-5 leading-relaxed">
                      {industry.description}
                    </p>
                    <ul className="space-y-2">
                      {industry.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-foreground/70">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 mt-6 text-accent text-sm font-medium">
                      Learn more
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Core capabilities
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Enterprise-grade infrastructure that powers your success.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability) => (
              <Card key={capability.title} className="bg-card/40 border-border/40">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <capability.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {capability.title}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {capability.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-foreground/60 mb-8">
              Join 50,000+ developers who build and deploy with Ovmon.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start building for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/demo">Watch demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
