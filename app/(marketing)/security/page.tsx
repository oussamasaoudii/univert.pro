import { LegalLayout } from '@/components/legal/legal-layout';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: 'Our Approach to Security',
    content: 'At Univert, we take the security of your website and data seriously. This page outlines the security practices we follow to help protect your information and the websites we host.'
  },
  {
    title: 'Infrastructure',
    subsections: [
      {
        subtitle: 'Hosting',
        content: 'Your Univert website is hosted on modern cloud infrastructure with built-in redundancy. We use established hosting providers with strong security practices.'
      },
      {
        subtitle: 'Backups',
        content: 'We perform regular backups of hosted websites. Backup frequency and retention periods depend on your subscription plan.'
      }
    ]
  },
  {
    title: 'Encryption',
    subsections: [
      {
        subtitle: 'SSL/TLS Certificates',
        content: 'All Univert websites include SSL certificates at no additional cost. This encrypts data transmitted between your website and visitors, showing the secure padlock in browsers.'
      },
      {
        subtitle: 'Data in Transit',
        content: 'Communications between your browser and our platform are encrypted using industry-standard TLS encryption.'
      }
    ]
  },
  {
    title: 'Access Control',
    content: 'We implement access controls to protect your account and data. Only authorized team members have access to the systems necessary to provide our services. We encourage you to use strong, unique passwords for your Univert account.'
  },
  {
    title: 'Account Security',
    content: 'You are responsible for keeping your login credentials secure. We recommend using a strong password and not sharing your account access with unauthorized individuals. If you suspect unauthorized access to your account, please contact us immediately.'
  },
  {
    title: 'Vulnerability Management',
    content: 'We keep our systems and software up to date with security patches. We monitor for known vulnerabilities and address them as part of our regular maintenance.'
  },
  {
    title: 'What We Do Not Guarantee',
    content: 'While we implement reasonable security measures, no system is completely secure. We cannot guarantee that unauthorized access, hacking, data loss, or other breaches will never occur. We are not responsible for security issues caused by factors outside our control, such as weak passwords chosen by users or compromised devices.'
  },
  {
    title: 'Your Responsibilities',
    content: `As a Univert customer, you can help maintain security by:
    • Using a strong, unique password for your account
    • Not sharing your login credentials
    • Keeping your contact information up to date
    • Reporting any suspicious activity to us promptly
    • Ensuring any third-party integrations you add to your website follow good security practices`
  },
  {
    title: 'Reporting Security Issues',
    content: 'If you discover a security vulnerability or have concerns about the security of our platform, please contact us through our support channels. We appreciate responsible disclosure and will investigate reported issues.'
  },
  {
    title: 'Questions',
    content: 'If you have questions about our security practices, please contact us through our contact page. We are happy to provide additional information about how we protect your data.'
  }
];

export default function SecurityPage() {
  return (
    <LegalLayout
      title="Security"
      description="How we protect your website and data at Univert"
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
