import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Target,
  Zap,
  Heart,
  Globe,
  Shield,
  ArrowRight,
  Palette,
  Headphones,
  Key,
} from 'lucide-react';
import {
  HeroSection,
  CTABand,
} from '@/components/marketing/sections';

export const metadata = {
  title: 'About Univert - Managed Website Platform for Businesses',
  description: 'Univert is a managed website platform that helps businesses launch professional websites without the technical complexity.',
};

// Company values - honest and grounded
const values = [
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'We remove the technical barriers so you can focus on your business, not infrastructure.',
  },
  {
    icon: Palette,
    title: 'Quality Templates',
    description: 'Professionally designed templates that give your business a polished online presence from day one.',
  },
  {
    icon: Headphones,
    title: 'Managed Support',
    description: 'Our team handles the technical details. You get a website that works, backed by real human support.',
  },
  {
    icon: Key,
    title: 'Ownership Freedom',
    description: 'Your website, your content. Export your data anytime. We never lock you in.',
  },
  {
    icon: Shield,
    title: 'Reliable Hosting',
    description: 'Your website runs on modern infrastructure with SSL included. We keep it online and secure.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Every decision we make starts with what helps our customers succeed online.',
  },
];

// What we do - clear and honest
const whatWeDo = [
  {
    title: 'Template Selection',
    description: 'Browse our curated collection of website templates. Each is designed for specific business needs - from e-commerce stores to service portfolios.',
  },
  {
    title: 'Managed Setup',
    description: 'Once you choose a template, our team handles the technical setup. We configure your website, set up hosting, and prepare it for launch.',
  },
  {
    title: 'Custom Domain',
    description: 'Connect your own domain name. We provide clear instructions and help with DNS configuration. SSL certificates are included.',
  },
  {
    title: 'Ongoing Support',
    description: 'After launch, our support team is available to help with questions, updates, and technical issues. You are not on your own.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: 'About Univert' }}
        title="Professional websites for"
        titleHighlight="growing businesses"
        description="Univert is a managed website platform. We handle the technical complexity of building and hosting professional websites so you can focus on running your business."
        actions={[
          { label: 'Browse Templates', href: '/templates', variant: 'primary' },
          { label: 'Contact Us', href: '/contact', variant: 'outline' },
        ]}
        variant="centered"
        backgroundVariant="gradient"
      />

      {/* Our Mission */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                Our Mission
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
                Making professional websites accessible
              </h2>
            </div>
            <div className="space-y-6 text-lg text-foreground/70 leading-relaxed">
              <p>
                Many businesses struggle with the technical complexity of launching a website. Between choosing 
                hosting providers, configuring servers, managing security, and keeping everything running smoothly, 
                the process can be overwhelming - especially if technology is not your expertise.
              </p>
              <p>
                Univert exists to solve this problem. We offer professionally designed website templates paired 
                with managed hosting and support. You choose the template that fits your business, and we handle 
                the rest: setup, hosting, SSL certificates, and ongoing maintenance.
              </p>
              <p>
                Our goal is simple: give businesses a professional online presence without requiring them to 
                become technical experts. Your website should work for you, not create more work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              How It Works
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              From template to live website
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              A straightforward process designed for business owners, not developers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whatWeDo.map((item, index) => (
              <Card key={item.title} className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-lg font-bold text-accent">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-foreground/60 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Our Approach
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              What we believe in
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Principles that guide how we build and support the Univert platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="bg-card border-border/50 hover:border-accent/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ownership Commitment */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-border/50">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Key className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Your website, your ownership
                    </h3>
                    <div className="space-y-4 text-foreground/70 leading-relaxed">
                      <p>
                        We believe you should always own your website and content. Univert is not a platform 
                        that locks you in. If you ever decide to move on, you can request a full export of 
                        your website files and data.
                      </p>
                      <p>
                        This commitment to ownership means you are always in control. We earn your continued 
                        business through quality service, not artificial barriers.
                      </p>
                    </div>
                    <div className="mt-6">
                      <Button variant="outline" asChild>
                        <Link href="/about/ownership">
                          Learn About Data Ownership
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <CTABand
        title="Questions about Univert?"
        description="We are happy to answer questions about our platform, pricing, or how we can help your business."
        actions={[
          { label: 'Contact Us', href: '/contact', variant: 'primary' },
          { label: 'Browse Templates', href: '/templates', variant: 'outline' },
        ]}
        variant="default"
      />
    </main>
  );
}
