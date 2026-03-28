import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { 
  HelpCircle, 
  FileText, 
  Globe, 
  Key, 
  Mail,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Support - Univert',
  description: 'Get help with your Univert website. Access support resources, submit requests, and find answers to common questions.'
};

export default function SupportPage() {
  const supportResources = [
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Answers to common questions about templates, domains, setup, and more',
      href: '/help-center'
    },
    {
      icon: Mail,
      title: 'Contact Us',
      description: 'Send a message to our team for general inquiries',
      href: '/contact'
    }
  ];

  const supportTopics = [
    {
      icon: Globe,
      title: 'Domain Help',
      description: 'Assistance with connecting your custom domain, DNS configuration, and SSL certificates',
      items: [
        'How to point your domain to Univert',
        'Understanding DNS records',
        'SSL certificate setup (automatic)',
        'Troubleshooting domain verification'
      ]
    },
    {
      icon: Key,
      title: 'Ownership and Export',
      description: 'Information about data ownership and how to export your website',
      items: [
        'Requesting a full website export',
        'Understanding what data you own',
        'Migration assistance if you decide to leave',
        'Cancellation process'
      ]
    },
    {
      icon: FileText,
      title: 'Account and Billing',
      description: 'Help with your account, subscription, and billing questions',
      items: [
        'Updating payment information',
        'Changing your subscription plan',
        'Understanding your invoice',
        'Accessing your account settings'
      ]
    }
  ];

  return (
    <MarketingLayout
      title="Support"
      description="Resources and help for your Univert website"
    >
      {/* Support Resources */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Get Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportResources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <Link
                key={idx}
                href={resource.href}
                className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
              >
                <Icon className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-1">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                <span className="inline-flex items-center text-accent font-medium text-sm">
                  Visit
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* For Existing Customers */}
      <section className="p-6 rounded-lg border border-accent/30 bg-accent/5">
        <h2 className="text-xl font-bold mb-4">Existing Customers</h2>
        <p className="text-muted-foreground mb-4">
          If you already have a Univert website, you can submit support requests directly from your dashboard. 
          This helps us route your request faster and gives our team context about your website.
        </p>
        <Button asChild>
          <Link href="/dashboard/support">
            Go to Dashboard Support
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Support Topics */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold">Support Topics</h2>
        {supportTopics.map((topic, idx) => {
          const Icon = topic.icon;
          return (
            <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>
              </div>
              <ul className="space-y-2 ml-16">
                {topic.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-center gap-3 text-foreground/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Response Times */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">What to Expect</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-background">
            <h3 className="font-semibold mb-2">Response Time</h3>
            <p className="text-sm text-muted-foreground">
              Our team responds to support requests during business hours. Most requests receive 
              a response within 1-2 business days.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-background">
            <h3 className="font-semibold mb-2">How We Help</h3>
            <p className="text-sm text-muted-foreground">
              We assist with technical issues, domain configuration, account questions, and 
              general guidance. For complex customizations, we may provide recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="p-8 rounded-lg border border-border bg-gradient-to-br from-secondary/50 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Still need help?</h2>
            <p className="text-muted-foreground">
              If you cannot find the answer you are looking for, reach out to our team directly.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button asChild>
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help-center">
                Help Center
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
