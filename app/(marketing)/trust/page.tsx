import { Metadata } from 'next';
import {
  HeroSection,
  TrustMetrics,
  FeatureShowcase,
  ComparisonTable,
  BenefitsGrid,
  FAQSection,
  CTABand,
  TestimonialSection,
} from '@/components/marketing/sections';

export const metadata: Metadata = {
  title: 'Trust & Security - Ovmon',
  description: 'Learn about Ovmon\'s enterprise-grade security, compliance certifications, and commitment to protecting your data.',
};

// Security features
const securityFeatures = [
  {
    iconName: 'Shield' as const,
    title: 'SOC2 Type II Certified',
    description: 'Independently audited security controls with annual assessments by third-party auditors.',
    stat: 'SOC2',
    statLabel: 'Certified',
    highlight: true,
  },
  {
    iconName: 'Lock' as const,
    title: 'DDoS Protection',
    description: 'Enterprise-grade protection against distributed denial-of-service attacks included by default.',
    stat: '10Tbps',
    statLabel: 'Mitigation',
  },
  {
    iconName: 'Globe' as const,
    title: 'Web Application Firewall',
    description: 'Advanced WAF rules protect against OWASP Top 10 vulnerabilities and zero-day threats.',
    stat: '24/7',
    statLabel: 'Protection',
  },
  {
    iconName: 'Lock' as const,
    title: 'Automatic SSL/TLS',
    description: 'Free SSL certificates with automatic renewal and support for custom certificates.',
    stat: 'TLS 1.3',
    statLabel: 'Latest Standard',
  },
];

// Trust metrics
const trustItems = [
  { iconName: 'Shield' as const, label: 'SOC2 Type II', sublabel: 'Certified', description: 'Annual security audits' },
  { iconName: 'Server' as const, label: '99.99%', sublabel: 'Uptime SLA', description: 'Financial guarantee' },
  { iconName: 'Globe' as const, label: '150+', sublabel: 'Edge Locations', description: 'Global coverage' },
  { iconName: 'Lock' as const, label: 'Zero', sublabel: 'Data Breaches', description: 'Security first' },
];

// Compliance certifications
const complianceBenefits = [
  {
    iconName: 'Check' as const,
    title: 'SOC2 Type II',
    description: 'Comprehensive security controls audited annually by independent assessors.',
  },
  {
    iconName: 'Shield' as const,
    title: 'GDPR Compliant',
    description: 'Full compliance with EU data protection regulations and data residency options.',
  },
  {
    iconName: 'Server' as const,
    title: 'HIPAA Ready',
    description: 'BAA agreements available for healthcare organizations handling PHI.',
  },
  {
    iconName: 'Lock' as const,
    title: 'PCI DSS',
    description: 'Payment card industry compliance for e-commerce and payment processing.',
  },
  {
    iconName: 'Shield' as const,
    title: 'Privacy Shield',
    description: 'EU-US and Swiss-US Privacy Shield framework compliance.',
  },
  {
    iconName: 'Lock' as const,
    title: 'ISO 27001',
    description: 'Information security management system certification in progress.',
  },
];

// Infrastructure security
const infrastructureSecurity = [
  {
    iconName: 'Server' as const,
    title: 'Encrypted at Rest',
    description: 'All data encrypted using AES-256 encryption at rest.',
  },
  {
    iconName: 'Lock' as const,
    title: 'Encrypted in Transit',
    description: 'TLS 1.3 encryption for all data in transit with perfect forward secrecy.',
  },
  {
    iconName: 'Lock' as const,
    title: 'Key Management',
    description: 'Hardware security modules (HSM) for cryptographic key management.',
  },
  {
    iconName: 'Shield' as const,
    title: 'Access Controls',
    description: 'Role-based access with multi-factor authentication and audit logging.',
  },
  {
    iconName: 'Shield' as const,
    title: 'Intrusion Detection',
    description: 'Real-time monitoring and automated threat detection systems.',
  },
  {
    iconName: 'Clock' as const,
    title: 'Incident Response',
    description: '24/7 security team with defined incident response procedures.',
  },
];

// Comparison data
const securityComparison = {
  columns: [
    { name: 'Security Feature', highlighted: false },
    { name: 'Ovmon', highlighted: true },
    { name: 'Industry Standard', highlighted: false },
  ],
  rows: [
    { feature: 'SOC2 Type II Certified', values: [true, 'partial'] },
    { feature: 'DDoS Protection (10+ Tbps)', values: [true, 'Paid addon'] },
    { feature: 'Web Application Firewall', values: [true, 'Paid addon'] },
    { feature: 'Automatic SSL/TLS', values: [true, true] },
    { feature: 'GDPR Compliance', values: [true, 'partial'] },
    { feature: 'HIPAA BAA Available', values: [true, false] },
    { feature: 'Data Encryption (at rest)', values: [true, true] },
    { feature: 'Data Encryption (in transit)', values: [true, true] },
    { feature: '99.99% Uptime SLA', values: [true, false] },
    { feature: '24/7 Security Monitoring', values: [true, 'partial'] },
  ],
};

// FAQ
const securityFAQs = [
  {
    question: 'What certifications does Ovmon hold?',
    answer: 'Ovmon is SOC2 Type II certified with annual audits by independent third-party assessors. We are also GDPR compliant and offer HIPAA BAA agreements for healthcare customers.',
  },
  {
    question: 'How is my data protected?',
    answer: 'All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We use hardware security modules for key management and implement strict access controls with multi-factor authentication.',
  },
  {
    question: 'What happens if there is a security incident?',
    answer: 'We have a dedicated 24/7 security team with defined incident response procedures. Affected customers are notified promptly, and we provide full transparency about the nature and scope of any incidents.',
  },
  {
    question: 'Can I get a copy of your SOC2 report?',
    answer: 'Yes, SOC2 Type II reports are available to customers and prospects under NDA. Contact our sales team to request access.',
  },
  {
    question: 'Do you offer data residency options?',
    answer: 'Yes, we offer data residency options for customers who need to keep data in specific geographic regions for compliance reasons. Contact sales for available regions.',
  },
  {
    question: 'How do you handle vulnerabilities?',
    answer: 'We maintain a responsible disclosure program and regularly conduct penetration testing. Critical vulnerabilities are patched within 24 hours, and we provide timely security advisories to customers.',
  },
];

// Testimonials
const securityTestimonials = [
  {
    quote: 'The security infrastructure at Ovmon exceeded our compliance requirements. Their SOC2 certification and HIPAA readiness made the decision easy for our healthcare platform.',
    author: {
      name: 'Dr. James Morrison',
      title: 'CTO',
      company: 'HealthTech Solutions',
    },
    rating: 5,
    featured: true,
  },
  {
    quote: 'As a fintech company, security is non-negotiable. Ovmon\'s enterprise security features and dedicated support gave us confidence in our deployment.',
    author: {
      name: 'Sarah Kim',
      title: 'Security Director',
      company: 'PaySecure',
    },
    rating: 5,
  },
];

export default function TrustPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: 'Trust & Security', iconName: 'Shield' }}
        title="Security you can"
        titleHighlight="trust"
        description="Enterprise-grade security, compliance certifications, and a commitment to protecting your data. Your security is our priority."
        actions={[
          { label: 'View Security Docs', href: '/docs/security', variant: 'primary' },
          { label: 'Contact Security Team', href: '/contact', variant: 'outline' },
        ]}
        variant="centered"
        backgroundVariant="gradient"
      />

      {/* Trust Metrics */}
      <TrustMetrics
        items={trustItems}
        variant="cards"
        badge="Security Credentials"
        title="Industry-leading security"
        description="Built from the ground up with security as a core principle."
      />

      {/* Core Security Features */}
      <FeatureShowcase
        badge="Security Features"
        title="Comprehensive protection"
        description="Multiple layers of security to protect your applications and data."
        features={securityFeatures}
        variant="bento"
      />

      {/* Compliance Certifications */}
      <section className="bg-secondary/20">
        <BenefitsGrid
          badge="Compliance"
          title="Compliance certifications"
          description="Meeting the highest standards of security and data protection."
          benefits={complianceBenefits}
          variant="cards"
          columns={3}
        />
      </section>

      {/* Infrastructure Security */}
      <BenefitsGrid
        badge="Infrastructure"
        title="Infrastructure security"
        description="Defense in depth approach to protecting your data at every layer."
        benefits={infrastructureSecurity}
        variant="icons"
        columns={3}
      />

      {/* Security Comparison */}
      <ComparisonTable
        badge="Comparison"
        title="How our security compares"
        description="See how Ovmon's security measures stack up against industry standards."
        columns={securityComparison.columns}
        rows={securityComparison.rows}
        variant="default"
      />

      {/* Testimonials */}
      <TestimonialSection
        badge="Customer Stories"
        title="Trusted by security-conscious organizations"
        description="Learn how companies rely on Ovmon for their security needs."
        testimonials={securityTestimonials}
        variant="featured"
      />

      {/* FAQ */}
      <FAQSection
        badge="Security FAQ"
        title="Frequently asked questions"
        description="Common questions about our security practices and compliance."
        faqs={securityFAQs}
        variant="default"
      />

      {/* CTA */}
      <CTABand
        title="Ready to deploy with confidence?"
        description="Join thousands of security-conscious organizations building on Ovmon."
        actions={[
          { label: 'Start Building Free', href: '/auth/signup', variant: 'primary' },
          { label: 'Request SOC2 Report', href: '/contact', variant: 'outline' },
        ]}
        variant="gradient"
      />
    </main>
  );
}
