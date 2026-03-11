import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  Key,
  Eye,
  ArrowRight,
  Check,
  FileCheck,
  Server,
  Fingerprint,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Globe,
  Database
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security - Ovmon',
  description: 'Enterprise-grade security with SSL, DDoS protection, SOC2 compliance, and more.',
};

const securityFeatures = [
  {
    icon: Lock,
    title: 'Automatic SSL/TLS',
    description: 'Every deployment gets a free SSL certificate automatically provisioned and renewed.',
    details: ['Let\'s Encrypt certificates', 'Auto-renewal', 'HTTPS by default', 'HSTS support'],
  },
  {
    icon: Shield,
    title: 'DDoS Protection',
    description: 'Advanced protection against distributed denial-of-service attacks at the edge.',
    details: ['Layer 3/4 protection', 'Layer 7 filtering', 'Rate limiting', 'Bot detection'],
  },
  {
    icon: Key,
    title: 'Secret Management',
    description: 'Securely store and manage environment variables and API keys.',
    details: ['Encrypted at rest', 'Access controls', 'Audit logging', 'Version history'],
  },
  {
    icon: UserCheck,
    title: 'Access Control',
    description: 'Fine-grained permissions and role-based access for your team.',
    details: ['SSO/SAML', 'MFA support', 'Role-based access', 'IP allowlisting'],
  },
];

const certifications = [
  { name: 'SOC 2 Type II', description: 'Annual third-party audit' },
  { name: 'GDPR', description: 'EU data protection compliance' },
  { name: 'ISO 27001', description: 'Information security management' },
  { name: 'PCI DSS', description: 'Payment card industry standards' },
  { name: 'HIPAA', description: 'Healthcare data compliance' },
  { name: 'CCPA', description: 'California privacy compliance' },
];

const securityPractices = [
  {
    icon: Database,
    title: 'Data Encryption',
    description: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256).',
  },
  {
    icon: Eye,
    title: 'Continuous Monitoring',
    description: '24/7 security monitoring and automated threat detection.',
  },
  {
    icon: AlertTriangle,
    title: 'Incident Response',
    description: 'Dedicated security team with rapid response protocols.',
  },
  {
    icon: Fingerprint,
    title: 'Penetration Testing',
    description: 'Regular third-party security assessments and bug bounty program.',
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    description: 'Isolated compute environments with network segmentation.',
  },
  {
    icon: FileCheck,
    title: 'Audit Logs',
    description: 'Complete audit trail of all actions for compliance reporting.',
  },
];

export default function SecurityPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Security
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Enterprise-Grade{' '}
              <span className="text-accent">Security</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Bank-level security built into every layer. Protect your applications and data with industry-leading security measures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/security">
                  Security Overview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Security Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Security Features */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 mb-6">
                    <feature.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Check className="h-4 w-4 text-accent shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Certifications */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Compliance
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Certified & Compliant
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              We maintain the highest standards of security and compliance certifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {certifications.map((cert) => (
              <Card key={cert.name} className="bg-card/50 border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mx-auto mb-4">
                    <FileCheck className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Security Practices
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Security at Every Layer
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityPractices.map((practice) => (
              <Card key={practice.title} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <practice.icon className="h-6 w-6 text-accent mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{practice.title}</h3>
                  <p className="text-sm text-muted-foreground">{practice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Center */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                <Globe className="h-3 w-3 mr-1" />
                Trust Center
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Transparency & Trust
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                We believe in transparency. Visit our Trust Center for detailed security documentation, compliance reports, and real-time system status.
              </p>
              <ul className="space-y-3 mb-8">
                {['Security whitepapers', 'Compliance certificates', 'Penetration test summaries', 'Privacy documentation'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground/80">
                    <Check className="h-5 w-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/security">
                  Visit Trust Center
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-xl bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-accent/20 p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50 text-center">
                    <ShieldCheck className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="font-bold text-2xl text-foreground">99.99%</p>
                    <p className="text-xs text-muted-foreground">Uptime SLA</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50 text-center">
                    <Lock className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="font-bold text-2xl text-foreground">TLS 1.3</p>
                    <p className="text-xs text-muted-foreground">Encryption</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50 text-center">
                    <Eye className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="font-bold text-2xl text-foreground">24/7</p>
                    <p className="text-xs text-muted-foreground">Monitoring</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/80 border border-border/50 text-center">
                    <FileCheck className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="font-bold text-2xl text-foreground">SOC 2</p>
                    <p className="text-xs text-muted-foreground">Certified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Security Questions?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Our security team is here to help. Get in touch for security questionnaires, compliance documentation, or custom requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/contact">
                  Contact Security Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/security">Security Docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
