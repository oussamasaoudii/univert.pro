import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Globe,
  Server,
  Shield,
  Zap,
  Database,
  Lock,
  CheckCircle2,
  Activity,
  Cloud,
  Network,
  HardDrive,
  Cpu,
  RefreshCw,
  FileCheck,
  Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Infrastructure & Trust - Ovmon",
  description: "Enterprise-grade infrastructure with global edge network, 99.99% uptime SLA, and comprehensive security. Learn how we keep your sites fast and secure.",
  robots: { index: false, follow: false },
};

const infrastructureFeatures = [
  {
    icon: Globe,
    title: "Global Edge Network",
    description: "150+ edge locations across 6 continents deliver your content with sub-50ms latency worldwide.",
    stat: "150+",
    statLabel: "Edge locations",
  },
  {
    icon: Zap,
    title: "Instant Deployments",
    description: "Atomic deployments complete in under 3 seconds. Every deployment is instantly available globally.",
    stat: "<3s",
    statLabel: "Deploy time",
  },
  {
    icon: Activity,
    title: "99.99% Uptime SLA",
    description: "Enterprise-grade reliability with automatic failover and redundant infrastructure across multiple regions.",
    stat: "99.99%",
    statLabel: "Uptime SLA",
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Automatic mitigation of DDoS attacks at the network edge. Your sites stay online even under attack.",
    stat: "10Tbps+",
    statLabel: "Attack mitigation",
  },
];

const securityFeatures = [
  {
    icon: Lock,
    title: "Automatic SSL/TLS",
    description: "Every deployment gets free SSL certificates with automatic renewal. TLS 1.3 encryption by default.",
  },
  {
    icon: Shield,
    title: "Web Application Firewall",
    description: "Enterprise WAF protects against OWASP Top 10 vulnerabilities, SQL injection, and XSS attacks.",
  },
  {
    icon: Eye,
    title: "Real-time Monitoring",
    description: "24/7 security monitoring with instant alerts. Detect and respond to threats before they impact users.",
  },
  {
    icon: FileCheck,
    title: "SOC 2 Type II Certified",
    description: "Independently audited security controls. Compliance reports available for enterprise customers.",
  },
];

const dataProtection = [
  {
    title: "Encryption at Rest",
    description: "All stored data encrypted with AES-256",
    icon: HardDrive,
  },
  {
    title: "Encryption in Transit",
    description: "TLS 1.3 for all data transmission",
    icon: Network,
  },
  {
    title: "Automated Backups",
    description: "Continuous backups with point-in-time recovery",
    icon: Database,
  },
  {
    title: "Data Residency",
    description: "Choose where your data is stored",
    icon: Globe,
  },
];

const complianceStandards = [
  { name: "SOC 2 Type II", description: "Security, availability, and confidentiality controls" },
  { name: "GDPR", description: "EU data protection compliance" },
  { name: "CCPA", description: "California privacy law compliance" },
  { name: "HIPAA", description: "Healthcare data protection (Enterprise)" },
  { name: "ISO 27001", description: "Information security management" },
  { name: "PCI DSS", description: "Payment card industry compliance" },
];

const networkArchitecture = [
  {
    icon: Cloud,
    title: "Multi-Cloud Infrastructure",
    description: "Deployed across AWS, Google Cloud, and Azure for maximum redundancy and availability.",
  },
  {
    icon: Server,
    title: "Auto-Scaling",
    description: "Automatically scale from zero to millions of requests. Pay only for what you use.",
  },
  {
    icon: RefreshCw,
    title: "Instant Rollbacks",
    description: "Every deployment is versioned. Roll back to any previous version with one click.",
  },
  {
    icon: Cpu,
    title: "Edge Functions",
    description: "Run serverless functions at the edge with zero cold starts and global distribution.",
  },
];

const trustMetrics = [
  { value: "10B+", label: "Requests served daily" },
  { value: "150+", label: "Global edge locations" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "24/7", label: "Security monitoring" },
];

export default function InfrastructurePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              Infrastructure & Trust
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Enterprise-grade infrastructure you can trust
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Built on a global network of 150+ edge locations with 99.99% uptime SLA. 
              Your sites are fast, secure, and always online.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/auth/signup">
                  Start building
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/security">View security policy</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="py-12 border-y border-border/50 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-accent mb-2">{metric.value}</p>
                <p className="text-sm text-foreground/60">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Features */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Global infrastructure at scale
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              The same infrastructure that powers the world&apos;s largest websites, available to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {infrastructureFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <div className="text-right">
                          <p className="text-xl font-bold text-accent">{feature.stat}</p>
                          <p className="text-xs text-foreground/50">{feature.statLabel}</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/60 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Network Architecture */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Network architecture
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Built for performance, reliability, and scale from the ground up.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {networkArchitecture.map((item) => (
              <Card key={item.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Security
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Security at every layer
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Enterprise-grade security measures to protect your applications and data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card/60 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-accent" />
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

      {/* Data Protection */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                  Data Protection
                </Badge>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                  Your data is protected
                </h2>
                <p className="text-foreground/60 mb-8 leading-relaxed">
                  We implement multiple layers of protection to ensure your data remains 
                  secure, available, and private. From encryption to backups, every aspect 
                  is designed with security in mind.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {dataProtection.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                        <p className="text-xs text-foreground/60">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Card className="bg-card/60 border-border/50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    Compliance & Certifications
                  </h3>
                  <div className="space-y-4">
                    {complianceStandards.map((standard) => (
                      <div key={standard.name} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground">{standard.name}</h4>
                          <p className="text-sm text-foreground/60">{standard.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Status Page */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Activity className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Real-time status monitoring
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Track the health of all Ovmon services in real-time. Subscribe to updates 
              and get notified of any incidents immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/status">
                  View status page
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/security">Security policy</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="container">
          <Card className="max-w-3xl mx-auto bg-card/80 border-border/50">
            <CardContent className="p-8 lg:p-12 text-center">
              <Shield className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to build on trusted infrastructure?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Join thousands of teams who trust Ovmon with their most critical applications.
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
