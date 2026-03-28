'use client';

import { LegalLayout } from '@/components/legal/legal-layout';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: 'Introduction',
    content: `At Univert, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our managed website platform.`
  },
  {
    title: 'Information We Collect',
    subsections: [
      {
        subtitle: 'Account Information',
        content: 'When you create an account, we collect information you provide, including your name, email address, and billing information necessary to process your subscription.'
      },
      {
        subtitle: 'Website Content',
        content: 'We store the content, files, and data associated with your Univert-hosted website. This content remains your property and can be exported upon request.'
      },
      {
        subtitle: 'Usage Information',
        content: 'We collect information about how you interact with our platform, including pages visited, features used, and technical information like browser type and IP address.'
      }
    ]
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to:
    • Provide, maintain, and improve our platform and services
    • Process your subscription payments
    • Send important service-related communications
    • Respond to your support requests
    • Protect against fraud and unauthorized access
    • Comply with legal obligations`
  },
  {
    title: 'Data Security',
    content: 'We implement security measures to protect your information. All data transmitted to our platform is encrypted using SSL/TLS. We use secure hosting infrastructure and regularly review our security practices.'
  },
  {
    title: 'Data Retention',
    content: 'We retain your information for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time. Some information may be retained as required by law or for legitimate business purposes.'
  },
  {
    title: 'Third-Party Services',
    content: 'We may use third-party services for payment processing, hosting infrastructure, and analytics. These service providers have access to your information only as necessary to perform their functions and are bound by contractual obligations to protect your data.'
  },
  {
    title: 'Your Rights',
    content: `You have the right to:
    • Access the information we hold about you
    • Correct inaccurate information
    • Request deletion of your data
    • Export your website content
    • Opt out of promotional communications
    
Contact us to exercise these rights.`
  },
  {
    title: 'Cookies',
    content: 'We use cookies and similar technologies to maintain your session, remember your preferences, and understand how you use our platform. You can control cookies through your browser settings, though this may affect functionality.'
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our platform or sending you an email. Your continued use of our services after changes take effect constitutes acceptance of the updated policy.'
  },
  {
    title: 'Contact Us',
    content: 'If you have questions about this Privacy Policy or our privacy practices, please contact us through our contact page or support channels.'
  }
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How we collect, use, and protect your information at Univert"
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
