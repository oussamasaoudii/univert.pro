'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Users,
  Zap,
  Shield,
  BarChart3,
  Headphones,
  Code,
  Rocket,
} from 'lucide-react';
import { HeroSection, CTABand } from '@/components/marketing/sections';

export const metadata = {
  title: 'Need a Custom Website - Univert',
  description: 'Custom website development for businesses with unique requirements. We build custom solutions on WordPress, Laravel, or Next.js.',
};

const customSolutions = [
  {
    title: 'SaaS Platforms',
    description: 'Build subscription-based software products with custom features, user management, and payment processing.',
    icon: Zap,
    examples: ['User dashboards', 'Payment processing', 'API integrations', 'Real-time features'],
  },
  {
    title: 'Marketplace Platforms',
    description: 'Create platforms that connect buyers and sellers with custom matching, ratings, and payment flows.',
    icon: Users,
    examples: ['Seller management', 'Buyer search', 'Rating systems', 'Commission tracking'],
  },
  {
    title: 'Business Applications',
    description: 'Custom internal tools and applications to streamline your business processes.',
    icon: BarChart3,
    examples: ['Inventory systems', 'CRM platforms', 'Project management', 'Reporting tools'],
  },
  {
    title: 'High-Performance Sites',
    description: 'High-traffic, high-performance websites built with cutting-edge technology and optimization.',
    icon: Rocket,
    examples: ['Real-time apps', 'Data visualization', 'Mobile apps', 'API-driven platforms'],
  },
  {
    title: 'Advanced Integrations',
    description: 'Websites that deeply integrate with your existing systems and third-party services.',
    icon: Code,
    examples: ['ERP integration', 'Payment processors', 'Analytics platforms', 'CRM systems'],
  },
  {
    title: 'Complex Workflows',
    description: 'Business logic and automation that goes beyond standard templates.',
    icon: Lightbulb,
    examples: ['Approval workflows', 'Automation rules', 'Multi-step processes', 'Custom calculations'],
  },
];

const process = [
  {
    step: 1,
    title: 'Discovery Call',
    description: 'We learn about your project, goals, timeline, and budget. This helps us understand your unique needs.',
    details: ['30-60 minute call', 'Discuss requirements', 'Understand your goals', 'Initial scope estimation'],
  },
  {
    step: 2,
    title: 'Proposal & Timeline',
    description: 'We create a detailed proposal with scope, timeline, cost, and deliverables.',
    details: ['Written proposal', 'Feature breakdown', 'Timeline & milestones', 'Transparent pricing'],
  },
  {
    step: 3,
    title: 'Design & Planning',
    description: 'We design the architecture and create mockups for your approval before development.',
    details: ['UI/UX design', 'Technical architecture', 'Database design', 'Your approval needed'],
  },
  {
    step: 4,
    title: 'Development',
    description: 'Our team builds your custom website with regular updates and demos.',
    details: ['Iterative development', 'Weekly demos', 'Your feedback', 'Quality assurance'],
  },
  {
    step: 5,
    title: 'Testing & Launch',
    description: 'Complete testing, optimization, and deployment to production.',
    details: ['Full QA testing', 'Performance optimization', 'Security review', 'Live deployment'],
  },
  {
    step: 6,
    title: 'Support & Growth',
    description: 'Ongoing support, maintenance, and help scaling your platform.',
    details: ['24/7 support', 'Updates & improvements', 'Monitoring', 'Scaling assistance'],
  },
];

const reasons = [
  {
    title: 'Experienced Team',
    description: 'Our developers have built dozens of custom platforms and know how to avoid pitfalls.',
    icon: Users,
  },
  {
    title: 'Flexible Stack',
    description: 'WordPress, Laravel, Next.js, or any combination. We choose the best tool for your needs.',
    icon: Code,
  },
  {
    title: 'Full Ownership',
    description: 'You own your website and can export anytime. No lock-in. Your data is yours.',
    icon: Shield,
  },
  {
    title: 'Managed Hosting',
    description: 'We host your platform with automatic backups, updates, and 99.99% uptime guarantee.',
    icon: Rocket,
  },
  {
    title: 'Transparent Pricing',
    description: 'Clear costs upfront. No surprise bills. You know exactly what you\'re paying.',
    icon: BarChart3,
  },
  {
    title: 'Partnership Approach',
    description: 'We treat your project as our own success. Your growth is our priority.',
    icon: Lightbulb,
  },
];

export default function CustomWebsitePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="Custom Development"
        title="Need Something More Custom?"
        description="Can't find what you need in our templates? We build custom platforms for businesses with unique requirements. WordPress, Laravel, Next.js—we build what you need."
        cta={{
          primary: { label: 'Schedule Discovery Call', href: '#contact' },
          secondary: { label: 'View Template Options', href: '/templates' },
        }}
      />

      {/* When Custom Makes Sense */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Is Custom Right for You?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Perfect For Custom Solutions
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              If your requirements include any of these, custom development might be the best path.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customSolutions.map((solution, idx) => {
              const Icon = solution.icon;
              return (
                <Card key={idx} className="border-border hover:border-accent/50 transition-all hover-lift">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 text-accent">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{solution.title}</CardTitle>
                    <p className="text-sm text-foreground/60 mt-2">{solution.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {solution.examples.map((example, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/70">{example}</span>
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

      {/* Why Choose Univert for Custom */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Why Univert for Custom?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              The Univert Advantage
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <Card key={idx} className="border-border bg-background">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 text-accent">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{reason.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70 text-sm">{reason.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Process</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How We Build Custom Platforms
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              A structured approach to deliver exactly what you need, on time and on budget.
            </p>
          </div>

          {/* Desktop Process */}
          <div className="hidden md:block">
            {process.map((item, idx) => (
              <div key={item.step} className="mb-12">
                <div className="flex gap-8">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl mb-4 flex-shrink-0">
                      {item.step}
                    </div>
                    {idx < process.length - 1 && (
                      <div className="w-1 h-40 bg-gradient-to-b from-accent to-accent/20" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-12 flex-1">
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-foreground/70 mb-6">{item.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {item.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/70">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Process */}
          <div className="md:hidden space-y-6">
            {process.map((item) => (
              <Card key={item.step} className="border-border">
                <CardHeader>
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/70">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/70">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Transparency */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Transparent Custom Pricing
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: 'Project Size',
                values: ['Small (1-2 weeks)', 'Medium (1-3 months)', 'Large (3+ months)'],
              },
              {
                label: 'Estimated Range',
                values: ['$5K - $15K', '$15K - $50K', '$50K+'],
              },
              {
                label: 'What It Includes',
                values: ['Custom features', 'Design & development', 'Full customization'],
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.values.map((value, i) => (
                      <li key={i} className="text-sm text-foreground/70">
                        {value}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-accent/50 bg-accent/5">
            <CardContent className="p-6">
              <p className="text-foreground/80">
                Every custom project is unique. We&apos;ll provide a detailed quote after your discovery call. No surprises. No hidden costs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Custom Development Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'How long does custom development take?',
                a: 'It depends on complexity. Simple projects take 2-4 weeks. Complex platforms can take 3-6 months. We provide a detailed timeline during discovery.',
              },
              {
                q: 'Can I start with a template and go custom later?',
                a: 'Absolutely. Many clients start with a template and expand with custom features. We help you evolve your platform over time.',
              },
              {
                q: 'Do you provide ongoing support?',
                a: 'Yes. After launch, we provide 24/7 support, maintenance, updates, and help with scaling and improvements.',
              },
              {
                q: 'What if I want to hire my own developers later?',
                a: 'You can. You own the code and architecture. Hire anyone to work on your project. We provide documentation and knowledge transfer.',
              },
              {
                q: 'Do you work with existing systems?',
                a: 'Yes. We integrate with APIs, databases, payment processors, and other systems your business already uses.',
              },
              {
                q: 'What happens if my needs change during development?',
                a: 'We adapt. We work in iterative sprints and adjust scope as needed. You\'re in full control of the direction.',
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
      <section id="contact" className="py-20 md:py-32 px-4 sm:px-6 bg-accent/5 border-t border-border/50">
        <div className="container max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Let's Discuss Your Vision
          </h2>
          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            Tell us about your project. We'll listen, ask questions, and help you determine the best path forward.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
              <Link href="/contact">
                Schedule Discovery Call
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/help-me-choose">
                Explore Template Options
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
