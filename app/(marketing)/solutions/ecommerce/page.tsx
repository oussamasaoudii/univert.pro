import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ShoppingCart,
  Zap,
  Globe,
  Shield,
  BarChart3,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "E-commerce Solutions - Ovmon",
  description: "Build lightning-fast storefronts that convert. Handle flash sales, global traffic, and seamless checkout experiences.",
};

const features = [
  {
    icon: Zap,
    title: "Sub-second page loads",
    description: "Achieve Core Web Vitals scores that boost SEO and conversions. Every millisecond matters in e-commerce.",
  },
  {
    icon: Globe,
    title: "Global delivery",
    description: "Serve customers worldwide with our 150+ edge locations. No matter where they shop, it feels local.",
  },
  {
    icon: Shield,
    title: "PCI compliant",
    description: "Built-in security for payment processing. DDoS protection and WAF included at no extra cost.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description: "Monitor traffic, conversions, and performance metrics. Make data-driven decisions instantly.",
  },
  {
    icon: Package,
    title: "Headless commerce",
    description: "Integrate with Shopify, BigCommerce, Medusa, or any headless CMS. Your stack, our infrastructure.",
  },
  {
    icon: Truck,
    title: "Flash sale ready",
    description: "Auto-scaling handles traffic spikes during promotions. Never miss a sale due to downtime.",
  },
];

const metrics = [
  { value: "50%", label: "Faster load times vs traditional hosting" },
  { value: "3x", label: "Increase in conversion rates" },
  { value: "99.99%", label: "Uptime during peak traffic" },
  { value: "150+", label: "Edge locations worldwide" },
];

const integrations = [
  "Shopify", "BigCommerce", "Medusa", "Saleor", "Stripe", "PayPal", "Klaviyo", "Algolia"
];

export default function EcommerceSolutionPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/solutions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowRight className="w-4 h-4 rotate-180" />
              All solutions
            </Link>
            <Badge variant="outline" className="mb-6 border-orange-500/50 text-orange-500">
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              E-commerce
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Storefronts that sell
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Build lightning-fast e-commerce experiences that convert. Handle flash sales, 
              global traffic, and seamless checkout without breaking a sweat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/case-studies">View case studies</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-12 border-y border-border/50 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-accent mb-2">{metric.value}</p>
                <p className="text-sm text-foreground/60">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything you need to sell online
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Purpose-built infrastructure for high-performance e-commerce.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Works with your stack
            </h2>
            <p className="text-foreground/60">
              Seamless integrations with leading e-commerce platforms and tools.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
            {integrations.map((integration) => (
              <div
                key={integration}
                className="px-5 py-2.5 rounded-lg bg-card border border-border/50 text-sm font-medium text-foreground/80"
              >
                {integration}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
              Built for e-commerce success
            </h2>
            <div className="space-y-4">
              {[
                "Handle 10x traffic spikes during Black Friday without slowdowns",
                "Serve personalized content to customers in 150+ countries",
                "A/B test checkout flows with instant deployments",
                "Integrate any headless CMS or commerce platform",
                "Automatic image optimization and lazy loading",
                "Real-time inventory sync across all channels",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-lg bg-card/40 border border-border/40">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="container">
          <Card className="max-w-3xl mx-auto bg-card/80 border-border/50">
            <CardContent className="p-8 lg:p-12 text-center">
              <CreditCard className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to boost your conversions?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Join leading e-commerce brands who trust Ovmon for their mission-critical storefronts.
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
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
