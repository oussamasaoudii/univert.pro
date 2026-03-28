'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ArrowRight, 
  Lock, 
  Download, 
  Zap, 
  Shield,
  Heart,
  FileText,
  MessageSquare,
} from 'lucide-react';

const ownershipBenefits = [
  {
    icon: Lock,
    title: 'Your Data, Your Rules',
    description: 'Your website, database, and content are completely yours. We never lock you in or hold your data hostage.',
  },
  {
    icon: Download,
    title: 'Export Anytime',
    description: 'Download your entire website, database, and content in standard formats at any time, no waiting periods.',
  },
  {
    icon: Zap,
    title: 'No Vendor Lock-In',
    description: 'Move to your own server, another hosting provider, or bring in your own technical team whenever you want.',
  },
  {
    icon: MessageSquare,
    title: 'Migration Support',
    description: 'We&apos;ll help you move your website. Our team provides migration guidance and technical assistance.',
  },
  {
    icon: Shield,
    title: 'Full Control Later',
    description: 'Start managed with us for peace of mind, then take full technical control whenever you&apos;re ready.',
  },
  {
    icon: Heart,
    title: 'Built on Trust',
    description: 'This freedom to move is a core promise of Univert Pro. We build better by letting customers leave.',
  },
];

const steps = [
  {
    step: 1,
    title: 'You Own Everything',
    description: 'From day one, you own your website, content, domain, and data. We&apos;re the managed provider, not the owner.',
  },
  {
    step: 2,
    title: 'Request Export',
    description: 'Contact support or use your dashboard to request a complete export of your website and database.',
  },
  {
    step: 3,
    title: 'Get Standard Formats',
    description: 'Receive your data in WordPress exports, SQL backups, or other standard formats compatible with any host.',
  },
  {
    step: 4,
    title: 'We Help Migration',
    description: 'Our team provides free guidance and technical support to help you move smoothly to your new host.',
  },
  {
    step: 5,
    title: 'Move at Your Pace',
    description: 'You control the timeline. Keep your site with us as long as it makes sense for your business.',
  },
];

const faqItems = [
  {
    question: 'What if I want to move my website in 6 months?',
    answer: 'Absolutely no problem. You can export your website and move it anytime. We provide migration support to make the transition smooth.',
  },
  {
    question: 'Will my data be in proprietary formats?',
    answer: 'No. We use standard formats like WordPress, Laravel databases, and SQL backups. Your data is portable and not locked to our platform.',
  },
  {
    question: 'Do you charge fees for export or migration?',
    answer: 'No migration fees. Export is included with all plans. We want to earn your business by being the best option, not by making it hard to leave.',
  },
  {
    question: 'What if I want to hire my own developers?',
    answer: 'You can take over technical management anytime. Export your site, get the source code, and work with any developer or agency you choose.',
  },
  {
    question: 'Is this really a "no lock-in" guarantee?',
    answer: 'Yes. This is a core principle of Univert Pro. We don&apos;t trap customers. We earn loyalty by being genuinely valuable, not by making leaving difficult.',
  },
  {
    question: 'What about custom domains and DNS?',
    answer: 'You own your domain. You can point it to our service or anywhere else. You keep full control of DNS records.',
  },
];

export default function OwnershipPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center pt-20 pb-12 lg:pt-24 lg:pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.15),transparent)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent px-4 py-1.5 text-sm font-medium mx-auto block w-fit">
              <Lock className="w-3.5 h-3.5 mr-2 inline" />
              Freedom & Ownership
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight text-balance">
              Your website stays <span className="text-accent">completely yours</span>
            </h1>

            <p className="text-lg text-foreground/70 mb-8 leading-relaxed max-w-xl mx-auto">
              Start with managed simplicity. Move to your own server anytime. No lock-in. No games. Just complete ownership and freedom of your website.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
                <Link href="/templates">
                  Start Your Website
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  Questions? Let&apos;s Talk
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ownership Benefits Grid */}
      <section className="py-12 lg:py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Univert Pro is Different</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              We believe in customer freedom and ownership. That&apos;s not just marketing—it&apos;s built into how we operate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownershipBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="border border-border/50 hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-accent" />
                      </div>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/70">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-12 lg:py-16 bg-secondary/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works: Moving Your Website</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              If you ever decide to move, the process is straightforward and we&apos;re here to help every step.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 md:gap-2">
            {steps.map((item, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex w-full h-0.5 bg-border/50 mt-5 -ml-2" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 lg:py-16 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ownership FAQ</h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <Card key={index} className="border border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-accent/5 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Build Your Website?</h2>
          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            Launch a professional website with complete peace of mind. Your data is yours. Your freedom is guaranteed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
              <Link href="/templates">
                Browse Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">
                How It Works
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
