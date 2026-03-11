"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Menu,
  ArrowRight,
  LayoutDashboard,
  Shield,
  LogOut,
  Rocket,
  Globe,
  Zap,
  Lock,
  Server,
  Code2,
  Layers,
  ChevronRight,
  Building2,
  ShoppingCart,
  Briefcase,
  GraduationCap,
  BookOpen,
  FileText,
  Puzzle,
  Users,
  MessageSquare,
  Video,
  Award,
  Heart,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MarketingSessionUser = {
  id: string;
  email: string;
  role: "user" | "admin";
  sessionType: "user" | "admin" | null;
} | null;

// Product menu items
const productFeatures = [
  {
    title: "Global Edge Network",
    description: "Deploy to 150+ locations worldwide",
    href: "/features/edge-network",
    icon: Globe,
  },
  {
    title: "Instant Deploys",
    description: "Push to deploy in seconds",
    href: "/features/deploys",
    icon: Rocket,
  },
  {
    title: "Auto-Scaling",
    description: "Scale from zero to millions",
    href: "/features/scaling",
    icon: Zap,
  },
  {
    title: "Enterprise Security",
    description: "SOC2, DDoS protection, WAF",
    href: "/features/security",
    icon: Lock,
  },
  {
    title: "Serverless Functions",
    description: "Run backend code at the edge",
    href: "/features/serverless",
    icon: Server,
  },
  {
    title: "Developer Tools",
    description: "CLI, SDK, and API access",
    href: "/features/developer-tools",
    icon: Code2,
  },
];

const productHighlight = {
  title: "See Ovmon in action",
  description: "Watch a 2-minute demo of our platform capabilities.",
  href: "/demo",
  cta: "Watch demo",
};

// Solutions menu items
const solutionsByIndustry = [
  {
    title: "E-commerce",
    description: "High-performance storefronts",
    href: "/solutions/ecommerce",
    icon: ShoppingCart,
  },
  {
    title: "SaaS",
    description: "Scale your application globally",
    href: "/solutions/saas",
    icon: Layers,
  },
  {
    title: "Enterprise",
    description: "Enterprise-grade infrastructure",
    href: "/solutions/enterprise",
    icon: Building2,
  },
  {
    title: "Agencies",
    description: "Manage multiple client sites",
    href: "/solutions/agencies",
    icon: Briefcase,
  },
  {
    title: "Creators",
    description: "Portfolio and content sites",
    href: "/solutions/creators",
    icon: Heart,
  },
  {
    title: "Education",
    description: "Learning platforms",
    href: "/solutions/education",
    icon: GraduationCap,
  },
];

const solutionsByUseCase = [
  {
    title: "Marketing Sites",
    description: "Fast, SEO-optimized websites",
    href: "/use-cases/marketing",
  },
  {
    title: "Web Applications",
    description: "Full-stack app deployment",
    href: "/use-cases/web-apps",
  },
  {
    title: "API & Backends",
    description: "Scalable serverless APIs",
    href: "/use-cases/api",
  },
];

const solutionsHighlight = {
  title: "Enterprise Security",
  description: "SOC2 certified, 99.99% uptime SLA, and dedicated support for mission-critical apps.",
  href: "/trust",
  cta: "Learn about Trust",
};

// Resources menu items
const resourcesLearn = [
  {
    title: "Documentation",
    description: "Guides and API reference",
    href: "/docs",
    icon: BookOpen,
  },
  {
    title: "Blog",
    description: "News, tutorials, and insights",
    href: "/blog",
    icon: FileText,
  },
  {
    title: "Case Studies",
    description: "Customer success stories",
    href: "/case-studies",
    icon: Award,
  },
  {
    title: "Webinars",
    description: "Live and on-demand sessions",
    href: "/webinars",
    icon: Video,
  },
];

const resourcesConnect = [
  {
    title: "Integrations",
    description: "Connect your favorite tools",
    href: "/integrations",
    icon: Puzzle,
  },
  {
    title: "Community",
    description: "Join 50,000+ developers",
    href: "/community",
    icon: Users,
  },
  {
    title: "Support",
    description: "Get help from our team",
    href: "/support",
    icon: MessageSquare,
  },
];

// Company menu items
const companyLinks = [
  { title: "About", description: "Our story and mission", href: "/about" },
  { title: "Careers", description: "Join our team", href: "/careers", badge: "Hiring" },
  { title: "Partners", description: "Partner program", href: "/partners" },
  { title: "Press", description: "News and media", href: "/press" },
  { title: "Contact", description: "Get in touch", href: "/contact" },
];

// Simple nav items (no dropdown)
const simpleNavItems = [
  { name: "Templates", href: "/demos" },
  { name: "Pricing", href: "/pricing" },
];

export function HeaderClient({ currentUser }: { currentUser: MarketingSessionUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-smooth group-hover:shadow-glow-sm">
              <span className="text-sm font-bold text-accent-foreground">O</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Ovmon</span>
          </Link>

          {/* Desktop Navigation with Mega Menus */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-0">
              {/* Product Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 data-[state=open]:bg-secondary/50 data-[state=open]:text-foreground">
                  Product
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[680px] p-5 bg-popover text-popover-foreground">
                    <div className="grid grid-cols-12 gap-6">
                      {/* Features grid */}
                      <div className="col-span-8">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Features</p>
                        <div className="grid grid-cols-2 gap-1">
                          {productFeatures.map((feature) => (
                            <NavigationMenuLink key={feature.href} asChild>
                              <Link
                                href={feature.href}
                                className="group flex items-start gap-3 rounded-lg p-3 hover:bg-secondary/60 transition-colors"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                                  <feature.icon className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{feature.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>

                      {/* Highlight card */}
                      <div className="col-span-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Explore</p>
                        <div className="rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="h-4 w-4 text-accent" />
                            <span className="text-xs font-medium text-accent">Demo</span>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">{productHighlight.title}</p>
                          <p className="text-xs text-muted-foreground mb-3">{productHighlight.description}</p>
                          <Link
                            href={productHighlight.href}
                            className="inline-flex items-center text-xs font-medium text-accent hover:underline"
                          >
                            {productHighlight.cta}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                          <Link
                            href="/features"
                            className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            View all features
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Solutions Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 data-[state=open]:bg-secondary/50 data-[state=open]:text-foreground">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[720px] p-5 bg-popover text-popover-foreground">
                    <div className="grid grid-cols-12 gap-6">
                      {/* By Industry */}
                      <div className="col-span-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Industry</p>
                        <div className="grid grid-cols-1 gap-1">
                          {solutionsByIndustry.map((solution) => (
                            <NavigationMenuLink key={solution.href} asChild>
                              <Link
                                href={solution.href}
                                className="group flex items-center gap-3 rounded-lg p-2.5 hover:bg-secondary/60 transition-colors"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground/80 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                  <solution.icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{solution.title}</p>
                                  <p className="text-xs text-muted-foreground">{solution.description}</p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>

                      {/* By Use Case */}
                      <div className="col-span-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Use Case</p>
                        <div className="space-y-1">
                          {solutionsByUseCase.map((useCase) => (
                            <NavigationMenuLink key={useCase.href} asChild>
                              <Link
                                href={useCase.href}
                                className="group flex flex-col rounded-lg p-3 hover:bg-secondary/60 transition-colors"
                              >
                                <p className="text-sm font-medium text-foreground">{useCase.title}</p>
                                <p className="text-xs text-muted-foreground">{useCase.description}</p>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                          <Link
                            href="/solutions"
                            className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            View all solutions
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Trust highlight card */}
                      <div className="col-span-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Trust</p>
                        <div className="rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-accent" />
                            <span className="text-xs font-medium text-accent">Security</span>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">{solutionsHighlight.title}</p>
                          <p className="text-xs text-muted-foreground mb-3">{solutionsHighlight.description}</p>
                          <Link
                            href={solutionsHighlight.href}
                            className="inline-flex items-center text-xs font-medium text-accent hover:underline"
                          >
                            {solutionsHighlight.cta}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Resources Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 data-[state=open]:bg-secondary/50 data-[state=open]:text-foreground">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[520px] p-5 bg-popover text-popover-foreground">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Learn */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Learn</p>
                        <div className="space-y-1">
                          {resourcesLearn.map((resource) => (
                            <NavigationMenuLink key={resource.href} asChild>
                              <Link
                                href={resource.href}
                                className="group flex items-center gap-3 rounded-lg p-3 hover:bg-secondary/60 transition-colors"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground/80 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                  <resource.icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{resource.title}</p>
                                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>

                      {/* Connect */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Connect</p>
                        <div className="space-y-1">
                          {resourcesConnect.map((resource) => (
                            <NavigationMenuLink key={resource.href} asChild>
                              <Link
                                href={resource.href}
                                className="group flex items-center gap-3 rounded-lg p-3 hover:bg-secondary/60 transition-colors"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground/80 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                  <resource.icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{resource.title}</p>
                                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                          <Link
                            href="/changelog"
                            className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-accent" />
                              What&apos;s new
                            </div>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Simple nav items */}
              {simpleNavItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <Link
                    href={item.href}
                    className="inline-flex h-9 items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/50"
                  >
                    {item.name}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Company — separate NavigationMenu with viewport=false to avoid offset issues */}
          <NavigationMenu viewport={false} className="hidden lg:flex">
            <NavigationMenuList className="gap-0">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 data-[state=open]:bg-secondary/50 data-[state=open]:text-foreground">
                  Company
                </NavigationMenuTrigger>
                <NavigationMenuContent className="right-0 left-auto mt-1 min-w-[240px] rounded-xl border bg-popover p-2 shadow-lg">
                  <div className="space-y-0.5">
                    {companyLinks.map((link) => (
                      <NavigationMenuLink key={link.href} asChild>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-secondary/60 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{link.title}</p>
                            <p className="text-xs text-muted-foreground">{link.description}</p>
                          </div>
                          {link.badge && (
                            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher withTheme />
          {currentUser ? (
            <>
              {currentUser.role === "admin" && (
                <a
                  href="/admin"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-4 font-medium")}
                >
                  <Shield className="mr-1.5 h-4 w-4" />
                  Admin
                </a>
              )}
              {currentUser.sessionType === "user" ? (
                <a
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-4 font-medium")}
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </a>
              ) : null}
              <a
                href="/api/auth/logout"
                className={cn(buttonVariants({ size: "sm" }), "h-9 px-5 font-medium group")}
              >
                Sign out
                <LogOut className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-4 font-medium")}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className={cn(buttonVariants({ size: "sm" }), "h-9 px-5 font-medium group")}
              >
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[380px] bg-background border-border overflow-y-auto">
            <div className="flex items-center gap-2.5 mt-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">O</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Ovmon</span>
            </div>

            <nav className="flex flex-col">
              {/* Product submenu */}
              <div className="border-b border-border/50">
                <button
                  onClick={() => setMobileSubmenu(mobileSubmenu === "product" ? null : "product")}
                  className="flex items-center justify-between w-full px-2 py-4 text-base font-medium text-foreground"
                >
                  Product
                  <ChevronDown className={cn("h-4 w-4 transition-transform", mobileSubmenu === "product" && "rotate-180")} />
                </button>
                {mobileSubmenu === "product" && (
                  <div className="pb-4 space-y-1">
                    {productFeatures.map((feature) => (
                      <Link
                        key={feature.href}
                        href={feature.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-secondary/50"
                      >
                        <feature.icon className="h-4 w-4 text-accent" />
                        <span className="text-sm text-foreground">{feature.title}</span>
                      </Link>
                    ))}
                    <Link
                      href="/features"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-2 py-2.5 text-sm text-accent"
                    >
                      View all features
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Solutions submenu */}
              <div className="border-b border-border/50">
                <button
                  onClick={() => setMobileSubmenu(mobileSubmenu === "solutions" ? null : "solutions")}
                  className="flex items-center justify-between w-full px-2 py-4 text-base font-medium text-foreground"
                >
                  Solutions
                  <ChevronDown className={cn("h-4 w-4 transition-transform", mobileSubmenu === "solutions" && "rotate-180")} />
                </button>
                {mobileSubmenu === "solutions" && (
                  <div className="pb-4 space-y-1">
                    <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">By Industry</p>
                    {solutionsByIndustry.map((solution) => (
                      <Link
                        key={solution.href}
                        href={solution.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-secondary/50"
                      >
                        <solution.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{solution.title}</span>
                      </Link>
                    ))}
                    <p className="px-2 pt-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">By Use Case</p>
                    {solutionsByUseCase.map((useCase) => (
                      <Link
                        key={useCase.href}
                        href={useCase.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-2 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary/50"
                      >
                        {useCase.title}
                      </Link>
                    ))}
                    {/* Trust highlight in mobile */}
                    <div className="mx-2 mt-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">Enterprise Security</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">SOC2 certified with 99.99% uptime SLA</p>
                      <Link
                        href="/trust"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center text-xs font-medium text-accent"
                      >
                        Learn more
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Resources submenu */}
              <div className="border-b border-border/50">
                <button
                  onClick={() => setMobileSubmenu(mobileSubmenu === "resources" ? null : "resources")}
                  className="flex items-center justify-between w-full px-2 py-4 text-base font-medium text-foreground"
                >
                  Resources
                  <ChevronDown className={cn("h-4 w-4 transition-transform", mobileSubmenu === "resources" && "rotate-180")} />
                </button>
                {mobileSubmenu === "resources" && (
                  <div className="pb-4 space-y-1">
                    {[...resourcesLearn, ...resourcesConnect].map((resource) => (
                      <Link
                        key={resource.href}
                        href={resource.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-secondary/50"
                      >
                        <resource.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{resource.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Simple links */}
              {simpleNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-4 text-base font-medium text-foreground border-b border-border/50"
                >
                  {item.name}
                </Link>
              ))}

              {/* Company submenu */}
              <div className="border-b border-border/50">
                <button
                  onClick={() => setMobileSubmenu(mobileSubmenu === "company" ? null : "company")}
                  className="flex items-center justify-between w-full px-2 py-4 text-base font-medium text-foreground"
                >
                  Company
                  <ChevronDown className={cn("h-4 w-4 transition-transform", mobileSubmenu === "company" && "rotate-180")} />
                </button>
                {mobileSubmenu === "company" && (
                  <div className="pb-4 space-y-1">
                    {companyLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-secondary/50"
                      >
                        <span className="text-sm text-foreground">{link.title}</span>
                        {link.badge && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile CTA */}
              <div className="flex flex-col gap-2 mt-6 pt-6 border-t border-border">
                <LanguageSwitcher withTheme className="self-start mb-4" />
                {currentUser ? (
                  <>
                    {currentUser.role === "admin" && (
                      <a
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 font-medium")}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </a>
                    )}
                    {currentUser.sessionType === "user" ? (
                      <a
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 font-medium")}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </a>
                    ) : null}
                    <a
                      href="/api/auth/logout"
                      onClick={() => setIsOpen(false)}
                      className={cn(buttonVariants({ variant: "default" }), "w-full h-11 font-medium")}
                    >
                      Sign out
                      <LogOut className="ml-1.5 h-4 w-4" />
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 font-medium")}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className={cn(buttonVariants({ variant: "default" }), "w-full h-11 font-medium")}
                    >
                      Get Started
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
