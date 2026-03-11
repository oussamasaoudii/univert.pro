import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Building2,
  ShoppingCart,
  Layers,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies - Ovmon",
  description: "See how leading companies use Ovmon to build faster, scale bigger, and deliver exceptional web experiences.",
};

const caseStudies = [
  {
    company: "TechCorp",
    industry: "SaaS",
    logo: Layers,
    title: "How TechCorp reduced page load times by 60%",
    description: "TechCorp migrated their dashboard to Ovmon and saw immediate performance improvements across the board.",
    metrics: [
      { label: "Faster load times", value: "60%" },
      { label: "Uptime", value: "99.99%" },
      { label: "Deploy time", value: "3s" },
    ],
    href: "/case-studies/techcorp",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    company: "ShopNow",
    industry: "E-commerce",
    logo: ShoppingCart,
    title: "ShopNow handles 10x Black Friday traffic",
    description: "With Ovmon's auto-scaling, ShopNow handled their biggest sale ever without any performance issues.",
    metrics: [
      { label: "Traffic handled", value: "10x" },
      { label: "Revenue increase", value: "45%" },
      { label: "Zero downtime", value: "100%" },
    ],
    href: "/case-studies/shopnow",
    color: "from-orange-500/20 to-orange-500/5",
  },
  {
    company: "GlobalBank",
    industry: "Enterprise",
    logo: Building2,
    title: "GlobalBank achieves SOC2 compliance",
    description: "GlobalBank moved their customer portal to Ovmon, meeting strict security and compliance requirements.",
    metrics: [
      { label: "Compliance", value: "SOC2" },
      { label: "Security audits", value: "Passed" },
      { label: "Cost savings", value: "40%" },
    ],
    href: "/case-studies/globalbank",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    company: "TravelHub",
    industry: "Travel",
    logo: Globe,
    title: "TravelHub expands to 40 countries",
    description: "TravelHub uses Ovmon's edge network to deliver fast experiences to travelers worldwide.",
    metrics: [
      { label: "Countries served", value: "40+" },
      { label: "Latency reduction", value: "70%" },
      { label: "Bounce rate down", value: "25%" },
    ],
    href: "/case-studies/travelhub",
    color: "from-cyan-500/20 to-cyan-500/5",
  },
];

const highlights = [
  { icon: TrendingUp, value: "3x", label: "Average performance improvement" },
  { icon: Clock, value: "80%", label: "Faster deployment cycles" },
  { icon: Zap, value: "99.99%", label: "Average uptime across customers" },
];

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              Case Studies
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Customer success stories
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              See how leading companies use Ovmon to build faster, scale bigger, and deliver 
              exceptional web experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 border-y border-border/50 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <highlight.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{highlight.value}</p>
                  <p className="text-sm text-foreground/60">{highlight.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6">
            {caseStudies.map((study) => (
              <Link key={study.href} href={study.href} className="group">
                <Card className="h-full bg-card/60 border-border/50 hover:border-accent/40 transition-all hover:shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${study.color} p-6`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center">
                          <study.logo className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{study.company}</p>
                          <p className="text-xs text-foreground/60">{study.industry}</p>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {study.title}
                      </h3>
                      <p className="text-sm text-foreground/70">
                        {study.description}
                      </p>
                    </div>
                    <div className="p-6 border-t border-border/50">
                      <div className="grid grid-cols-3 gap-4">
                        {study.metrics.map((metric) => (
                          <div key={metric.label}>
                            <p className="text-lg font-bold text-accent">{metric.value}</p>
                            <p className="text-xs text-foreground/60">{metric.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-accent text-sm font-medium">
                        Read case study
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to write your success story?
            </h2>
            <p className="text-foreground/60 mb-8">
              Join thousands of companies who build and deploy with Ovmon.
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
    </main>
  );
}
