import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  GitBranch,
  Shield,
  MessageSquare,
  History,
  Settings,
  Lock,
  Bell,
  CheckCircle2,
  UserPlus,
  FolderKanban,
  Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Team Solutions - Ovmon",
  description: "Collaborate seamlessly with your team. Role-based access, shared workspaces, and powerful deployment workflows.",
};

const features = [
  {
    icon: UserPlus,
    title: "Team invites",
    description: "Invite unlimited team members with a single click. Onboard new hires in minutes, not hours.",
  },
  {
    icon: Shield,
    title: "Role-based access",
    description: "Fine-grained permissions for every team member. Control who can deploy, edit, or view each project.",
  },
  {
    icon: GitBranch,
    title: "Branch deployments",
    description: "Every branch gets a unique preview URL. Review changes before merging to production.",
  },
  {
    icon: MessageSquare,
    title: "Comments & reviews",
    description: "Leave feedback directly on preview deployments. Streamline design reviews and approvals.",
  },
  {
    icon: History,
    title: "Version history",
    description: "Full audit trail of every deployment. Roll back to any version with one click.",
  },
  {
    icon: Bell,
    title: "Team notifications",
    description: "Stay informed with Slack, email, and webhook integrations. Never miss a deployment.",
  },
];

const metrics = [
  { value: "5x", label: "Faster deployments" },
  { value: "100%", label: "Code review coverage" },
  { value: "Unlimited", label: "Team members" },
  { value: "Real-time", label: "Collaboration" },
];

const workflowSteps = [
  {
    step: "01",
    title: "Create a branch",
    description: "Developers work on feature branches without affecting production.",
  },
  {
    step: "02",
    title: "Preview & review",
    description: "Every push creates a preview URL. Team reviews and leaves comments.",
  },
  {
    step: "03",
    title: "Approve & merge",
    description: "Once approved, merge to main. Ovmon deploys automatically.",
  },
  {
    step: "04",
    title: "Monitor & iterate",
    description: "Track performance, gather feedback, and ship the next feature.",
  },
];

const roles = [
  {
    icon: Eye,
    title: "Viewer",
    description: "Can view projects and deployments",
    permissions: ["View projects", "Access analytics", "View deployment history"],
  },
  {
    icon: Users,
    title: "Developer",
    description: "Can push code and manage branches",
    permissions: ["All Viewer permissions", "Push to branches", "Create preview deployments"],
  },
  {
    icon: Settings,
    title: "Admin",
    description: "Full access to team settings",
    permissions: ["All Developer permissions", "Deploy to production", "Manage team members"],
  },
  {
    icon: Lock,
    title: "Owner",
    description: "Complete control over the workspace",
    permissions: ["All Admin permissions", "Billing management", "Delete workspace"],
  },
];

const teamBenefits = [
  "Shared workspaces for all your projects",
  "Automatic sync with Git repositories",
  "Protected production environments",
  "Deployment approval workflows",
  "SSO and SAML for enterprise teams",
  "Detailed activity audit logs",
  "Custom environment variables per team",
  "Shared component libraries",
];

export default function TeamsSolutionPage() {
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
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Teams
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Ship faster as a team
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Collaborate seamlessly with powerful workflows, role-based permissions, 
              and real-time previews. Built for teams that move fast.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/pricing">View team plans</Link>
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
              Built for team collaboration
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Everything your team needs to build, review, and deploy together.
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

      {/* Workflow */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Streamlined deployment workflow
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              From code to production in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {workflowSteps.map((step, index) => (
              <Card key={step.step} className="bg-card/60 border-border/50 relative">
                <CardContent className="p-6">
                  <span className="text-5xl font-bold text-accent/20 absolute top-4 right-4">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mb-2 relative">
                    {step.title}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed relative">
                    {step.description}
                  </p>
                </CardContent>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-foreground/20">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Flexible role-based access
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Give everyone the right level of access for their role.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {roles.map((role) => (
              <Card key={role.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <role.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {role.title}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-4">
                    {role.description}
                  </p>
                  <ul className="space-y-2">
                    {role.permissions.map((permission) => (
                      <li key={permission} className="flex items-start gap-2 text-xs text-foreground/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        {permission}
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
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Why teams choose Ovmon
              </h2>
              <p className="text-foreground/60">
                Join thousands of teams shipping better software, faster.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {teamBenefits.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-lg bg-card/40 border border-border/40">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                  Enterprise Ready
                </Badge>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                  Built for scale
                </h2>
                <p className="text-foreground/60 mb-6 leading-relaxed">
                  For larger organizations with advanced security and compliance needs, 
                  our Enterprise plan offers additional features and dedicated support.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Single Sign-On (SSO) with SAML",
                    "Advanced audit logging",
                    "Custom SLAs and uptime guarantees",
                    "Dedicated customer success manager",
                    "Priority support queue",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                  <Link href="/solutions/enterprise">
                    Learn about Enterprise
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <Card className="bg-gradient-to-br from-blue-500/10 via-accent/5 to-transparent border-accent/20">
                <CardContent className="p-8">
                  <FolderKanban className="w-12 h-12 text-accent mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Team Plan Includes
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Unlimited team members",
                      "Unlimited preview deployments",
                      "Protected branches",
                      "Team analytics dashboard",
                      "Priority email support",
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
              <Users className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to supercharge your team?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Join thousands of teams building and deploying faster with Ovmon.
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
