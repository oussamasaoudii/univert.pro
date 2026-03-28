import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Mail, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Contact Us - Univert',
  description: 'Get in touch with the Univert team. We are here to help with questions about our managed website platform.'
};

export default function ContactPage() {
  const contactOptions = [
    {
      icon: FileText,
      title: 'Support Request',
      description: 'Submit a support ticket for technical issues or account questions',
      action: 'Submit a Request',
      href: '/support'
    },
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Find answers to common questions about templates, domains, and setup',
      action: 'Browse Help Center',
      href: '/help-center'
    }
  ];

  return (
    <MarketingLayout
      title="Contact Us"
      description="Questions about Univert? We are here to help."
    >
      {/* Contact Options */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contactOptions.map((option, idx) => {
          const Icon = option.icon;
          return (
            <Link
              key={idx}
              href={option.href}
              className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
            >
              <Icon className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
              <span className="inline-flex items-center text-accent font-medium text-sm">
                {option.action}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          );
        })}
      </section>

      {/* Contact Form Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Send us a Message</h2>
          <p className="text-muted-foreground">
            Have a question about our platform, pricing, or how Univert can help your business? 
            Fill out the form below and our team will respond.
          </p>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="inquiry-type" className="text-sm font-medium">
              Inquiry Type
            </label>
            <select
              id="inquiry-type"
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:border-accent"
            >
              <option value="">Select an option</option>
              <option value="general">General Question</option>
              <option value="pricing">Pricing Inquiry</option>
              <option value="templates">Template Question</option>
              <option value="support">Support Request</option>
              <option value="partnership">Partnership Inquiry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              placeholder="Tell us how we can help..."
              rows={6}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <Button className="w-full">Send Message</Button>
        </form>
      </section>

      {/* Response Expectations */}
      <section className="p-6 rounded-lg border border-border bg-secondary/30">
        <div className="flex items-start gap-4">
          <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">What to Expect</h3>
            <p className="text-sm text-muted-foreground">
              Our team reviews incoming messages during business hours and typically responds within 
              1-2 business days. For urgent support issues, we recommend using the support request 
              form in your dashboard for faster routing.
            </p>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="space-y-6 pt-4">
        <h2 className="text-2xl font-bold">Common Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'How do I get started with Univert?',
              a: 'Browse our templates to find a design that fits your business. Once you select a template and sign up, our team handles the technical setup.'
            },
            {
              q: 'What is included in the monthly price?',
              a: 'Each plan includes managed hosting, SSL certificates, and access to our support team. Template-specific features are listed on each template page.'
            },
            {
              q: 'Can I use my own domain name?',
              a: 'Yes. You can connect your own domain to your Univert website. We provide setup instructions and can help with DNS configuration if needed.'
            },
            {
              q: 'Do you offer refunds?',
              a: 'Our refund policy is outlined in our terms of service. If you have concerns about your purchase, please contact us and we will do our best to help.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-background">
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="pt-2">
          <Button variant="outline" asChild>
            <Link href="/help-center">
              More Questions? Visit Help Center
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
