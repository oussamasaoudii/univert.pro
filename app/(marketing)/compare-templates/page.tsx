'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight } from 'lucide-react';
import { HeroSection, CTABand } from '@/components/marketing/sections';

export const metadata = {
  title: 'Compare Templates & Plans - Univert',
  description: 'Compare all Univert templates and pricing plans. Side-by-side comparison of features, pricing, and support across WordPress, Laravel, and Next.js stacks.',
};

const comparisonData = {
  templates: [
    {
      id: 'blog-pro',
      name: 'Blog Pro',
      category: 'Blog & Content',
      stack: 'WordPress',
      startingPrice: '$99',
      bestFor: 'Bloggers, publishers, content creators',
      features: [
        { name: 'Homepage with featured posts', included: true },
        { name: 'Blog archive pages', included: true },
        { name: 'Category and tag pages', included: true },
        { name: 'Search functionality', included: true },
        { name: 'Comment system', included: true },
        { name: 'Email newsletter signup', included: true },
        { name: 'Social sharing buttons', included: true },
        { name: 'SEO optimization', included: true },
        { name: 'Mobile responsive', included: true },
        { name: 'Ad space integration', included: true },
      ],
      customDomain: true,
      managedHosting: true,
      support: '24/7 Email',
      ownership: true,
    },
    {
      id: 'business-hub',
      name: 'Business Hub',
      category: 'Small Business',
      stack: 'WordPress',
      startingPrice: '$199',
      bestFor: 'Service businesses, consultants, agencies',
      features: [
        { name: 'Service portfolio showcase', included: true },
        { name: 'About & contact pages', included: true },
        { name: 'Team member profiles', included: true },
        { name: 'Testimonials & reviews', included: true },
        { name: 'Booking calendar', included: true },
        { name: 'Email contact forms', included: true },
        { name: 'Client gallery', included: true },
        { name: 'Blog section', included: true },
        { name: 'SEO optimization', included: true },
        { name: 'Analytics integration', included: true },
      ],
      customDomain: true,
      managedHosting: true,
      support: '24/7 Email & Chat',
      ownership: true,
    },
    {
      id: 'commerce-store',
      name: 'Commerce Store',
      category: 'E-commerce',
      stack: 'WordPress + WooCommerce',
      startingPrice: '$399',
      bestFor: 'Online stores, product sellers',
      features: [
        { name: 'Unlimited products', included: true },
        { name: 'Product categories', included: true },
        { name: 'Payment processing (Stripe, PayPal)', included: true },
        { name: 'Shopping cart & checkout', included: true },
        { name: 'Order management', included: true },
        { name: 'Inventory tracking', included: true },
        { name: 'Customer accounts', included: true },
        { name: 'Product reviews', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Shipping integration', included: true },
      ],
      customDomain: true,
      managedHosting: true,
      support: '24/7 Email & Chat',
      ownership: true,
    },
    {
      id: 'app-platform',
      name: 'App Platform',
      category: 'Web Application',
      stack: 'Next.js',
      startingPrice: '$499',
      bestFor: 'SaaS platforms, web apps, dashboards',
      features: [
        { name: 'User authentication', included: true },
        { name: 'Role-based access control', included: true },
        { name: 'Dashboard templates', included: true },
        { name: 'Real-time data updates', included: true },
        { name: 'API integration', included: true },
        { name: 'Database included', included: true },
        { name: 'Payment processing', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Mobile responsive', included: true },
      ],
      customDomain: true,
      managedHosting: true,
      support: '24/7 Email & Chat',
      ownership: true,
    },
    {
      id: 'startup-builder',
      name: 'Startup Builder',
      category: 'Startup',
      stack: 'Next.js',
      startingPrice: '$699',
      bestFor: 'Startups, products, MVPs',
      features: [
        { name: 'Landing page builder', included: true },
        { name: 'Waitlist management', included: true },
        { name: 'User accounts & profiles', included: true },
        { name: 'Payment processing', included: true },
        { name: 'Admin dashboard', included: true },
        { name: 'Analytics & insights', included: true },
        { name: 'Email campaigns', included: true },
        { name: 'API documentation', included: true },
        { name: 'Mobile app templates', included: false },
        { name: 'Advanced customization', included: true },
      ],
      customDomain: true,
      managedHosting: true,
      support: '24/7 Email, Chat, Phone',
      ownership: true,
    },
    {
      id: 'enterprise-pro',
      name: 'Enterprise Pro',
      category: 'Enterprise',
      stack: 'Laravel',
      startingPrice: '$999+',
      bestFor: 'Large enterprises, complex applications',
      features: [
        { name: 'Unlimited customization', included: true },
        { name: 'Advanced database design', included: true },
        { name: 'Third-party integrations', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom development', included: true },
        { name: 'Compliance & security', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Team collaboration tools', included: true },
        { name: 'Scalability for millions', included: true },
      ],
      customDomain: true,
      managedHosting: true,
      support: '24/7 Priority Support',
      ownership: true,
    },
  ],
  plans: [
    {
      name: 'Starter',
      monthlyPrice: '$99',
      yearlyPrice: '$990',
      websites: 1,
      features: [
        'Custom domain',
        'Managed hosting',
        'SSL certificate',
        'Daily backups',
        'Email support',
        'Basic analytics',
        'Export anytime',
      ],
    },
    {
      name: 'Growth',
      monthlyPrice: '$299',
      yearlyPrice: '$2,990',
      websites: 3,
      popular: true,
      features: [
        'Everything in Starter',
        '3 websites',
        'Chat & phone support',
        'Advanced analytics',
        'Email notifications',
        'Scheduled backups',
        'Priority support',
      ],
    },
    {
      name: 'Business',
      monthlyPrice: '$799',
      yearlyPrice: '$7,990',
      websites: 10,
      features: [
        'Everything in Growth',
        'Up to 10 websites',
        'Dedicated account manager',
        'Priority 24/7 support',
        'Advanced security',
        'Custom integrations',
        'Performance optimization',
      ],
    },
    {
      name: 'Enterprise',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      websites: null,
      features: [
        'Unlimited websites',
        'Custom development',
        'Dedicated infrastructure',
        'SLA guarantee',
        '24/7 premium support',
        'Compliance support',
        'White label options',
      ],
    },
  ],
};

export default function CompareTemplatesPlansPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="Comparison"
        title="Compare Templates & Plans"
        description="Find the perfect template and plan for your business. Compare features, pricing, and support across all options."
        cta={{
          primary: { label: 'View All Templates', href: '#templates' },
          secondary: { label: 'Compare Plans', href: '#plans' },
        }}
      />

      {/* Templates Comparison */}
      <section id="templates" className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Template Gallery</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Our Templates
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Choose from 50+ professionally designed templates across WordPress, Laravel, and Next.js.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {comparisonData.templates.map((template) => (
              <Card key={template.id} className="border-border hover:border-accent/50 transition-all hover-lift flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <p className="text-sm text-foreground/60 mt-1">{template.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{template.stack}</Badge>
                  </div>
                  <p className="text-sm text-foreground/70 mt-3">{template.bestFor}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="text-3xl font-bold text-accent">{template.startingPrice}</div>
                  <div className="space-y-2">
                    {template.features.slice(0, 5).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-foreground/70">{feature.name}</span>
                      </div>
                    ))}
                    <p className="text-xs text-foreground/60 mt-3 pt-2 border-t border-border">
                      + {template.features.filter(f => f.included).length - 5} more features
                    </p>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <Link href={`/templates/${template.id}`}>
                      View Template
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/templates">
                Browse All 50+ Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Pricing Plans</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Plans for Every Business
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Simple, transparent pricing. All plans include managed hosting, backups, and support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comparisonData.plans.map((plan) => (
              <Card
                key={plan.name}
                className={`border-border relative transition-all ${
                  plan.popular ? 'border-accent ring-1 ring-accent shadow-lg scale-[1.02]' : 'hover:border-accent/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      {plan.monthlyPrice === 'Custom' ? (
                        <span className="text-2xl">Custom</span>
                      ) : (
                        <>
                          {plan.monthlyPrice}
                          <span className="text-lg text-foreground/60">/mo</span>
                        </>
                      )}
                    </div>
                    {plan.yearlyPrice !== 'Custom' && (
                      <p className="text-xs text-foreground/60 mt-2">
                        {plan.yearlyPrice}/year (save 17%)
                      </p>
                    )}
                  </div>
                  {plan.websites && (
                    <p className="text-sm text-foreground/70 mt-3">
                      Up to <strong>{plan.websites}</strong> website{plan.websites !== 1 ? 's' : ''}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-accent' : 'text-muted-foreground'}`} />
                        <span className="text-foreground/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${plan.popular ? 'bg-accent hover:bg-accent/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stack Comparison */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Stack Comparison</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              WordPress vs Laravel vs Next.js
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-bold">Feature</th>
                  <th className="text-center py-4 px-4 font-bold">WordPress</th>
                  <th className="text-center py-4 px-4 font-bold">Laravel</th>
                  <th className="text-center py-4 px-4 font-bold">Next.js</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Best For', wordpress: 'Content & Blogs', laravel: 'Custom Apps', nextjs: 'Modern Apps' },
                  { feature: 'Setup Time', wordpress: '24 hours', laravel: '24 hours', nextjs: '24 hours' },
                  { feature: 'Learning Curve', wordpress: 'Easy', laravel: 'Medium', nextjs: 'Medium' },
                  { feature: 'Customization', wordpress: 'Good', laravel: 'Unlimited', nextjs: 'Unlimited' },
                  { feature: 'Scalability', wordpress: 'Very High', laravel: 'Very High', nextjs: 'Very High' },
                  { feature: 'SEO', wordpress: 'Built-in', laravel: 'Manual', nextjs: 'Built-in' },
                  { feature: 'E-commerce', wordpress: 'Excellent', laravel: 'Custom', nextjs: 'Custom' },
                  { feature: 'Real-time Features', wordpress: 'Limited', laravel: 'Yes', nextjs: 'Yes' },
                  { feature: 'Export Ability', wordpress: 'Easy', laravel: 'Full', nextjs: 'Full' },
                  { feature: 'Cost', wordpress: 'Affordable', laravel: 'Custom', nextjs: 'Custom' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-accent/5">
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-foreground/70">{row.wordpress}</td>
                    <td className="py-4 px-4 text-center text-foreground/70">{row.laravel}</td>
                    <td className="py-4 px-4 text-center text-foreground/70">{row.nextjs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand
        badge="Ready to Get Started?"
        title="Choose Your Template & Plan"
        description="Launch your professional website in 24 hours with managed setup, hosting, and support."
        primaryCTA={{ label: 'Browse Templates', href: '/templates' }}
        secondaryCTA={{ label: 'Talk to Our Team', href: '/contact' }}
      />
    </main>
  );
}
