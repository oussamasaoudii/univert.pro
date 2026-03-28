import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Zap,
  Users,
  Globe,
  ArrowRight,
  Headphones,
  Lock,
  LineChart,
  Shield,
  Rocket,
} from 'lucide-react';
import {
  HeroSection,
  CTABand,
  TestimonialSection,
} from '@/components/marketing/sections';

export const metadata = {
  title: 'How It Works - Univert',
  description: 'Learn how Univert makes it easy to launch professional websites with managed setup, support, and complete ownership.',
};

const steps = [
  {
    number: 1,
    title: 'Choose Your Template',
    description: 'Browse our collection of 50+ professionally designed templates. Each is fully customizable and ready to launch.',
    icon: Globe,
    details: [
      'WordPress, Next.js, and Laravel templates',
      'Mobile-responsive designs',
      'Professional layouts for any industry',
      'Live previews before choosing',
    ],
  },
  {
    number: 2,
    title: 'Customize Your Site',
    description: 'Add your content, branding, and customize colors and layout. No coding required.',
    icon: Zap,
    details: [
      'Drag-and-drop customization',
      'Add your logo and colors',
      'Upload images and content',
      'SEO-ready pages included',
    ],
  },
  {
    number: 3,
    title: 'We Handle Setup',
    description: 'Our team sets up your domain, SSL certificate, and database. You launch within 24 hours.',
    icon: Users,
    details: [
      'Domain and email configuration',
      'Automatic SSL certificates',
      'Database setup and testing',
      'Performance optimization',
    ],
  },
  {
    number: 4,
    title: 'Go Live',
    description: 'Your website is now live and accessible to the world. Our team provides initial support.',
    icon: Rocket,
    details: [
      'Site goes live and searchable',
      'Team provides onboarding call',
      'Ongoing support available',
      'Analytics and monitoring included',
    ],
  },
  {
    number: 5,
    title: 'We Handle Maintenance',
    description: 'Daily backups, security updates, and monitoring. We keep your site running smoothly.',
    icon: Shield,
    details: [
      'Automatic daily backups',
      'Security patches applied',
      'Performance monitoring',
      '99.99% uptime guarantee',
    ],
  },
  {
    number: 6,
    title: 'Export Anytime',
    description: 'Need to move? Export your website anytime. No lock-in, complete freedom.',
    icon: Lock,
    details: [
      'Full database and file exports',
      'Migration support included',
      'No fees or penalties',
      'Maintain all your data ownership',
    ],
  },
];

const benefits = [
  {
    title: 'Save Time',
    description: 'Get your professional website live in days, not months.',
    icon: Zap,
  },
  {
    title: 'Expert Support',
    description: '24/7 support team ready to help with any questions or issues.',
    icon: Headphones,
  },
  {
    title: 'Complete Freedom',
    description: 'Export and move your website whenever you want. No vendor lock-in.',
    icon: Lock,
  },
  {
    title: 'Peace of Mind',
    description: 'Automatic backups, security updates, and monitoring included.',
    icon: Shield,
  },
  {
    title: 'Professional Results',
    description: 'Beautifully designed templates that look like they cost thousands.',
    icon: Globe,
  },
  {
    title: 'Scale as You Grow',
    description: 'From startup to enterprise, our platform scales with your business.',
    icon: LineChart,
  },
];

const testimonials = [
  {
    quote: 'Univert made launching our website incredibly easy. The setup was fast and the support team was fantastic.',
    author: 'Sarah Mitchell',
    role: 'Small Business Owner',
    image: '👩‍💼',
  },
  {
    quote: 'We were up and running in 24 hours. No technical knowledge needed. Highly recommend.',
    author: 'James Rodriguez',
    role: 'E-commerce Store Owner',
    image: '👨‍💼',
  },
  {
    quote: 'The peace of mind from automatic backups and 24/7 support is worth it alone. Great service.',
    author: 'Maria Santos',
    role: 'Creative Agency',
    image: '👩‍🎨',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="Launch in 24 Hours"
        title="How Univert Makes Website Setup Simple"
        description="From choosing a template to going live, we handle all the technical complexity so you can focus on your business."
        cta={{
          primary: { label: 'Start Free Trial', href: '/signup' },
          secondary: { label: 'View Templates', href: '/templates' },
        }}
      />

      {/* Process Steps */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-20">
            <Badge className="mb-4">Our Process</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Simple Steps to Your Website
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              We've streamlined website launch so anyone can do it. Here's how it works.
            </p>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden md:block">
            {steps.map((step, idx) => (
              <div key={step.number} className="mb-12">
                <div className="flex gap-8">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl mb-4 flex-shrink-0">
                      {step.number}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="w-1 h-32 bg-gradient-to-b from-accent to-accent/20" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-12 flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <step.icon className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                        <p className="text-foreground/70 mb-6">{step.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/70">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-8">
            {steps.map((step) => (
              <Card key={step.number} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{step.title}</h3>
                      <p className="text-sm text-foreground/70">{step.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {step.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground/70">{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Why Choose Univert
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              We handle everything so you can focus on what matters—growing your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-border bg-background">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                    <benefit.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{benefit.title}</h3>
                  <p className="text-foreground/70">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection
        badge="Success Stories"
        title="Loved by Business Owners"
        description="See what our customers say about their experience with Univert."
        testimonials={testimonials}
        variant="minimal"
      />

      {/* FAQ Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
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
                q: 'How long does setup take?',
                a: 'Most websites are set up and live within 24 hours of signup. Our team handles all the technical configuration while you prepare your content.',
              },
              {
                q: 'Do I need technical skills?',
                a: 'No! Our templates are designed for non-technical users. Our support team is always available if you have questions.',
              },
              {
                q: 'Can I modify the template?',
                a: 'Yes. All templates are fully customizable. You can change colors, fonts, layouts, and add your own content without coding.',
              },
              {
                q: 'What if I want to use my own domain?',
                a: 'You can use your own domain or we can register a new one for you. We handle all the DNS configuration.',
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use enterprise-grade security with SSL encryption, daily backups, and 24/7 monitoring. All your data is yours.',
              },
              {
                q: 'Can I export my website later?',
                a: 'Absolutely. You maintain full ownership. Export your entire website anytime with no fees or penalties. No vendor lock-in.',
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-border bg-background/50">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-3">{item.q}</h3>
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
        title="Launch Your Website Today"
        description="Join thousands of business owners who trusted Univert to build their online presence."
        primaryCTA={{ label: 'Start Free Trial', href: '/signup' }}
        secondaryCTA={{ label: 'View Templates', href: '/templates' }}
      />
    </main>
  );
}
