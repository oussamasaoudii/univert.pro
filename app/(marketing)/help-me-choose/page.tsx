'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Zap, FileText, Code } from 'lucide-react';
import { HeroSection, CTABand } from '@/components/marketing/sections';

type Stack = 'wordpress' | 'laravel' | 'nextjs' | null;

interface StackInfo {
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  bestFor: string[];
  editing: string;
  customization: string;
  scalability: string;
  cost: string;
  learning: string;
  features: string[];
}

const stacks: Record<Stack, StackInfo> = {
  wordpress: {
    name: 'WordPress',
    subtitle: 'Perfect for content-focused sites',
    icon: <FileText className="w-8 h-8" />,
    description: 'The most popular CMS worldwide. Built for bloggers, publishers, and content creators who want powerful content management without coding.',
    bestFor: ['Blogs & news sites', 'Portfolio websites', 'Small business sites', 'Content-heavy sites', 'Ecommerce stores'],
    editing: 'Drag-and-drop editor with live preview. Add content instantly without any technical knowledge.',
    customization: 'Thousands of plugins and themes. Customize everything visually or hire a developer if needed.',
    scalability: 'Handles millions of visitors. Scales with managed hosting and caching.',
    cost: 'Transparent pricing. No hidden costs. Full control over your budget.',
    learning: 'User-friendly for non-technical users. Learn as you go or use our support team.',
    features: ['Easy content management', 'Built-in SEO tools', 'Plugin ecosystem', 'Mobile-responsive', 'User management', 'Scheduled publishing'],
  },
  laravel: {
    name: 'Laravel',
    subtitle: 'Powerful for custom applications',
    icon: <Zap className="w-8 h-8" />,
    description: 'A modern PHP framework for developers. Perfect for custom applications, SaaS platforms, and businesses that need specific functionality.',
    bestFor: ['Custom web applications', 'SaaS platforms', 'Complex business logic', 'Real-time applications', 'API-driven products'],
    editing: 'Full control through code. Deploy updates instantly. Version control and staging environments.',
    customization: 'Completely customizable. Built exactly how you need it. No plugin limitations.',
    scalability: 'Scales infinitely. Designed for high-traffic applications and complex databases.',
    cost: 'Transparent pricing. Scale costs with your growth.',
    learning: 'Requires developer knowledge. Our team handles setup and deployment.',
    features: ['Full customization', 'Database flexibility', 'Real-time capabilities', 'Advanced authentication', 'API-first design', 'Scheduled tasks'],
  },
  nextjs: {
    name: 'Next.js',
    subtitle: 'Modern frontend with React',
    icon: <Code className="w-8 h-8" />,
    description: 'A modern React framework for high-performance web applications. Perfect for startups, agencies, and teams building cutting-edge products.',
    bestFor: ['Modern web apps', 'Startup MVP platforms', 'Agency projects', 'Real-time dashboards', 'Mobile-first products'],
    editing: 'Deploy instantly with Git. Full control over your tech stack.',
    customization: 'Complete flexibility. Use any service or API. Build custom features quickly.',
    scalability: 'Designed for scale from day one. Automatic optimization and edge computing.',
    cost: 'Transparent pricing with predictable scaling costs.',
    learning: 'Requires React/JavaScript knowledge. Our team handles deployment and optimization.',
    features: ['Server-side rendering', 'Static generation', 'API routes', 'Image optimization', 'Fast builds', 'Developer experience'],
  },
  null: {
    name: '',
    subtitle: '',
    icon: null,
    description: '',
    bestFor: [],
    editing: '',
    customization: '',
    scalability: '',
    cost: '',
    learning: '',
    features: [],
  },
};

export const metadata = {
  title: 'Help Me Choose - Univert',
  description: 'Choose between WordPress, Laravel, and Next.js based on your business needs, content editing requirements, budget, and technical expertise.',
};

export default function HelpMeChoosePage() {
  const [selectedStack, setSelectedStack] = useState<Stack>(null);
  const [step, setStep] = useState(1);

  const handleStackSelect = (stack: Stack) => {
    setSelectedStack(stack);
    setStep(2);
  };

  const resetSelection = () => {
    setSelectedStack(null);
    setStep(1);
  };

  const stackInfo = stacks[selectedStack];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="Choose Your Perfect Stack"
        title="Help Me Choose the Right Website Platform"
        description="Answer a few questions about your business and we'll recommend the perfect stack. Or explore each option below."
        cta={{
          primary: { label: 'Explore Options', href: '#stacks' },
          secondary: { label: 'Talk to Our Team', href: '/contact' },
        }}
      />

      {/* Main Decision Section */}
      <section id="stacks" className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-5xl">
          {selectedStack === null ? (
            <>
              <div className="text-center mb-16">
                <Badge className="mb-4">Step 1: Choose Your Platform</Badge>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  Three Powerful Options
                </h2>
                <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                  Each stack is powerful and proven. Choose based on your needs, team expertise, and business goals.
                </p>
              </div>

              {/* Stack Comparison Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {['wordpress', 'laravel', 'nextjs'].map((stack) => {
                  const info = stacks[stack as Stack];
                  return (
                    <Card
                      key={stack}
                      className="cursor-pointer hover:border-accent/50 transition-all hover:shadow-lg hover-lift border-border"
                      onClick={() => handleStackSelect(stack as Stack)}
                    >
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 text-accent">
                          {info.icon}
                        </div>
                        <CardTitle className="text-2xl mb-2">{info.name}</CardTitle>
                        <p className="text-sm text-foreground/60">{info.subtitle}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-foreground/70">{info.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Best for:</p>
                          <ul className="space-y-1">
                            {info.bestFor.slice(0, 3).map((use, i) => (
                              <li key={i} className="text-sm text-foreground/60 flex items-start gap-2">
                                <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                {use}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button className="w-full" onClick={() => handleStackSelect(stack as Stack)}>
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Selected Stack Details */}
              <div className="mb-12">
                <Button variant="outline" onClick={resetSelection} className="mb-8">
                  ← Choose a Different Stack
                </Button>

                <div className="mb-8">
                  <Badge className="mb-4">Step 2: Detailed Comparison</Badge>
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                      {stackInfo.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold mb-2">{stackInfo.name}</h2>
                      <p className="text-xl text-foreground/70">{stackInfo.description}</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Features */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {[
                    { label: 'Content Editing', value: stackInfo.editing },
                    { label: 'Customization', value: stackInfo.customization },
                    { label: 'Scalability', value: stackInfo.scalability },
                    { label: 'Cost Model', value: stackInfo.cost },
                    { label: 'Learning Curve', value: stackInfo.learning },
                    { label: 'Best Use Cases', value: stackInfo.bestFor.join(', ') },
                  ].map((item, idx) => (
                    <Card key={idx} className="border-border">
                      <CardHeader>
                        <CardTitle className="text-base">{item.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/70 text-sm">{item.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Key Features List */}
                <div className="bg-secondary/30 rounded-lg p-8 mb-12">
                  <h3 className="text-xl font-bold mb-4">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {stackInfo.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
                    <Link href="/templates">
                      View {stackInfo.name} Templates
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact">
                      Talk to an Expert
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Comparison Matrix */}
      {selectedStack === null && (
        <section className="py-20 md:py-32 px-4 sm:px-6 bg-secondary/30">
          <div className="container max-w-5xl">
            <div className="text-center mb-16">
              <Badge className="mb-4">Quick Comparison</Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Stack Comparison Matrix
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-bold text-foreground">Criteria</th>
                    <th className="text-center py-4 px-4 font-bold text-foreground">WordPress</th>
                    <th className="text-center py-4 px-4 font-bold text-foreground">Laravel</th>
                    <th className="text-center py-4 px-4 font-bold text-foreground">Next.js</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Content Editing', wordpress: 'Excellent', laravel: 'Custom', nextjs: 'API-Based' },
                    { label: 'Learning Curve', wordpress: 'Easy', laravel: 'Medium', nextjs: 'Medium-Hard' },
                    { label: 'Setup Time', wordpress: '24 hours', laravel: '24 hours', nextjs: '24 hours' },
                    { label: 'Customization', wordpress: 'Good', laravel: 'Unlimited', nextjs: 'Unlimited' },
                    { label: 'Best For', wordpress: 'Content Sites', laravel: 'Custom Apps', nextjs: 'Modern Apps' },
                    { label: 'Scalability', wordpress: 'Very High', laravel: 'Very High', nextjs: 'Very High' },
                    { label: 'Export Ability', wordpress: 'Easy', laravel: 'Easy', nextjs: 'Easy' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-accent/5">
                      <td className="py-4 px-4 font-medium text-foreground">{row.label}</td>
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
      )}

      {/* FAQ Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-background">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Choosing Your Stack
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change stacks later?',
                a: 'Yes. You can export your website anytime and migrate to a different stack if your needs change.',
              },
              {
                q: 'Which stack is cheapest?',
                a: 'All three have transparent pricing with no hidden fees. Cost depends on your usage, not the stack choice.',
              },
              {
                q: 'Do I need coding skills?',
                a: 'WordPress requires no coding. Laravel and Next.js can be fully managed by our team, or you can bring your own developers.',
              },
              {
                q: 'What if I\'m not sure?',
                a: 'Talk to our team. We help hundreds of businesses choose the right platform. Book a free consultation.',
              },
              {
                q: 'Can I use multiple stacks?',
                a: 'Yes. Build multiple websites on different stacks. Each has its own plan and can be managed independently.',
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

      {/* CTA Band */}
      <CTABand
        badge="Ready to Choose?"
        title="Get Started With the Perfect Stack"
        description="Our team will guide you through setup and have your website live in 24 hours."
        primaryCTA={{ label: 'Browse Templates', href: '/templates' }}
        secondaryCTA={{ label: 'Talk to Our Team', href: '/contact' }}
      />
    </main>
  );
}
