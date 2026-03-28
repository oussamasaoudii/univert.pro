'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Globe,
  Zap,
  Shield,
  Users,
  Headphones,
  Lock,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Clock,
  Server,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

import {
  CTABand,
  HeroSection,
  TestimonialSection,
  FAQSection,
} from '@/components/marketing/sections';

export const metadata = {
  title: 'Product - Univert',
  description: 'Univert: Professional website templates with managed setup and 24/7 support. Launch your business website in 24 hours with complete ownership.',
};

export default function ProductPage() {
  const features = [
    {
      icon: Globe,
      title: 'Professional Templates',
      description: '50+ expertly designed templates for any industry. Fully customizable without coding.',
    },
    {
      icon: Zap,
      title: 'Fast Launch',
      description: 'Setup completed in 24 hours by our team. Go live fast, focus on your business.',
    },
    {
      icon: Shield,
      title: 'Security Built-in',
      description: 'SSL, backups, monitoring, and DDoS protection included. Your site stays secure.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated support team ready to help anytime, anywhere. We\'ve got your back.',
    },
    {
      icon: RefreshCw,
      title: 'Maintenance Handled',
      description: 'Automatic updates, daily backups, and monitoring. Zero tech overhead.',
    },
    {
      icon: Lock,
      title: 'True Ownership',
      description: 'Export anytime, no lock-in. Your website is always yours to control.',
    },
  ];

  const benefits = [
    {
      title: 'Save Time',
      description: 'Launch your professional website in days, not months. Get to market fast.',
      stat: '24 Hours',
      statLabel: 'Setup Time',
      icon: Clock,
    },
    {
      title: 'Peace of Mind',
      description: 'Automatic backups, security updates, and monitoring keep your site running.',
      stat: '99.99%',
      statLabel: 'Uptime',
      icon: Shield,
    },
    {
      title: 'Professional Results',
      description: 'Beautifully designed templates that look like they cost thousands.',
      stat: '50+',
      statLabel: 'Templates',
      icon: TrendingUp,
    },
    {
      title: 'Expert Support',
      description: 'Dedicated team available 24/7 to help with questions and issues.',
      stat: '24/7',
      statLabel: 'Available',
      icon: Headphones,
    },
  ];

  const testimonials = [
    {
      quote: 'Univert made launching our business website incredibly easy. The team was professional and responsive throughout the process.',
      author: {
        name: 'Jennifer Walsh',
        title: 'Business Owner',
        company: 'Walsh Digital Marketing',
      },
    },
    {
      quote: 'We were live in 24 hours. The templates look professional and the support has been outstanding. Highly recommend.',
      author: {
        name: 'Robert Martinez',
        title: 'E-commerce Store Owner',
        company: 'Martinez Home Goods',
      },
    },
    {
      quote: 'The peace of mind knowing our site is automatically backed up and monitored is worth it alone. Great service.',
      author: {
        name: 'Aisha Patel',
        title: 'Agency Owner',
        company: 'Patel Creative Agency',
      },
    },
  ];

  const faqs = [
    {
      question: 'What templates do you offer?',
      answer: 'We offer 50+ professional templates for various industries including e-commerce, agencies, service businesses, blogs, portfolios, and more. All templates are fully customizable.',
    },
    {
      question: 'How long does setup take?',
      answer: 'Most websites are fully set up and live within 24 hours. Our team handles all technical configuration while you prepare your content.',
    },
    {
      question: 'Do I need technical skills?',
      answer: 'No technical skills required. Our templates are designed for everyone. We also provide support if you have questions.',
    },
    {
      question: 'Can I customize the template?',
      answer: 'Yes, all templates are fully customizable. You can change colors, fonts, layouts, add your content, and customize everything without coding.',
    },
    {
      question: 'What if I want to use my own domain?',
      answer: 'You can use your own domain or we can register a new one for you. We handle all DNS configuration and provide free SSL certificates.',
    },
    {
      question: 'Can I export and move my website later?',
      answer: 'Absolutely. You maintain full ownership. Export your entire website anytime with no fees, penalties, or lock-in. Complete freedom.',
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <HeroSection
        badge="Professional Website Platform"
        title="Launch Your Business Website in 24 Hours"
        description="Professional templates, managed setup, expert support, and complete ownership. Everything you need to build your online presence."
        cta={{
          primary: { label: 'Start Free Trial', href: '/signup' },
          secondary: { label: 'Browse Templates', href: '/templates' },
        }}
      />

      {/* Features Grid */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Core Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              We handle the complexity. You focus on your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-background">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-border bg-secondary/50">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-foreground/70">{benefit.description}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border">
                    <p className="text-sm text-foreground/50 mb-1">{benefit.statLabel}</p>
                    <p className="text-2xl font-bold">{benefit.stat}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Simple Process
            </h2>
            <p className="text-lg text-foreground/60 mb-8">
              From choosing a template to going live, here's what to expect.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { step: 1, title: 'Choose Template', desc: 'Browse 50+ professional designs' },
              { step: 2, title: 'Customize', desc: 'Add content and branding' },
              { step: 3, title: 'We Launch', desc: 'Live in 24 hours' },
            ].map((item) => (
              <Card key={item.step} className="border-border bg-background">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/70">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="gap-2">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection
        badge="Customer Stories"
        title="Trusted by Business Owners"
        description="See what our customers say about launching their websites with Univert."
        testimonials={testimonials}
        variant="featured"
      />

      {/* FAQ */}
      <FAQSection
        badge="Common Questions"
        title="Everything You Need to Know"
        description="Answers to frequently asked questions about Univert."
        faqs={faqs}
      />

      {/* CTA */}
      <CTABand
        badge="Ready to Launch?"
        title="Get Your Professional Website Today"
        description="Join thousands of business owners who trusted Univert to build their online presence."
        primaryCTA={{ label: 'Start Free Trial', href: '/signup' }}
        secondaryCTA={{ label: 'Browse Templates', href: '/templates' }}
      />
    </main>
  );
}
