import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Briefcase,
  Users,
  Globe,
  Palette,
  CreditCard,
  FolderKanban,
  Repeat,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Agency Solutions - Ovmon",
  description: "Manage multiple client sites from one dashboard. Streamline deployments and collaborate with your team.",
};

const features = [
  {
    icon: FolderKanban,
    title: "Multi-site management",
    description: "Manage all your client projects from a single dashboard. Organize by client, team, or project type.",
  },
  {
    icon: Users,
    title: "Team collaboration",
    description: "Invite team members with role-based permissions. Control who can deploy, edit, or view each project.",
  },
  {
    icon: GitBranch,
    title: "Preview deployments",
    description: "Share preview URLs with clients for approval. Every branch gets its own unique URL for easy review.",
  },
  {
    icon: Palette,
    title: "White-label options",
    description: "Custom domains and branding for client deployments. Present a professional, branded experience.",
  },
  {
    icon: CreditCard,
    title: "Client billing",
    description: "Flexible billing options with per-client invoicing. Pass through costs or bundle into your pricing.",
  },
  {
    icon: Repeat,
    title: "Templates & starters",
    description: "Create reusable project templates. Start new client projects faster with your proven setups.",
  },
];

const metrics = [
  { value: "60%", label: "Faster project delivery" },
  { value: "100+", label: "Projects per workspace" },
  { value: "Unlimited", label: "Team members" },
  { value: "24/7", label: "Support included" },
];

const agencyBenefits = [
  "Centralized dashboard for all client projects",
  "Instant preview URLs for client approvals",
  "Automated deployments from Git pushes",
  "Custom domains with automatic SSL",
  "Built-in performance monitoring",
  "Detailed analytics for client reporting",
  "Collaborative comments on preview deployments",
  "Transfer projects to client accounts seamlessly",
];

export default function AgenciesSolutionPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/solutions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowRight className="w-4 h-4 rotate-180" />
              All solutions
            </Link>
            <Badge variant="outline" className="mb-6 border-green-500/50 text-green-500">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              Agencies
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Scale your agency with confidence
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Manage multiple client sites from one powerful dashboard. Streamline workflows, 
              collaborate with your team, and deliver projects faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/partners">Become a partner</Link>
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
              Everything agencies need
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Tools and workflows designed specifically for agency teams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-500" />
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

      {/* Benefits */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Why agencies choose Ovmon
              </h2>
              <p className="text-foreground/60">
                Join hundreds of agencies who deliver better results faster.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {agencyBenefits.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-lg bg-card/40 border border-border/40">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Program */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                  Partner Program
                </Badge>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                  Grow with our partner program
                </h2>
                <p className="text-foreground/60 mb-6 leading-relaxed">
                  Join our partner program and unlock exclusive benefits. Get priority support, 
                  co-marketing opportunities, and revenue sharing for referrals.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Revenue sharing on referred clients",
                    "Partner badge and directory listing",
                    "Co-marketing and lead sharing",
                    "Dedicated partner support channel",
                    "Early access to new features",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                  <Link href="/partners">
                    Become a partner
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <Card className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20">
                <CardContent className="p-8">
                  <Globe className="w-12 h-12 text-accent mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Partner Benefits
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "20% revenue share on referrals",
                      "Free Pro plan for your agency",
                      "Priority support queue",
                      "Partner success manager",
                      "Marketing development funds",
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
      <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="container">
          <Card className="max-w-3xl mx-auto bg-card/80 border-border/50">
            <CardContent className="p-8 lg:p-12 text-center">
              <Briefcase className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to grow your agency?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Join hundreds of agencies who deliver exceptional results with Ovmon.
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
