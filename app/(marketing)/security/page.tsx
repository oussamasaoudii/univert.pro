import { LegalLayout } from '@/components/legal/legal-layout';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: 'Security Commitment',
    content: 'At Ovmon, security is our highest priority. We have implemented comprehensive security measures to protect your data, infrastructure, and websites from unauthorized access, theft, and malicious activity. This Security Policy outlines our commitment and practices.'
  },
  {
    title: 'Infrastructure Security',
    subsections: [
      {
        subtitle: 'Data Centers',
        content: 'Our infrastructure is hosted in highly secure, SOC 2 Type II certified data centers with 24/7 physical security, surveillance, and access controls. All facilities meet strict security and compliance standards.'
      },
      {
        subtitle: 'Network Security',
        content: 'We employ advanced firewalls, intrusion detection systems (IDS), and DDoS protection to prevent unauthorized access and network attacks. All traffic is monitored and logged for security analysis.'
      },
      {
        subtitle: 'Redundancy and Backup',
        content: 'Your data is automatically replicated across multiple geographic locations with real-time backups. In case of disaster, we can restore service within minutes with zero data loss.'
      }
    ]
  },
  {
    title: 'Encryption',
    subsections: [
      {
        subtitle: 'In Transit',
        content: 'All data transmitted to and from our platform is encrypted using TLS 1.3 with 256-bit encryption. This includes all API communications and user uploads.'
      },
      {
        subtitle: 'At Rest',
        content: 'All stored data is encrypted using AES-256 encryption. Encryption keys are securely managed and rotated regularly according to industry best practices.'
      },
      {
        subtitle: 'End-to-End Encryption',
        content: 'Sensitive data such as API keys and authentication tokens are encrypted end-to-end, ensuring only authorized parties can access them.'
      }
    ]
  },
  {
    title: 'Access Control',
    content: 'We implement role-based access control (RBAC) with principle of least privilege. All access to systems is logged and monitored. Multi-factor authentication (MFA) is required for all administrative accounts.'
  },
  {
    title: 'Authentication & Authorization',
    subsections: [
      {
        subtitle: 'User Authentication',
        content: 'We support industry-standard authentication methods including password-based authentication with bcrypt hashing, OAuth 2.0, and SAML for enterprise customers.'
      },
      {
        subtitle: 'Multi-Factor Authentication',
        content: 'MFA is available for all user accounts and mandatory for administrative access. We support authenticator apps, hardware keys, and SMS-based verification.'
      },
      {
        subtitle: 'Session Management',
        content: 'Sessions are securely managed with HTTP-only cookies, short expiration times, and automatic logout after periods of inactivity.'
      }
    ]
  },
  {
    title: 'Vulnerability Management',
    content: 'We conduct regular security audits, penetration testing, and vulnerability assessments. We maintain a responsible disclosure program and respond to security issues within 24 hours.'
  },
  {
    title: 'Security Compliance',
    subsections: [
      {
        subtitle: 'Standards & Certifications',
        content: 'We comply with industry standards including OWASP Top 10, CWE/SANS Top 25, and maintain SOC 2 Type II certification. Enterprise customers can access our Security Assessment Report (SAR).'
      },
      {
        subtitle: 'Regulatory Compliance',
        content: 'We comply with GDPR, CCPA, HIPAA (upon request), and other regulatory frameworks relevant to our business and customer base.'
      },
      {
        subtitle: 'Industry Standards',
        content: 'We follow industry best practices from organizations including NIST, ISO 27001, and the Cloud Security Alliance (CSA).'
      }
    ]
  },
  {
    title: 'Incident Response',
    content: 'We maintain a 24/7 security operations center (SOC) to detect, respond to, and remediate security incidents. In case of a breach, we will notify affected customers within 48 hours with detailed information and remediation steps.'
  },
  {
    title: 'Employee Security',
    content: 'All employees undergo background checks and security training. We enforce strict confidentiality agreements and implement the principle of least privilege for system access. Employees with access to sensitive data are required to sign NDAs.'
  },
  {
    title: 'Dependency & Supply Chain Security',
    content: 'We regularly audit our third-party vendors and dependencies for security vulnerabilities. We maintain a Software Bill of Materials (SBOM) and track all library updates and patches.'
  },
  {
    title: 'Security Reporting',
    content: 'If you discover a security vulnerability, please report it responsibly to security@ovmon.com. Do not publicly disclose the vulnerability until we have had time to investigate and issue fixes.'
  },
  {
    title: 'Security Resources',
    subsections: [
      {
        subtitle: 'Security Documentation',
        content: 'Enterprise customers have access to detailed security documentation, architecture diagrams, and compliance reports.'
      },
      {
        subtitle: 'Security Advisories',
        content: 'We publish security advisories and patches regularly. Subscribe to our security mailing list to stay informed of important updates.'
      },
      {
        subtitle: 'Penetration Testing',
        content: 'Enterprise customers can request penetration testing on their hosted environments with prior approval and coordination with our security team.'
      }
    ]
  },
  {
    title: 'Contact Security Team',
    content: 'For security inquiries, responsible disclosure, or to request security documentation, please contact security@ovmon.com. For urgent security matters, call our security hotline (available to enterprise customers).'
  }
];

export default function SecurityPage() {
  return (
    <LegalLayout
      title="Security Policy"
      description="Learn about our comprehensive security practices and commitment to protecting your data"
      lastUpdated="March 2024"
    >
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
          
          {'subsections' in section ? (
            <div className="space-y-4">
              {section.subsections?.map((sub, subIdx) => (
                <div key={subIdx}>
                  <h3 className="text-lg font-semibold text-accent">{sub.subtitle}</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {sub.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
          )}
          
          {idx < sections.length - 1 && <Separator className="mt-8" />}
        </div>
      ))}
    </LegalLayout>
  );
}
