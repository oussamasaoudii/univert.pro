'use client';

import Link from "next/link";
import {
  BookOpen,
  FileText,
  Video,
  GraduationCap,
  MessageSquare,
  Headphones,
  Code2,
  Newspaper,
  Rocket,
  ArrowRight,
  ExternalLink,
  Zap,
  Users,
  Github,
  Play,
} from "lucide-react";
import {
  HeroSection,
  CTABand,
} from "@/components/marketing/sections";
import { ResourceCards } from "./resource-cards";
import { FeaturedContent } from "./featured-content";
import { CommunitySection } from "./community-section";

// Main resource categories
const resourceCategories = [
  {
    title: "Documentation",
    description: "Comprehensive guides and API references for building on Ovmon.",
    href: "/docs",
    icon: BookOpen,
    color: "bg-accent/20 text-accent",
    featured: true,
    items: ["Getting Started", "API Reference", "CLI Guide", "Configuration"],
  },
  {
    title: "Tutorials",
    description: "Step-by-step tutorials to help you master the platform.",
    href: "/tutorials",
    icon: GraduationCap,
    color: "bg-blue-500/20 text-blue-400",
    items: ["Deploy Next.js", "Serverless Functions", "Edge Computing", "Database Integration"],
  },
  {
    title: "Templates",
    description: "Production-ready templates to kickstart your next project.",
    href: "/templates",
    icon: Code2,
    color: "bg-purple-500/20 text-purple-400",
    items: ["E-commerce", "SaaS Starter", "Blog", "Portfolio"],
  },
  {
    title: "Video Guides",
    description: "Watch and learn with our comprehensive video tutorials.",
    href: "/videos",
    icon: Video,
    color: "bg-red-500/20 text-red-400",
    items: ["Platform Overview", "Advanced Deployments", "Team Workflows", "Best Practices"],
  },
  {
    title: "Blog",
    description: "Latest news, updates, and insights from the Ovmon team.",
    href: "/blog",
    icon: Newspaper,
    color: "bg-orange-500/20 text-orange-400",
    items: ["Product Updates", "Engineering", "Case Studies", "Tips & Tricks"],
  },
  {
    title: "Support",
    description: "Get help from our support team and community.",
    href: "/support",
    icon: Headphones,
    color: "bg-green-500/20 text-green-400",
    items: ["Help Center", "Contact Support", "Status Page", "Community"],
  },
];

// Featured resources
const featuredResources = [
  {
    type: "guide",
    title: "Getting Started with Ovmon",
    description: "Learn the fundamentals and deploy your first project in under 5 minutes.",
    href: "/docs/getting-started",
    readTime: "5 min read",
    icon: Rocket,
  },
  {
    type: "video",
    title: "Platform Overview",
    description: "A comprehensive video tour of the Ovmon platform and its features.",
    href: "/videos/platform-overview",
    duration: "12 min",
    icon: Play,
  },
  {
    type: "tutorial",
    title: "Deploy a Next.js App",
    description: "Step-by-step guide to deploying your Next.js application.",
    href: "/tutorials/nextjs",
    readTime: "8 min read",
    icon: FileText,
  },
];

// Quick links
const quickLinks = [
  { label: "API Reference", href: "/docs/api", icon: Code2 },
  { label: "CLI Documentation", href: "/docs/cli", icon: FileText },
  { label: "Changelog", href: "/changelog", icon: Zap },
  { label: "System Status", href: "https://status.ovmon.com", icon: ExternalLink, external: true },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: "Resources" }}
        title="Everything you need to"
        titleHighlight="succeed"
        description="Documentation, tutorials, guides, and community resources to help you build amazing things with Ovmon."
        actions={[
          { label: "Browse documentation", href: "/docs", variant: "primary" },
          { label: "Watch tutorials", href: "/videos", variant: "outline" },
        ]}
        variant="centered"
        backgroundVariant="gradient"
      />

      {/* Quick Links Bar */}
      <section className="py-6 border-y border-border/50 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <link.icon className="w-4 h-4 group-hover:text-accent transition-colors" />
                {link.label}
                {link.external && <ExternalLink className="w-3 h-3" />}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <FeaturedContent resources={featuredResources} />

      {/* Resource Categories */}
      <ResourceCards categories={resourceCategories} />

      {/* Community Section */}
      <CommunitySection />

      {/* Final CTA */}
      <CTABand
        title="Can't find what you're looking for?"
        description="Our support team is here to help you succeed."
        actions={[
          { label: "Contact support", href: "/support", variant: "primary" },
          { label: "Join community", href: "/community", variant: "outline" },
        ]}
        variant="centered"
      />
    </main>
  );
}
