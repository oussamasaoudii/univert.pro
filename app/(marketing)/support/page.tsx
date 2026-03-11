import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Book, MessageSquare, AlertCircle, Lightbulb, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Support - Ovmon',
  description: 'Get help with Ovmon. Access documentation, knowledge base, and support resources.'
};

export default function SupportPage() {
  const supportCategories = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Comprehensive guides and API reference',
      link: '/docs'
    },
    {
      icon: MessageSquare,
      title: 'Community',
      description: 'Connect with other Ovmon users',
      link: '/community'
    },
    {
      icon: AlertCircle,
      title: 'Status Page',
      description: 'Real-time system status and incidents',
      link: '/status'
    },
    {
      icon: Lightbulb,
      title: 'Tutorials',
      description: 'Step-by-step guides and walkthroughs',
      link: '/tutorials'
    }
  ];

  return (
    <MarketingLayout
      title="Support"
      description="We're here to help you succeed with Ovmon"
    >
      {/* Quick Links */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <a
                key={idx}
                href={category.link}
                className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
              >
                <Icon className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Search Help */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6" />
          Search for Help
        </h2>
        <p className="text-muted-foreground">Can't find what you're looking for? Search our knowledge base:</p>
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Search documentation..."
            className="flex-1 px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:border-accent"
          />
          <Button>Search</Button>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Popular Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Getting Started with Ovmon', link: '/docs/getting-started', description: 'Learn the basics and deploy your first site' },
            { title: 'Deploying Your First Website', link: '/docs/deployment', description: 'Step-by-step deployment guide' },
            { title: 'Domain Configuration', link: '/docs/configuration', description: 'Set up custom domains and DNS' },
            { title: 'SSL Certificates', link: '/docs/configuration', description: 'Automatic SSL and HTTPS setup' },
            { title: 'Environment Variables', link: '/docs/configuration', description: 'Manage secrets and configuration' },
            { title: 'API Authentication', link: '/docs/api', description: 'Secure your API with tokens' },
            { title: 'Webhooks Setup', link: '/docs/api', description: 'Real-time event notifications' },
            { title: 'CI/CD Integration', link: '/docs/deployment', description: 'Automate your deployments' },
            { title: 'Rollbacks & Recovery', link: '/docs/deployment', description: 'Instant rollback to previous versions' },
            { title: 'Security Best Practices', link: '/docs/security', description: 'Protect your applications' },
            { title: 'CLI Commands', link: '/docs/cli', description: 'Command-line interface reference' },
            { title: 'Rate Limiting', link: '/docs/api', description: 'API usage limits and quotas' }
          ].map((topic, idx) => (
            <a
              key={idx}
              href={topic.link}
              className="p-4 rounded-lg border border-border bg-background hover:border-accent transition-colors group flex items-start gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-accent mt-2 group-hover:scale-150 transition-transform flex-shrink-0" />
              <div>
                <span className="text-foreground group-hover:text-accent transition-colors font-medium">{topic.title}</span>
                <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Support Plan Comparison */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Support Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Community',
              price: 'Free',
              features: [
                'Community forums',
                'Knowledge base access',
                'Email support',
                'Response time: 48 hours'
              ]
            },
            {
              name: 'Professional',
              price: '$99/month',
              features: [
                'Everything in Community',
                'Priority email support',
                'Phone support',
                'Response time: 4 hours',
                'Dedicated support contact'
              ],
              highlighted: true
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              features: [
                'Everything in Professional',
                '24/7 phone support',
                'Slack integration',
                'Custom SLA',
                'Dedicated account manager'
              ]
            }
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-lg border transition-colors ${
                plan.highlighted
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-secondary/50 hover:bg-secondary'
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-accent mb-4">{plan.price}</p>
              <ul className="space-y-2">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" variant={plan.highlighted ? 'default' : 'outline'}>
                Choose Plan
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/30">
        <h2 className="text-2xl font-bold">Can't Find What You Need?</h2>
        <p className="text-muted-foreground">
          Our support team is ready to help. Reach out to us at{' '}
          <a href="mailto:support@ovmon.com" className="text-accent hover:underline">
            support@ovmon.com
          </a>{' '}
          or visit our <a href="/contact" className="text-accent hover:underline">
            contact page
          </a>
          .
        </p>
      </section>
    </MarketingLayout>
  );
}
