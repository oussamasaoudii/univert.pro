import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Contact Us - Ovmon',
  description: 'Get in touch with the Ovmon team. We\'re here to help with questions, feedback, or support.'
};

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      description: 'Send us a message anytime',
      contact: 'hello@ovmon.com',
      href: 'mailto:hello@ovmon.com'
    },
    {
      icon: MessageSquare,
      title: 'Support Chat',
      description: 'Live chat during business hours',
      contact: 'Available 9am-6pm EST',
      href: '#'
    },
    {
      icon: Phone,
      title: 'Phone',
      description: 'Speak with our team directly',
      contact: '+1 (555) 123-4567',
      href: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Address',
      description: 'Our headquarters',
      contact: 'San Francisco, CA 94107',
      href: '#'
    }
  ];

  return (
    <MarketingLayout
      title="Contact Us"
      description="Get in touch with the Ovmon team. We're here to help."
    >
      {/* Quick Contact Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contactMethods.map((method, idx) => {
          const Icon = method.icon;
          return (
            <a
              key={idx}
              href={method.href}
              className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
            >
              <Icon className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-1">{method.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
              <p className="font-medium text-foreground">{method.contact}</p>
            </a>
          );
        })}
      </section>

      {/* Contact Form Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Send us a Message</h2>
          <p className="text-muted-foreground">
            Fill out the form below and we'll get back to you as soon as possible.
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
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              placeholder="How can we help?"
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              placeholder="Tell us more about your inquiry..."
              rows={6}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <Button className="w-full">Send Message</Button>
        </form>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6 pt-8">
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'What is the typical response time?',
              a: 'We aim to respond to all inquiries within 24 business hours. Premium support members receive priority responses.'
            },
            {
              q: 'Do you offer phone support?',
              a: 'Yes, phone support is available for Enterprise customers. Contact our sales team for details.'
            },
            {
              q: 'Can I schedule a demo?',
              a: 'Absolutely! Schedule a demo with our team by emailing hello@ovmon.com or using our live chat.'
            },
            {
              q: 'What are your support hours?',
              a: 'Our team is available 9am-6pm EST Monday through Friday. For urgent issues, check our status page.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50">
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
