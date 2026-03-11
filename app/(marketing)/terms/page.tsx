import { LegalLayout } from '@/components/legal/legal-layout';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: 'Agreement to Terms',
    content: 'By accessing and using the Ovmon platform, you accept and agree to be bound by and comply with these Terms of Service. If you do not agree to abide by the above, please do not use this service.'
  },
  {
    title: 'License to Use Platform',
    content: 'Ovmon grants you a limited, non-exclusive, non-transferable license to access and use our platform for lawful purposes. You may not reproduce, distribute, transmit, display, or otherwise make available any content from our platform without our prior written consent.'
  },
  {
    title: 'User Responsibilities',
    subsections: [
      {
        subtitle: 'Account Security',
        content: 'You are responsible for maintaining the confidentiality of your account credentials and are fully responsible for all activities that occur under your account. You agree to notify Ovmon immediately of any unauthorized use of your account.'
      },
      {
        subtitle: 'Prohibited Content',
        content: 'You agree not to upload, post, or transmit any content that is unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable. This includes content that violates intellectual property rights or privacy laws.'
      },
      {
        subtitle: 'Compliance',
        content: 'You agree to comply with all applicable laws, regulations, and our policies when using our platform. Violation may result in immediate suspension or termination of your account.'
      }
    ]
  },
  {
    title: 'Intellectual Property Rights',
    content: 'All content provided on the Ovmon platform, including text, graphics, logos, images, and software, is the property of Ovmon or its content suppliers and is protected by international copyright laws. You retain ownership of any content you create, but grant Ovmon a license to use, display, and distribute such content.'
  },
  {
    title: 'Limitation of Liability',
    content: 'To the maximum extent permitted by law, Ovmon shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the platform, even if we have been advised of the possibility of such damages.'
  },
  {
    title: 'Indemnification',
    content: 'You agree to indemnify and hold harmless Ovmon and its officers, directors, employees, and agents from any claims, damages, or expenses arising out of your use of the platform, violation of these terms, or infringement of any intellectual property rights.'
  },
  {
    title: 'Modifications to Service',
    content: 'Ovmon reserves the right to modify or discontinue our services at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of our services.'
  },
  {
    title: 'Third-Party Links',
    content: 'Our platform may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of these external sites. Your use of third-party websites is subject to their terms of service and privacy policies.'
  },
  {
    title: 'Termination',
    content: 'Ovmon may terminate or suspend your account and access to our platform immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service. Upon termination, your right to use the platform will immediately cease.'
  },
  {
    title: 'Governing Law',
    content: 'These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Ovmon operates, without regard to its conflicts of law principles.'
  },
  {
    title: 'Dispute Resolution',
    content: 'Any dispute arising out of or related to these Terms of Service shall be resolved through binding arbitration, except for disputes involving intellectual property rights or injunctive relief, which may be brought in court.'
  },
  {
    title: 'Entire Agreement',
    content: 'These Terms of Service constitute the entire agreement between you and Ovmon and supersede all prior and contemporaneous agreements, understandings, and negotiations, whether written or oral.'
  },
  {
    title: 'Changes to Terms',
    content: 'Ovmon reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to our website. Your continued use of the platform constitutes your acceptance of the modified terms.'
  },
  {
    title: 'Contact Information',
    content: 'If you have any questions about these Terms of Service, please contact us at legal@ovmon.com or through our contact form.'
  }
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Please read these terms carefully before using Ovmon's platform"
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
