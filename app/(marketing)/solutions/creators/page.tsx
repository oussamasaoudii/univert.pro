import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Palette,
  Zap,
  Globe,
  BarChart3,
  Shield,
  Pen,
  Layout,
  Share2,
  CheckCircle2,
  Youtube,
  Instagram,
  Podcast,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Creator Solutions - Ovmon",
  description: "Build your online presence with beautiful, fast websites. Perfect for content creators, influencers, and personal brands.",
};

const features = [
  {
    icon: Palette,
    title: "Beautiful templates",
    description: "Start with stunning templates designed for creators. Portfolio, blog, link-in-bio, and more.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Your site loads instantly for every visitor. Global CDN ensures speed everywhere.",
  },
  {
    icon: Pen,
    title: "Easy customization",
    description: "No coding required. Drag, drop, and customize to match your unique brand identity.",
  },
  {
    icon: BarChart3,
    title: "Built-in analytics",
    description: "Understand your audience with real-time visitor stats, traffic sources, and engagement metrics.",
  },
  {
    icon: Share2,
    title: "Social integration",
    description: "Connect all your social platforms. Auto-sync content from YouTube, Instagram, and more.",
  },
  {
    icon: Shield,
    title: "Custom domains",
    description: "Use your own domain with free SSL. Look professional with yourname.com instead of generic URLs.",
  },
];

const metrics = [
  { value: "50K+", label: "Creators hosted" },
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "< 1s", label: "Load time globally" },
  { value: "Free", label: "To get started" },
];

const creatorTypes = [
  {
    icon: Youtube,
    title: "Video Creators",
    description: "Showcase your content library, sell courses, and build your subscriber community.",
    features: ["Video embedding", "Course hosting", "Membership areas"],
  },
  {
    icon: Podcast,
    title: "Podcasters",
    description: "Host your episodes, grow your audience, and monetize with sponsorship pages.",
    features: ["Episode players", "RSS integration", "Sponsor kit pages"],
  },
  {
    icon: Instagram,
    title: "Influencers",
    description: "Create stunning link-in-bio pages, showcase brand partnerships, and track clicks.",
    features: ["Link-in-bio", "Brand collab showcase", "Click tracking"],
  },
  {
    icon: Pen,
    title: "Writers & Bloggers",
    description: "Publish beautiful articles, build an email list, and monetize your writing.",
    features: ["Blog platform", "Newsletter signup", "Paid subscriptions"],
  },
];

const creatorBenefits = [
  "One-click deployment for instant publishing",
  "Mobile-optimized out of the box",
  "SEO tools to grow your organic reach",
  "Email capture and newsletter integration",
  "E-commerce for selling digital products",
  "Password-protected member areas",
  "Custom forms for fan engagement",
  "Automatic backups and version history",
];

export default function CreatorsSolutionPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/solutions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowRight className="w-4 h-4 rotate-180" />
              All solutions
            </Link>
            <Badge variant="outline" className="mb-6 border-pink-500/50 text-pink-500">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Creators
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Your brand deserves a stunning home
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Build a beautiful online presence that matches your creativity. No coding required, 
              just drag, drop, and publish to the world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/demos">Browse templates</Link>
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
              Everything to build your brand
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              All the tools you need to create, grow, and monetize your online presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-pink-500" />
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

      {/* Creator Types */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Built for every type of creator
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Whether you make videos, write blogs, or build a community, we have you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {creatorTypes.map((type) => (
              <Card key={type.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <type.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {type.title}
                  </h3>
                  <p className="text-foreground/60 mb-4 leading-relaxed">
                    {type.description}
                  </p>
                  <ul className="space-y-2">
                    {type.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground/70">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Why creators choose Ovmon
              </h2>
              <p className="text-foreground/60">
                Join thousands of creators building their online empires.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {creatorBenefits.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-lg bg-card/40 border border-border/40">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                  Templates
                </Badge>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                  Start with a beautiful template
                </h2>
                <p className="text-foreground/60 mb-6 leading-relaxed">
                  Choose from dozens of professionally designed templates. Customize colors, fonts, 
                  and layouts to match your unique brand identity.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Portfolio templates for visual artists",
                    "Blog layouts for writers and journalists",
                    "Link-in-bio pages for social creators",
                    "Landing pages for product launches",
                    "Membership sites for community builders",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                  <Link href="/demos">
                    Browse templates
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <Card className="bg-gradient-to-br from-pink-500/10 via-accent/5 to-transparent border-accent/20">
                <CardContent className="p-8">
                  <Layout className="w-12 h-12 text-accent mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Template Features
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Mobile-responsive designs",
                      "Dark and light mode support",
                      "Customizable color schemes",
                      "Built-in animation effects",
                      "SEO-optimized structure",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <Card className="max-w-3xl mx-auto bg-card/80 border-border/50">
            <CardContent className="p-8 lg:p-12 text-center">
              <Sparkles className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to build your brand?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Join thousands of creators who showcase their work with Ovmon.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                  <Link href="/auth/signup">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                  <Link href="/demos">Browse templates</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
