"use client";

// Marketing header client component with responsive navigation

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
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Country } from "@/lib/countries/types";

type MarketingSessionUser = {
  id: string;
  email: string;
  role: "user" | "admin";
  sessionType: "user" | "admin" | null;
} | null;

// Product menu items
const productFeatured = {
  title: "Templates Gallery",
  description: "Browse professional launch-ready website templates",
  href: "/templates",
  icon: Layers,
};

const productFeatures = [
  {
    title: "WordPress Templates",
    description: "Professional sites built on WordPress",
    href: "/templates?stack=wordpress",
    icon: Globe,
  },
  {
    title: "Laravel Templates",
    description: "Custom web applications with Laravel",
    href: "/templates?stack=laravel",
    icon: Layers,
  },
  {
    title: "Next.js Templates",
    description: "Modern web experiences with Next.js",
    href: "/templates?stack=nextjs",
    icon: Rocket,
  },
  {
    title: "How It Works",
    description: "Our launch and support process",
    href: "/how-it-works",
    icon: Zap,
  },
  {
    title: "Support Included",
    description: "Managed setup and technical support",
    href: "/about/support",
    icon: Headphones,
  },
  {
    title: "Own Your Site",
    description: "Export and move anytime you want",
    href: "/about/ownership",
    icon: Lock,
  },
];

const productHighlight = {
  title: "Browse Templates",
  description: "See live demos of professional websites you can launch immediately.",
  href: "/templates",
  cta: "Browse templates",
};

// Solutions menu items
const solutionsByIndustry = [
  {
    title: "Small Business",
    description: "Professional websites for local businesses",
    href: "/solutions/small-business",
    icon: Building2,
  },
  {
    title: "E-commerce",
    description: "Online stores and digital shops",
    href: "/solutions/ecommerce",
    icon: ShoppingCart,
  },
  {
    title: "Agencies",
    description: "Manage client sites with managed support",
    href: "/solutions/agencies",
    icon: Briefcase,
  },
  {
    title: "Creators & Influencers",
    description: "Portfolio and content sites",
    href: "/solutions/creators",
    icon: Heart,
  },
  {
    title: "Consulting & Services",
    description: "Professional service websites",
    href: "/solutions/consulting",
    icon: Briefcase,
  },
  {
    title: "Non-Profits",
    description: "Mission-driven organization sites",
    href: "/solutions/nonprofits",
    icon: Heart,
  },
];

const solutionsByUseCase = [
  {
    title: "Quick Launch",
    description: "Get a professional site live this week",
    href: "/use-cases/quick-launch",
  },
  {
    title: "Managed Operations",
    description: "Let us handle updates and maintenance",
    href: "/use-cases/managed",
  },
  {
    title: "Export Anytime",
    description: "Move to your own server with full support",
    href: "/use-cases/export",
  },
];

const solutionsHighlight = {
  title: "Ownership & Freedom",
  description: "Your website stays yours. Export and migrate anytime you want. No vendor lock-in.",
  href: "/about/ownership",
  cta: "Learn about freedom",
};

// Resources menu items
const resourcesLearn = [
  {
    title: "Getting Started",
    description: "First steps with Univert",
    href: "/resources/getting-started",
    icon: BookOpen,
  },
  {
    title: "Knowledge Base",
    description: "Common questions and solutions",
    href: "/knowledge-base",
    icon: BookOpen,
  },
  {
    title: "Blog",
    description: "Website tips and business insights",
    href: "/blog",
    icon: FileText,
  },
  {
    title: "Case Studies",
    description: "Real customer success stories",
    href: "/case-studies",
    icon: Award,
  },
  {
    title: "Webinars",
    description: "Live training and Q&A sessions",
    href: "/webinars",
    icon: Video,
  },
];

const resourcesConnect = [
  {
    title: "Support",
    description: "Get help from our team",
    href: "/support",
    icon: MessageSquare,
  },
  {
    title: "Community",
    description: "Connect with other customers",
    href: "/community",
    icon: Users,
  },
  {
    title: "Ownership Guide",
    description: "Export and migration resources",
    href: "/about/ownership",
    icon: Lock,
  },
];

// Company menu items
const companyLinks = [
  { title: "About", description: "Our story and mission", href: "/about" },
  { title: "Customers", description: "Customer success stories", href: "/customers" },
  { title: "Careers", description: "Join our team", href: "/careers", badge: "Hiring" },
  { title: "Partners", description: "Partner program", href: "/partners" },
  { title: "Press", description: "News and media", href: "/press" },
  { title: "Contact", description: "Get in touch", href: "/contact" },
];

// Simple nav items (no dropdown)
const simpleNavItems = [
  { name: "Templates", href: "/templates" },
  { name: "Pricing", href: "/pricing" },
  { name: "How It Works", href: "/how-it-works" },
];

export function HeaderClient({ currentUser, countries = [] }: { currentUser: MarketingSessionUser; countries?: Country[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    countries.find((c) => c.isDefault) || countries[0] || null
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="container flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-smooth group-hover:shadow-glow-sm">
              <span className="text-sm font-bold text-accent-foreground">U</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Univert</span>
          </Link>

          {/* Desktop Navigation with Mega Menus */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-0">
              {/* Product Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 data-[state=open]:bg-secondary/30 data-[state=open]:text-foreground transition-colors">
                  Product
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[820px] p-6 bg-popover text-popover-foreground overflow-visible">
                    <div className="grid grid-cols-12 gap-8">
                      {/* Featured item with video background */}
                      <div className="col-span-5 min-w-0">
                        <div className="relative rounded-xl overflow-hidden border border-accent/20 h-full min-h-[280px] bg-black">
                          {/* Video Background */}
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          >
                            <source src="https://cdn.pixabay.com/video/2020/05/25/40130-424930941_large.mp4" type="video/mp4" />
                          </video>
                          {/* Gradient Overlay for readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                          {/* Content */}
                          <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white">
                                  {productFeatured.icon && <productFeatured.icon className="h-4 w-4" />}
                                </div>
                                <span className="text-xs font-semibold text-accent uppercase tracking-wider">Featured</span>
                              </div>
                              <p className="text-lg font-semibold text-white mb-2">{productFeatured.title || 'Templates Gallery'}</p>
                              <p className="text-sm text-white/80">{productFeatured.description || 'Browse professional launch-ready website templates'}</p>
                            </div>
                            <Link
                              href={productFeatured.href || '/templates'}
                              className="inline-flex items-center text-sm font-medium text-white hover:text-accent transition-colors mt-4"
                            >
                              Explore platform
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Core Features */}
                      <div className="col-span-7 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Core Features</p>
                        <div className="grid grid-cols-2 gap-4">
                          {productFeatures && productFeatures.length > 0 ? (
                            productFeatures.map((feature) => (
                              <NavigationMenuLink key={feature.href} asChild>
                                <Link
                                  href={feature.href}
                                  className="group flex flex-col p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                      {feature.icon && <feature.icon className="h-4 w-4" />}
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{feature.title}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                                </Link>
                              </NavigationMenuLink>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground col-span-2">Loading features...</p>
                          )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-border/50">
                          <Link
                            href="/features"
                            className="flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            View all features
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-6 pt-6 border-t border-border/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">See Univert in action</p>
                          <p className="text-xs text-muted-foreground">Watch a 2-minute demo of our platform</p>
                        </div>
                        <Link
                          href={productHighlight.href}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors"
                        >
                          <Video className="h-3.5 w-3.5 mr-2" />
                          {productHighlight.cta}
                        </Link>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Solutions Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 data-[state=open]:bg-secondary/30 data-[state=open]:text-foreground transition-colors">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[900px] p-6 bg-popover text-popover-foreground overflow-visible">
                    <div className="grid grid-cols-12 gap-8">
                      {/* By Industry */}
                      <div className="col-span-4 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">By Industry</p>
                        <div className="space-y-2">
                          {solutionsByIndustry && solutionsByIndustry.length > 0 ? (
                            solutionsByIndustry.map((solution) => (
                              <NavigationMenuLink key={solution.href} asChild>
                                <Link
                                  href={solution.href}
                                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                    {solution.icon && <solution.icon className="h-4 w-4" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{solution.title}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{solution.description}</p>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Loading solutions...</p>
                          )}
                        </div>
                      </div>

                      {/* By Use Case */}
                      <div className="col-span-4 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">By Use Case</p>
                        <div className="space-y-2">
                          {solutionsByUseCase && solutionsByUseCase.length > 0 ? (
                            solutionsByUseCase.map((useCase) => (
                              <NavigationMenuLink key={useCase.href} asChild>
                                <Link
                                  href={useCase.href}
                                  className="group flex flex-col p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                  <p className="text-sm font-medium text-foreground">{useCase.title}</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{useCase.description}</p>
                                </Link>
                              </NavigationMenuLink>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Loading use cases...</p>
                          )}
                        </div>
                      </div>

                      {/* Trust highlight card */}
                      <div className="col-span-4 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Trust & Security</p>
                        <div className="rounded-xl bg-gradient-to-br from-accent/15 via-accent/5 to-transparent border border-accent/20 p-5 h-full flex flex-col">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4 text-accent" />
                            <span className="text-xs font-medium text-accent uppercase tracking-wider">Enterprise</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground mb-2">{solutionsHighlight.title}</p>
                          <p className="text-xs text-muted-foreground mb-4 flex-grow leading-relaxed">{solutionsHighlight.description}</p>
                          <Link
                            href={solutionsHighlight.href}
                            className="inline-flex items-center text-sm font-medium text-accent hover:text-accent transition-colors"
                          >
                            {solutionsHighlight.cta}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-5 pt-5 border-t border-border/30">
                      <Link
                        href="/solutions"
                        className="flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View all solutions
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Resources Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 data-[state=open]:bg-secondary/30 data-[state=open]:text-foreground transition-colors">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[700px] p-6 bg-popover text-popover-foreground overflow-visible">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Learn */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Learn</p>
                        <div className="space-y-2">
                          {resourcesLearn && resourcesLearn.length > 0 ? (
                            resourcesLearn.map((resource) => (
                              <NavigationMenuLink key={resource.href} asChild>
                                <Link
                                  href={resource.href}
                                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                    {resource.icon && <resource.icon className="h-4 w-4" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{resource.title}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Loading resources...</p>
                          )}
                        </div>
                      </div>

                      {/* Connect */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Connect</p>
                        <div className="space-y-2">
                          {resourcesConnect && resourcesConnect.length > 0 ? (
                            resourcesConnect.map((resource) => (
                              <NavigationMenuLink key={resource.href} asChild>
                                <Link
                                  href={resource.href}
                                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                    {resource.icon && <resource.icon className="h-4 w-4" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{resource.title}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Featured area */}
                    <div className="mt-6 pt-6 border-t border-border/30">
                      <Link
                        href="/changelog"
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                            <Heart className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">What&apos;s new</p>
                            <p className="text-xs text-muted-foreground">Latest updates and features</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Simple nav items */}
              {simpleNavItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <Link
                    href={item.href}
                    className="inline-flex h-9 items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/40"
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
                <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 data-[state=open]:bg-secondary/30 data-[state=open]:text-foreground transition-colors">
                  Company
                </NavigationMenuTrigger>
                <NavigationMenuContent className="right-0 left-auto mt-1 min-w-[300px] rounded-xl border bg-popover shadow-lg">
                  <div className="p-4">
                    <div className="space-y-1">
                      {companyLinks && companyLinks.length > 0 ? (
                        companyLinks.map((link) => (
                          <NavigationMenuLink key={link.href} asChild>
                            <Link
                              href={link.href}
                              className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-secondary/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{link.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
                              </div>
                              {link.badge && (
                                <span className="shrink-0 ml-3 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                                  {link.badge}
                                </span>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground px-3 py-2">Loading...</p>
                      )}
                    </div>

                    {/* Company menu footer */}
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <Link
                        href="/contact"
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Get in touch</p>
                          <p className="text-xs text-muted-foreground">Contact our team</p>
                        </div>
                      </Link>
                    </div>
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
