import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Building2,
  Shield,
  Globe,
  Server,
  Lock,
  HeadphonesIcon,
  FileCheck,
  Users,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise Solutions - Ovmon",
  description: "Enterprise-grade security, compliance, and support. Built for organizations with demanding requirements.",
};

const features = [
  {
    icon: Shield,
    title: "SOC2 Type II certified",
    description: "Annual third-party audits verify our security controls. Your data is protected by industry-leading practices.",
  },
  {
    icon: Lock,
    title: "Advanced security",
    description: "Enterprise SSO, SAML, custom security policies, and IP allowlisting. Full control over access and authentication.",
  },
  {
    icon: FileCheck,
    title: "Compliance ready",
    description: "GDPR, HIPAA, and PCI DSS compliant infrastructure. Meet your regulatory requirements with confidence.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated support",
    description: "24/7 priority support with dedicated account managers. Get expert help when you need it most.",
  },
  {
    icon: Globe,
    title: "Private network",
    description: "Deploy to private edge locations with custom routing. Keep your traffic isolated and secure.",
  },
  {
    icon: Server,
    title: "Custom SLAs",
    description: "Tailored service level agreements with financial backing. Guarantees that match your business needs.",
  },
];

const metrics = [
  { value: "99.99%", label: "Uptime SLA with financial backing" },
  { value: "SOC2", label: "Type II Certified" },
  { value: "24/7", label: "Dedicated support" },
  { value: "GDPR", label: "Fully compliant" },
];

const securityFeatures = [
  "Single Sign-On (SSO) with SAML 2.0 and OIDC",
  "Role-based access control with custom permissions",
  "Audit logs with 90-day retention",
  "IP allowlisting and network restrictions",
  "Custom security headers and policies",
  "Encrypted data at rest and in transit",
  "Vulnerability scanning and penetration testing",
  "Incident response SLA within 15 minutes",
];

export default function EnterpriseSolutionPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/solutions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowRight className="w-4 h-4 rotate-180" />
              All solutions
            </Link>
            <Badge variant="outline" className="mb-6 border-purple-500/50 text-purple-500">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              Enterprise
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Enterprise-grade infrastructure
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Security, compliance, and reliability that meets the most demanding enterprise requirements. 
              Dedicated support and custom SLAs included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/contact">
                  Contact sales
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/security">View security</Link>
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
              Built for enterprise
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              The security, compliance, and support your organization demands.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-purple-500" />
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

      {/* Security Features */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Enterprise security features
              </h2>
              <p className="text-foreground/60">
                Comprehensive security controls to protect your organization.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {securityFeatures.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-lg bg-card/40 border border-border/40">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Support */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                  Dedicated enterprise support
                </h2>
                <p className="text-foreground/60 mb-6 leading-relaxed">
                  Your success is our priority. Enterprise customers receive dedicated account 
                  management, priority support, and direct access to our engineering team.
                </p>
                <ul className="space-y-3">
                  {[
                    "Dedicated account manager",
                    "24/7 priority support with 15-minute response SLA",
                    "Quarterly business reviews",
                    "Architecture and migration assistance",
                    "Early access to new features",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="bg-card/60 border-border/50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Enterprise Plan Includes
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Unlimited team members",
                      "Custom bandwidth and build minutes",
                      "Private edge deployments",
                      "SAML SSO and advanced security",
                      "Custom contracts and billing",
                      "99.99% uptime SLA",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" size="lg" asChild>
                    <Link href="/contact">Contact sales</Link>
                  </Button>
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
                Ready to discuss your needs?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Our enterprise team is ready to help you evaluate Ovmon for your organization.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                  <Link href="/contact">
                    Contact sales
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                  <Link href="/case-studies">View case studies</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
