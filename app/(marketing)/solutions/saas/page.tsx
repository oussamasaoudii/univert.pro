import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Layers,
  Zap,
  Globe,
  Shield,
  BarChart3,
  Database,
  Users,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SaaS Solutions - Ovmon",
  description: "Scale your SaaS application from zero to millions of users. Focus on building features while we handle infrastructure.",
};

const features = [
  {
    icon: Zap,
    title: "Auto-scaling",
    description: "Scale from zero to millions of users automatically. Pay only for what you use, scale instantly when demand spikes.",
  },
  {
    icon: Globe,
    title: "Global presence",
    description: "Deploy your application closer to users worldwide. Reduce latency and improve user experience globally.",
  },
  {
    icon: Database,
    title: "Edge databases",
    description: "Serverless databases that scale with your application. Built-in caching and connection pooling.",
  },
  {
    icon: BarChart3,
    title: "Built-in analytics",
    description: "Monitor performance, track errors, and understand user behavior. Real-time insights at your fingertips.",
  },
  {
    icon: GitBranch,
    title: "Preview deployments",
    description: "Every pull request gets its own preview URL. Test changes before they go live, collaborate with your team.",
  },
  {
    icon: Shield,
    title: "Enterprise security",
    description: "SOC2 Type II certified. DDoS protection, WAF, and automatic SSL for every deployment.",
  },
];

const metrics = [
  { value: "99.99%", label: "Uptime SLA guaranteed" },
  { value: "<50ms", label: "Global P95 latency" },
  { value: "3s", label: "Average deploy time" },
  { value: "50K+", label: "Developers trust us" },
];

const techStack = [
  "Next.js", "React", "Vue", "Nuxt", "SvelteKit", "Astro", "Node.js", "Python"
];

export default function SaaSSolutionPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/solutions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowRight className="w-4 h-4 rotate-180" />
              All solutions
            </Link>
            <Badge variant="outline" className="mb-6 border-blue-500/50 text-blue-500">
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              SaaS
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Ship faster, scale infinitely
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Focus on building features that delight your users. We handle the infrastructure 
              so you can ship faster and scale without limits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start for free
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
              Built for modern SaaS
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Everything you need to build, deploy, and scale your SaaS application.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-500" />
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

      {/* Tech Stack */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Your favorite frameworks, supercharged
            </h2>
            <p className="text-foreground/60">
              First-class support for modern web frameworks and runtimes.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
            {techStack.map((tech) => (
              <div
                key={tech}
                className="px-5 py-2.5 rounded-lg bg-card border border-border/50 text-sm font-medium text-foreground/80"
              >
                {tech}
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
              Why SaaS teams choose Ovmon
            </h2>
            <div className="space-y-4">
              {[
                "Deploy every commit automatically with preview URLs for review",
                "Scale from beta to millions of users without changing code",
                "Built-in CI/CD with GitHub, GitLab, and Bitbucket integration",
                "Serverless functions at the edge for real-time features",
                "Automatic performance optimization and caching",
                "Team collaboration with role-based access control",
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
              <Users className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to scale your SaaS?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Join thousands of SaaS companies who ship faster and scale effortlessly with Ovmon.
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
