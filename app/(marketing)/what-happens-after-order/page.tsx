'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  Zap,
  Users,
  Rocket,
  HeadphoneIcon,
  BarChart3,
  Mail,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { HeroSection, CTABand } from '@/components/marketing/sections';

export const metadata = {
  title: 'What Happens After I Order - Univert',
  description: 'Complete post-purchase flow explanation. From order to launch, see exactly what happens at each step and when your website goes live.',
};

const timeline = [
  {
    phase: 1,
    title: 'You Place Your Order',
    timeframe: '0 hours',
    description: 'Choose your template, domain, and plan. Our team immediately starts your setup process.',
    details: [
      'Select WordPress, Laravel, or Next.js stack',
      'Choose your template from our gallery',
      'Pick your domain (or use an existing one)',
      'Select your plan and add-ons',
      'Complete payment (secure checkout)',
    ],
    icon: Zap,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    phase: 2,
    title: 'We Begin Setup',
    timeframe: '0-2 hours',
    description: 'Our team starts configuring your website, domain, database, and email.',
    details: [
      'Configure domain DNS and point to our servers',
      'Set up SSL certificate (automatic HTTPS)',
      'Create database and initialize stack',
      'Deploy your chosen template',
      'Set up email forwarding/accounts',
    ],
    icon: Users,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    phase: 3,
    title: 'Customize Your Content',
    timeframe: '2-12 hours',
    description: 'You customize your website with your logo, colors, content, and branding.',
    details: [
      'Add your logo and brand colors',
      'Update homepage and key pages',
      'Add your content and images',
      'Configure navigation and menus',
      'Test all pages and forms',
    ],
    icon: Lightbulb,
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  {
    phase: 4,
    title: 'Final Review & Testing',
    timeframe: '12-18 hours',
    description: 'Our team does quality assurance and performs final testing before going live.',
    details: [
      'Test website on all devices',
      'Check form submissions and email',
      'Verify SEO setup and sitemap',
      'Test page load speed',
      'Review security and SSL certificate',
    ],
    icon: CheckCircle2,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    phase: 5,
    title: 'Website Goes Live',
    timeframe: '18-24 hours',
    description: 'Your website is now live and accessible to the world. Your URL and credentials are sent to you.',
    details: [
      'Website publicly accessible at your domain',
      'Search engines begin indexing',
      'Email accounts fully functional',
      'Admin credentials sent securely',
      'Live monitoring begins',
    ],
    icon: Rocket,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    phase: 6,
    title: 'Onboarding & Handoff',
    timeframe: '24 hours +',
    description: 'You get admin access, training, and ongoing support from our team.',
    details: [
      'Welcome email with dashboard access',
      'Onboarding call with our team (optional)',
      'Training on managing your website',
      'Support email and chat available 24/7',
      'Monthly performance reports',
    ],
    icon: HeadphoneIcon,
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  },
];

const dashboard = [
  {
    title: 'Admin Dashboard',
    description: 'Manage all aspects of your website from one place.',
    features: ['Content management', 'User management', 'Settings & customization', 'Analytics', 'Backups', 'Domain management'],
  },
  {
    title: 'Credentials & Access',
    description: 'Everything you need to manage your website.',
    features: ['Admin login & password', 'Database credentials', 'Email credentials', 'FTP access', 'API keys', 'SSL certificate info'],
  },
  {
    title: 'Support & Resources',
    description: 'Help is always available when you need it.',
    features: ['24/7 support email', 'Live chat support', 'Knowledge base', 'Video tutorials', 'Scheduled calls', 'Community forum'],
  },
];

export default function WhatHappensAfterOrderPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="Post-Purchase Flow"
        title="What Happens After You Order"
        description="From checkout to going live. A transparent, step-by-step look at your website launch journey."
        cta={{
          primary: { label: 'Get Started', href: '/templates' },
          secondary: { label: 'Learn More', href: '#timeline' },
        }}
      />

      {/* Timeline Section */}
      <section id="timeline" className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">The Launch Timeline</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              From Order to Live Website
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Most websites launch within 24 hours. Here's exactly what happens at each step.
            </p>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden md:block">
            {timeline.map((phase, idx) => {
              const Icon = phase.icon;
              return (
                <div key={phase.phase} className="mb-12 relative">
                  <div className="flex gap-8">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${phase.color}`}>
                        {phase.phase}
                      </div>
                      {idx < timeline.length - 1 && (
                        <div className="w-1 h-40 bg-gradient-to-b from-accent/50 to-accent/10" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-12 flex-1 pt-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold">{phase.title}</h3>
                            <Badge variant="outline" className="border-accent/30">
                              {phase.timeframe}
                            </Badge>
                          </div>
                          <p className="text-lg text-foreground/70">{phase.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        {phase.details.map((detail, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-foreground/70">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-6">
            {timeline.map((phase) => {
              const Icon = phase.icon;
              return (
                <Card key={phase.phase} className="border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${phase.color}`}>
                        {phase.phase}
                      </div>
                      <Badge variant="outline" className="text-xs border-accent/30">
                        {phase.timeframe}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{phase.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground/70">{phase.description}</p>
                    <ul className="space-y-2">
                      {phase.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/70">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">After Launch</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              What You Receive
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Everything you need to manage and grow your website independently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {dashboard.map((item, idx) => (
              <Card key={idx} className="border-border bg-background">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="text-sm text-foreground/60 mt-2">{item.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ongoing Support Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Ongoing Support</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              We're Here After Launch
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Your success doesn't end at launch. We provide continuous support, updates, and optimization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Clock,
                title: '24/7 Support',
                description: 'Get help anytime. Our support team is always available via email and chat.',
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                description: 'Monthly reports on your website performance, traffic, and user behavior.',
              },
              {
                icon: Mail,
                title: 'Updates & Maintenance',
                description: 'Automatic security updates, backups, and performance optimization.',
              },
              {
                icon: Rocket,
                title: 'Scale & Grow',
                description: 'As your business grows, we scale your infrastructure seamlessly.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="border-border">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 text-accent">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Common Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'What if I miss something during onboarding?',
                a: 'We provide comprehensive documentation, video tutorials, and our support team is always available to help. You can onboard at your own pace.',
              },
              {
                q: 'Can I make changes after launch?',
                a: 'Yes! You have full access to your admin dashboard. Make updates anytime. Need help? Our team is just a message away.',
              },
              {
                q: 'What if I want to customize further?',
                a: 'You can hire developers to customize your website, or we can recommend trusted partners who know our stacks.',
              },
              {
                q: 'How do I get my admin credentials?',
                a: 'You\'ll receive a secure email with all credentials immediately after your website goes live. Credentials are stored securely in your dashboard.',
              },
              {
                q: 'Can I manage multiple websites?',
                a: 'Yes. Each website has its own dashboard. You can manage all your sites from one account.',
              },
              {
                q: 'What happens to my analytics?',
                a: 'We set up analytics (Google Analytics, etc.) during setup. You get monthly reports and can access detailed stats anytime.',
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand
        badge="Ready to Get Started?"
        title="Your Website Launches in 24 Hours"
        description="Simple process. Professional results. 24/7 support. Let's build your online presence."
        primaryCTA={{ label: 'Choose Your Template', href: '/templates' }}
        secondaryCTA={{ label: 'Ask Questions First', href: '/contact' }}
      />
    </main>
  );
}
