import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { CheckCircle, Users, Target, Zap } from 'lucide-react';

export const metadata = {
  title: 'About Ovmon - Website Hosting Platform',
  description: 'Learn about Ovmon, the modern platform for deploying and managing websites with integrated provisioning, monitoring, and domain management.'
};

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: 'Performance First',
      description: 'We optimize for speed and reliability at every layer of our platform.'
    },
    {
      icon: Users,
      title: 'Developer Friendly',
      description: 'Intuitive tools and comprehensive APIs designed for modern development workflows.'
    },
    {
      icon: Target,
      title: 'Mission Focused',
      description: 'We empower teams to deploy, monitor, and scale their applications effortlessly.'
    },
    {
      icon: CheckCircle,
      title: 'Reliability',
      description: 'Enterprise-grade infrastructure with 99.9% uptime SLA and 24/7 support.'
    }
  ];

  return (
    <MarketingLayout
      title="About Ovmon"
      description="Building the modern platform for website hosting and deployment"
    >
      {/* Story Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Our Story</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Ovmon was founded with a simple mission: to make website deployment and management accessible to
            developers of all skill levels. We recognized that the existing hosting landscape was fragmented,
            complex, and often required deep infrastructure knowledge.
          </p>
          <p>
            Today, we serve thousands of developers and businesses who trust us with their web applications.
            Our platform combines powerful automation with intuitive design, allowing teams to focus on what
            matters—building great products.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors">
                <Icon className="w-8 h-8 text-accent mb-3" />
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Our Team</h2>
        <p className="text-muted-foreground leading-relaxed">
          We're a diverse team of engineers, designers, and product specialists passionate about simplifying
          infrastructure and deployment. With backgrounds in cloud platforms, enterprise hosting, and developer tools,
          we bring deep expertise to every feature we build.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          We're hiring. If you're passionate about infrastructure and want to help shape the future of web hosting,
          check out our <a href="/careers" className="text-accent hover:underline">careers page</a>.
        </p>
      </section>

      {/* Stats Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">By The Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: '10K+', label: 'Active Users' },
            { number: '50K+', label: 'Websites Hosted' },
            { number: '99.9%', label: 'Uptime SLA' },
            { number: '24/7', label: 'Support' }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50 text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">{stat.number}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/30">
        <h2 className="text-2xl font-bold">Get In Touch</h2>
        <p className="text-muted-foreground">
          Have questions about Ovmon? We'd love to hear from you. Reach out to our team at{' '}
          <a href="mailto:hello@ovmon.com" className="text-accent hover:underline">
            hello@ovmon.com
          </a>
        </p>
      </section>
    </MarketingLayout>
  );
}
