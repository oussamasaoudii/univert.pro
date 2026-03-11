'use client';

import { LegalLayout } from '@/components/legal/legal-layout';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: 'Introduction',
    content: `At Ovmon, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.`
  },
  {
    title: 'Information We Collect',
    subsections: [
      {
        subtitle: 'Personal Information',
        content: 'We collect information that you voluntarily provide when registering for an account, including your name, email address, phone number, billing information, and company details.'
      },
      {
        subtitle: 'Usage Data',
        content: 'We automatically collect information about your interaction with our platform, including IP address, browser type, pages visited, time spent, and referring/exit pages.'
      },
      {
        subtitle: 'Cookies and Tracking',
        content: 'We use cookies, web beacons, and similar tracking technologies to enhance your experience and gather analytics about how our platform is used.'
      }
    ]
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect for various purposes:
    • To provide, maintain, and improve our services
    • To process transactions and send related information
    • To send promotional communications (with your consent)
    • To monitor and analyze trends and usage
    • To detect and prevent fraud or security issues
    • To comply with legal obligations`
  },
  {
    title: 'Data Security',
    content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit using SSL/TLS protocols and at rest using industry-standard encryption.'
  },
  {
    title: 'Data Retention',
    content: 'We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your data at any time, subject to certain legal obligations.'
  },
  {
    title: 'Third-Party Sharing',
    content: 'We do not sell or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and conducting our business, all of whom are bound by confidentiality agreements.'
  },
  {
    title: 'Your Rights and Choices',
    content: `You have the right to:
    • Access your personal information
    • Correct inaccurate information
    • Request deletion of your data
    • Opt-out of marketing communications
    • Request a copy of your data (data portability)
    • Lodge complaints with relevant authorities`
  },
  {
    title: 'International Data Transfer',
    content: 'Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your country of residence. By using our platform, you consent to such transfers.'
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date above.'
  },
  {
    title: 'Contact Us',
    content: 'If you have any questions about this Privacy Policy or our privacy practices, please contact us at privacy@ovmon.com or through our contact form.'
  }
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="Learn how we collect, use, and protect your personal information at Ovmon"
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
