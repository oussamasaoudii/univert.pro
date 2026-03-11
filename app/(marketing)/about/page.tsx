'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Users,
  Target,
  Zap,
  Heart,
  Globe,
  Shield,
  Rocket,
  ArrowRight,
  Building2,
  Award,
  BarChart3,
  Server,
} from 'lucide-react';
import {
  HeroSection,
  StatsSection,
  BenefitsGrid,
  CTABand,
  TestimonialSection,
  LogoCloud,
} from '@/components/marketing/sections';

// Company values
const values = [
  {
    icon: Zap,
    title: 'Performance First',
    description: 'We optimize for speed and reliability at every layer of our platform, delivering sub-50ms response times globally.',
  },
  {
    icon: Users,
    title: 'Developer Friendly',
    description: 'Intuitive tools, comprehensive APIs, and seamless Git integration designed for modern development workflows.',
  },
  {
    icon: Target,
    title: 'Mission Focused',
    description: 'We empower teams to deploy, monitor, and scale their applications effortlessly without infrastructure headaches.',
  },
  {
    icon: Heart,
    title: 'Customer Obsessed',
    description: 'Every feature and decision is driven by the needs of our customers. Your success is our success.',
  },
  {
    icon: Shield,
    title: 'Security & Trust',
    description: 'Enterprise-grade security with SOC2 certification, ensuring your data and applications are protected.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Infrastructure spanning 150+ locations worldwide, bringing your applications closer to your users.',
  },
];

// Stats
const companyStats = [
  { value: 50000, suffix: '+', label: 'Active Developers', icon: Users },
  { value: 150, suffix: '+', label: 'Edge Locations', icon: Globe },
  { value: 99.99, suffix: '%', label: 'Uptime SLA', icon: Server },
  { value: 2, suffix: 'B+', label: 'Monthly Requests', icon: BarChart3 },
];

// Investor logos (placeholder names)
const investorLogos = [
  { name: 'Sequoia' },
  { name: 'Andreessen' },
  { name: 'Accel' },
  { name: 'GV' },
  { name: 'Index' },
  { name: 'Greylock' },
];

// Leadership team
const leadership = [
  {
    name: 'Alex Chen',
    role: 'CEO & Co-founder',
    bio: 'Previously VP of Engineering at a major cloud provider. 15+ years in infrastructure and developer tools.',
  },
  {
    name: 'Sarah Williams',
    role: 'CTO & Co-founder',
    bio: 'Former principal engineer at a leading tech company. Expert in distributed systems and edge computing.',
  },
  {
    name: 'Michael Park',
    role: 'VP of Engineering',
    bio: 'Built engineering teams at two successful startups. Passionate about developer experience.',
  },
  {
    name: 'Emily Johnson',
    role: 'VP of Product',
    bio: 'Led product at multiple B2B SaaS companies. Focused on making complex technology accessible.',
  },
];

// Testimonials
const aboutTestimonials = [
  {
    quote: 'The team at Ovmon truly understands what developers need. Their platform is a joy to use and their support is exceptional.',
    author: {
      name: 'David Rodriguez',
      title: 'Staff Engineer',
      company: 'TechCorp',
    },
    rating: 5,
    featured: true,
  },
  {
    quote: 'We chose Ovmon because of their commitment to security and reliability. They have exceeded our expectations.',
    author: {
      name: 'Lisa Chen',
      title: 'Director of Infrastructure',
      company: 'FinanceApp',
    },
    rating: 5,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge={{ text: 'About Us' }}
        title="Building the future of"
        titleHighlight="web deployment"
        description="We're on a mission to make website deployment and management accessible to developers of all skill levels. Join 50,000+ developers who trust Ovmon."
        actions={[
          { label: 'Join Our Team', href: '/careers', variant: 'primary' },
          { label: 'Contact Us', href: '/contact', variant: 'outline' },
        ]}
        variant="centered"
        backgroundVariant="gradient"
      />

      {/* Stats */}
      <StatsSection
        stats={companyStats}
        variant="contained"
        columns={4}
      />

      {/* Our Story */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                Our Story
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
                From frustration to innovation
              </h2>
            </div>
            <div className="space-y-6 text-lg text-foreground/70 leading-relaxed">
              <p>
                Ovmon was founded with a simple mission: to make website deployment and management accessible to
                developers of all skill levels. We recognized that the existing hosting landscape was fragmented,
                complex, and often required deep infrastructure knowledge that most developers did not have.
              </p>
              <p>
                Our founders experienced this frustration firsthand while building products at previous companies.
                Hours spent on deployment pipelines, wrestling with configuration, and debugging infrastructure
                issues - time that could have been spent building features and delighting users.
              </p>
              <p>
                Today, we serve over 50,000 developers and businesses who trust us with their web applications.
                Our platform combines powerful automation with intuitive design, allowing teams to focus on what
                matters most - building great products and serving their customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/20">
        <BenefitsGrid
          badge="Our Values"
          title="What drives us"
          description="These principles guide every decision we make and every feature we build."
          benefits={values}
          variant="cards"
          columns={3}
        />
      </section>

      {/* Leadership Team */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Leadership
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Meet our team
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Experienced leaders passionate about developer tools and infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {leadership.map((person) => (
              <Card key={person.name} className="bg-card border-border/50 hover:border-accent/40 transition-colors">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-accent">
                    {person.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground text-center">{person.name}</h3>
                  <p className="text-sm text-accent text-center mb-3">{person.role}</p>
                  <p className="text-sm text-foreground/60 text-center">{person.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Backed By */}
      <LogoCloud
        title="Backed by leading investors"
        logos={investorLogos}
        variant="minimal"
      />

      {/* Testimonials */}
      <TestimonialSection
        badge="What People Say"
        title="Loved by developers"
        description="Hear from the teams building on Ovmon."
        testimonials={aboutTestimonials}
        variant="featured"
      />

      {/* Careers CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-accent/10 via-card to-card border-accent/30">
            <CardContent className="p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div>
                  <Badge variant="outline" className="border-accent/50 text-accent mb-4">
                    We're Hiring
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                    Join our team
                  </h3>
                  <p className="text-foreground/70 max-w-lg">
                    We're looking for talented engineers, designers, and product specialists who are
                    passionate about developer tools and want to help shape the future of web deployment.
                  </p>
                </div>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0" asChild>
                  <Link href="/careers">
                    View Open Positions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <CTABand
        title="Have questions? We'd love to hear from you."
        description="Reach out to our team for sales inquiries, partnerships, or general questions."
        actions={[
          { label: 'Contact Us', href: '/contact', variant: 'primary' },
          { label: 'hello@ovmon.com', href: 'mailto:hello@ovmon.com', variant: 'outline' },
        ]}
        variant="default"
      />
    </main>
  );
}
