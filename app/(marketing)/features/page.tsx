'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  Lock,
  Headphones,
  Server,
  RefreshCw,
  BarChart3,
  Users,
  ArrowRight,
} from 'lucide-react';

import {
  CTABand,
  HeroSection,
  FAQSection,
} from '@/components/marketing/sections';

export const metadata = {
  title: 'Features - Univert',
  description: 'Discover all the powerful features that make Univert the best platform for launching professional websites. Templates, support, security, and complete ownership.',
};

export default function FeaturesPage() {
  const featureCategories = [
    {
      title: 'Professional Templates',
      description: 'Launch-ready designs for every business type',
      features: [
        'WordPress, Next.js, and Laravel templates',
        'Mobile-responsive designs',
        'SEO-optimized pages',
        'Industry-specific templates',
        'Easy customization',
        'Regular updates',
      ],
      icon: Globe,
    },
    {
      title: 'Managed Setup & Support',
      description: 'We handle everything so you don\'t have to',
      features: [
        'Fast 24-hour setup',
        'Domain and email configuration',
        'Automatic SSL certificates',
        'Database setup',
        'Performance optimization',
        'Ongoing 24/7 support',
      ],
      icon: Headphones,
    },
    {
      title: 'Security & Monitoring',
      description: 'Enterprise-grade protection included',
      features: [
        'Daily automatic backups',
        'DDoS protection',
        'Security patch updates',
        '24/7 monitoring',
        '99.99% uptime guarantee',
        'Compliance-ready',
      ],
      icon: Shield,
    },
    {
      title: 'Maintenance & Operations',
      description: 'We keep your site running smoothly',
      features: [
        'Automatic updates',
        'Performance monitoring',
        'Database maintenance',
        'Email support included',
        'Analytics included',
        'Regular optimization',
      ],
      icon: RefreshCw,
    },
    {
      title: 'Custom Domain & Branding',
      description: 'Make it truly yours',
      features: [
        'Use your own domain',
        'Free domain registration available',
        'Custom branding',
        'Logo and color customization',
        'Professional email',
        'Brand consistency',
      ],
      icon: Lock,
    },
    {
      title: 'Complete Ownership',
      description: 'Your website, your data, your choice',
      features: [
        'Full data ownership',
        'Export anytime',
        'No vendor lock-in',
        'Migration support included',
        'Free database exports',
        'Keep all your content',
      ],
      icon: Lock,
    },
  ];

  const comparisonTable = [
    {
      feature: 'Setup Time',
      values: ['24 hours', 'Days/Weeks', 'Weeks/Months'],
    },
    {
      feature: 'Professional Template',
      values: [true, false, 'Limited'],
    },
    {
      feature: 'Managed Setup',
      values: [true, false, false],
    },
    {
      feature: 'Daily Backups',
      values: [true, 'Manual', 'Limited'],
    },
    {
      feature: 'DDoS Protection',
      values: [true, 'Extra', 'Extra'],
    },
    {
      feature: '24/7 Support',
      values: [true, 'Business hours', 'Limited'],
    },
    {
      feature: 'Export Anytime',
      values: [true, true, 'Restricted'],
    },
    {
      feature: 'No Lock-in',
      values: [true, true, false],
    },
  ];

  const faqs = [
    {
      question: 'What technology do the templates use?',
      answer: 'Our templates are built with WordPress, Next.js, and Laravel—proven, reliable technologies. Each template is fully customizable and production-ready.',
    },
    {
      question: 'How is uptime guaranteed?',
      answer: 'We provide 99.99% uptime guarantee backed by enterprise-grade infrastructure, redundancy, DDoS protection, and 24/7 monitoring.',
    },
    {
      question: 'Is my data really mine?',
      answer: 'Yes, completely. You own all your data. You can export everything anytime in standard formats. No lock-in, no restrictions.',
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We offer 24/7 support via email, phone, and live chat. Our team handles technical issues, questions, and provides guidance on using your website.',
    },
    {
      question: 'How often are backups performed?',
      answer: 'Automatic daily backups are performed. We keep backups for recovery purposes and you can request restores anytime.',
    },
    {
      question: 'Can I move my website later?',
      answer: 'Yes, anytime. We provide free migration support to help you move your website to another host if you choose to do so.',
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <HeroSection
        badge="Everything You Need"
        title="Powerful Features for Your Success"
        description="Professional templates, managed setup, enterprise security, and complete freedom. All the features you need to build and grow your online presence."
        cta={{
          primary: { label: 'Start Free Trial', href: '/signup' },
          secondary: { label: 'How It Works', href: '/how-it-works' },
        }}
      />

      {/* Features Grid */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4">Complete Suite</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Everything Built In
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              No hidden costs, no extra fees. Get all the features you need to run your website successfully.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCategories.map((category) => (
              <Card key={category.title} className="border-border bg-background">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                    <category.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{category.title}</h3>
                  <p className="text-sm text-foreground/70 mb-6">{category.description}</p>
                  <ul className="space-y-3">
                    {category.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4">Comparison</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How We Compare
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              See why Univert is the best choice for your business website.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-0 border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-4 bg-accent/10">
                  <div className="px-6 py-4 font-bold">Feature</div>
                  <div className="px-6 py-4 font-bold text-accent">Univert</div>
                  <div className="px-6 py-4 font-bold text-foreground/60">DIY Hosting</div>
                  <div className="px-6 py-4 font-bold text-foreground/60">Basic Platform</div>
                </div>

                {/* Rows */}
                {comparisonTable.map((row, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-4 border-t border-border ${
                      idx % 2 === 0 ? 'bg-background' : 'bg-secondary/20'
                    }`}
                  >
                    <div className="px-6 py-4 font-medium">{row.feature}</div>
                    <div className="px-6 py-4 flex items-center">
                      {typeof row.values[0] === 'boolean' ? (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      ) : (
                        <span className="text-accent font-medium">{row.values[0]}</span>
                      )}
                    </div>
                    <div className="px-6 py-4 text-foreground/60">
                      {typeof row.values[1] === 'boolean' ? (
                        row.values[1] ? (
                          <CheckCircle2 className="w-5 h-5 text-foreground/40" />
                        ) : null
                      ) : (
                        row.values[1]
                      )}
                    </div>
                    <div className="px-6 py-4 text-foreground/60">
                      {typeof row.values[2] === 'boolean' ? (
                        row.values[2] ? (
                          <CheckCircle2 className="w-5 h-5 text-foreground/40" />
                        ) : null
                      ) : (
                        row.values[2]
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection
        badge="Questions?"
        title="Frequently Asked Questions"
        description="Find answers to common questions about Univert features."
        faqs={faqs}
      />

      {/* CTA */}
      <CTABand
        badge="Ready to Get Started?"
        title="Launch Your Professional Website"
        description="Join thousands of business owners who have launched their websites with Univert."
        primaryCTA={{ label: 'Start Free Trial', href: '/signup' }}
        secondaryCTA={{ label: 'Browse Templates', href: '/templates' }}
      />
    </main>
  );
}
