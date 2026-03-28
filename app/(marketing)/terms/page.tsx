import { LegalLayout } from '@/components/legal/legal-layout';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: 'Agreement to Terms',
    content: 'By accessing and using the Univert platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
  },
  {
    title: 'Description of Service',
    content: 'Univert provides a managed website platform that includes website templates, hosting, and support services. We set up and host your website based on your selected template and subscription plan.'
  },
  {
    title: 'Account Responsibilities',
    subsections: [
      {
        subtitle: 'Account Security',
        content: 'You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. Notify us immediately if you become aware of any unauthorized use.'
      },
      {
        subtitle: 'Accurate Information',
        content: 'You agree to provide accurate and complete information when creating your account and to keep this information up to date.'
      },
      {
        subtitle: 'Acceptable Use',
        content: 'You agree not to use our platform for any unlawful purposes or to host content that is illegal, harmful, threatening, defamatory, obscene, or otherwise objectionable.'
      }
    ]
  },
  {
    title: 'Content Ownership',
    content: 'You retain ownership of the content you create and upload to your Univert website. By using our service, you grant us a license to host, display, and transmit your content as necessary to provide our services. You can request an export of your content at any time.'
  },
  {
    title: 'Template Licensing',
    content: 'Templates provided by Univert are licensed for use within our platform. Your license to use a template is tied to your active subscription. Templates may not be extracted, redistributed, or used outside of the Univert platform without explicit permission.'
  },
  {
    title: 'Payment and Billing',
    subsections: [
      {
        subtitle: 'Subscription Fees',
        content: 'You agree to pay the subscription fees associated with your selected plan. Fees are billed in advance on a recurring basis according to your billing cycle.'
      },
      {
        subtitle: 'Price Changes',
        content: 'We may change our pricing with notice to you. Price changes will take effect at the start of your next billing cycle after notice is given.'
      },
      {
        subtitle: 'Refunds',
        content: 'Refunds may be provided at our discretion. Contact support if you have concerns about your purchase.'
      }
    ]
  },
  {
    title: 'Cancellation',
    content: 'You may cancel your subscription at any time. Your website will remain active until the end of your current billing period. You may request an export of your content before cancellation. We are not obligated to maintain your website or data after your subscription ends.'
  },
  {
    title: 'Service Availability',
    content: 'We strive to provide reliable service but do not guarantee uninterrupted access to our platform. We may perform maintenance or updates that temporarily affect availability. We will try to provide notice of planned maintenance when possible.'
  },
  {
    title: 'Limitation of Liability',
    content: 'To the maximum extent permitted by law, Univert shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.'
  },
  {
    title: 'Modifications to Service',
    content: 'We reserve the right to modify, suspend, or discontinue any part of our services at any time. We will provide reasonable notice of significant changes that affect your use of the platform.'
  },
  {
    title: 'Termination',
    content: 'We may suspend or terminate your account if you violate these terms or engage in activity that harms our platform or other users. In such cases, you may not be entitled to a refund. You may request an export of your content unless termination was due to illegal activity.'
  },
  {
    title: 'Changes to Terms',
    content: 'We may update these Terms of Service from time to time. We will notify you of significant changes. Your continued use of our services after changes take effect constitutes acceptance of the updated terms.'
  },
  {
    title: 'Contact',
    content: 'If you have questions about these Terms of Service, please contact us through our contact page.'
  }
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Please read these terms carefully before using the Univert platform"
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
