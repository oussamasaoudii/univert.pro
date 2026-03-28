import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Globe,
  Layers,
  Server,
  Newspaper,
  Store,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Use Cases - Ovmon",
  description: "Explore how teams use Ovmon to build marketing sites, web applications, APIs, and more.",
  robots: { index: false, follow: false },
};

const useCases = [
  {
    title: "Marketing Sites",
    description: "Fast, SEO-optimized marketing websites that convert visitors into customers. Perfect for landing pages, campaign sites, and corporate websites.",
    href: "/use-cases/marketing",
    icon: Newspaper,
    examples: ["Landing pages", "Campaign sites", "Corporate websites", "Product pages"],
    color: "from-pink-500/20 to-pink-500/5",
  },
  {
    title: "Web Applications",
    description: "Full-stack web applications with instant deployments, preview URLs, and auto-scaling. From dashboards to complex SaaS products.",
    href: "/use-cases/web-apps",
    icon: Layers,
    examples: ["SaaS dashboards", "Internal tools", "Customer portals", "Admin panels"],
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    title: "API & Backends",
    description: "Serverless APIs that scale automatically. Edge functions for low-latency responses worldwide. No servers to manage.",
    href: "/use-cases/api",
    icon: Server,
    examples: ["REST APIs", "GraphQL", "Webhooks", "Edge functions"],
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    title: "E-commerce",
    description: "Lightning-fast storefronts with headless commerce integration. Handle flash sales and global traffic with ease.",
    href: "/solutions/ecommerce",
    icon: Store,
    examples: ["Storefronts", "Product catalogs", "Checkout flows", "Inventory systems"],
    color: "from-orange-500/20 to-orange-500/5",
  },
  {
    title: "Documentation",
    description: "Technical documentation sites with fast search, versioning, and beautiful design. Built for developers.",
    href: "/use-cases/docs",
    icon: BookOpen,
    examples: ["API docs", "Product guides", "Knowledge bases", "Developer portals"],
    color: "from-green-500/20 to-green-500/5",
  },
  {
    title: "Multi-region Apps",
    description: "Deploy your application to multiple regions for low latency worldwide. Automatic failover and load balancing included.",
    href: "/use-cases/multi-region",
    icon: Globe,
    examples: ["Global apps", "Multi-tenant SaaS", "CDN-backed sites", "Regional compliance"],
    color: "from-cyan-500/20 to-cyan-500/5",
  },
];

export default function UseCasesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              Use Cases
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Build anything on Ovmon
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              From marketing sites to complex web applications, see how teams use Ovmon 
              to ship faster and scale effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start building
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/demos">View templates</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <Link key={useCase.href} href={useCase.href} className="group">
                <Card className="h-full bg-card/60 border-border/50 hover:border-accent/40 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4`}>
                      <useCase.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4 leading-relaxed">
                      {useCase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.examples.map((example) => (
                        <span
                          key={example}
                          className="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground/70"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-accent text-sm font-medium">
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

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-foreground/60 mb-8">
              Join 50,000+ developers building on Ovmon today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/contact">Talk to an expert</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
