import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { 
  Palette, 
  Globe, 
  Clock, 
  Headphones, 
  Key, 
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Mail,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Help Center - Univert',
  description: 'Get answers to common questions about templates, domains, setup, support, and ownership at Univert.'
};

export default function HelpCenterPage() {
  const helpSections = [
    {
      icon: Palette,
      title: 'Choosing Your Template',
      description: 'Find the right starting point for your business website',
      content: [
        'Browse our template gallery to see real examples of each design',
        'Filter by category (store, business, portfolio, landing page, blog)',
        'Filter by technology stack if you have preferences',
        'Each template shows what is included and the starting monthly price',
        'Use the live demo to see exactly how the template looks and works'
      ]
    },
    {
      icon: Globe,
      title: 'Custom Domains',
      description: 'Connect your own domain name to your website',
      content: [
        'You can use your own domain (like yourbusiness.com) with your Univert website',
        'We provide clear DNS setup instructions when you are ready',
        'SSL certificates (HTTPS) are automatically included at no extra cost',
        'Domain verification typically completes within minutes',
        'Our team can help if you need assistance with DNS configuration'
      ]
    },
    {
      icon: Clock,
      title: 'Setup and Launch Timeline',
      description: 'What to expect during the setup process',
      content: [
        'After you select a template, our team begins setting up your website',
        'Setup time varies based on template complexity and customization needs',
        'You will receive access credentials when your website is ready',
        'We notify you at each stage of the setup process',
        'Most websites are ready within a few business days'
      ]
    },
    {
      icon: Headphones,
      title: 'Support Included',
      description: 'How we help you after launch',
      content: [
        'Every plan includes access to our support team',
        'Submit support requests through your dashboard or contact form',
        'We help with technical issues, updates, and general questions',
        'Domain and DNS assistance is included',
        'Our team responds to requests during business hours'
      ]
    },
    {
      icon: Key,
      title: 'Ownership and Export',
      description: 'Your website, your data, your choice',
      content: [
        'You own your website content and can request a full export anytime',
        'We do not lock you in - you can migrate away if you choose',
        'Export includes your files, content, and database (where applicable)',
        'We provide clear documentation to help with any migration',
        'Contact support to request an export or discuss migration options'
      ]
    }
  ];

  const commonQuestions = [
    {
      question: 'Do I need technical knowledge to use Univert?',
      answer: 'No. Univert is a managed website platform. We handle the technical setup, hosting, and maintenance. You focus on your business.'
    },
    {
      question: 'What is included in the monthly price?',
      answer: 'Your monthly plan includes hosting, SSL certificate, support access, and ongoing maintenance. Template-specific features are listed on each template page.'
    },
    {
      question: 'Can I change my template later?',
      answer: 'Changing templates after launch may require setup work. Contact our support team to discuss your options and any associated costs.'
    },
    {
      question: 'How do I get my login credentials?',
      answer: 'Once your website setup is complete, you will receive your login credentials via email and they will appear in your dashboard.'
    },
    {
      question: 'What if I need help with my domain?',
      answer: 'Our support team can guide you through DNS setup. If you do not have a domain yet, you can start with a Univert subdomain while you decide.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes. You can cancel anytime. Your website will remain active until the end of your billing period. You can request an export of your content before canceling.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Refund policies are detailed in our terms of service. Contact support if you have concerns about your purchase.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can submit a support request through your dashboard, use our contact form, or email our support team directly.'
    }
  ];

  return (
    <MarketingLayout
      title="Help Center"
      description="Answers to common questions about your Univert website"
    >
      {/* Help Sections */}
      <section className="space-y-8">
        {helpSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-3 ml-16">
                {section.content.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3 text-foreground/80">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Common Questions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Common Questions</h2>
        </div>
        <div className="space-y-4">
          {commonQuestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-background">
              <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/templates"
            className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
          >
            <Palette className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-1">Browse Templates</h3>
            <p className="text-sm text-muted-foreground">Explore our template gallery</p>
          </Link>
          <Link
            href="/support"
            className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
          >
            <Headphones className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-1">Contact Support</h3>
            <p className="text-sm text-muted-foreground">Get help from our team</p>
          </Link>
          <Link
            href="/about/ownership"
            className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
          >
            <Key className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-1">Ownership Info</h3>
            <p className="text-sm text-muted-foreground">Learn about data ownership</p>
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="p-8 rounded-lg border border-border bg-gradient-to-br from-accent/10 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Mail className="w-10 h-10 text-accent flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Still have questions?</h2>
              <p className="text-muted-foreground">
                Our support team is here to help. Reach out and we will get back to you.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button asChild>
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/support">
                <FileText className="mr-2 h-4 w-4" />
                Support Options
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
