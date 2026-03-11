import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Handshake,
  Award,
  Users,
  BadgeCheck,
  Globe,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Partners - Ovmon",
  description: "Join the Ovmon partner program. Technology partners, agencies, and solution providers working together.",
};

const partnerTypes = [
  {
    icon: Briefcase,
    title: "Agency Partners",
    description: "Build and deploy client projects on Ovmon. Get exclusive resources, training, and support.",
    benefits: [
      "Priority support channel",
      "Co-marketing opportunities",
      "Partner badge & listing",
      "Revenue sharing program",
    ],
  },
  {
    icon: Globe,
    title: "Technology Partners",
    description: "Integrate your technology with Ovmon. Create seamless experiences for shared customers.",
    benefits: [
      "Integration development support",
      "Joint documentation",
      "Marketplace listing",
      "Technical collaboration",
    ],
  },
  {
    icon: GraduationCap,
    title: "Education Partners",
    description: "Teach modern web development with Ovmon. Free resources for educators and students.",
    benefits: [
      "Free educational credits",
      "Curriculum resources",
      "Student programs",
      "Guest speaker opportunities",
    ],
  },
];

const featuredPartners = [
  { name: "Acme Studio", type: "Agency", region: "North America" },
  { name: "TechFlow Inc", type: "Technology", region: "Europe" },
  { name: "DevCraft Agency", type: "Agency", region: "Asia Pacific" },
  { name: "CloudSync", type: "Technology", region: "Global" },
  { name: "WebMasters Pro", type: "Agency", region: "Latin America" },
  { name: "InnovateTech", type: "Technology", region: "Europe" },
];

const stats = [
  { value: "500+", label: "Partners worldwide" },
  { value: "50+", label: "Countries represented" },
  { value: "10K+", label: "Projects delivered" },
  { value: "95%", label: "Partner satisfaction" },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Handshake className="w-3.5 h-3.5 mr-1.5" />
              Partner Program
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Grow with Ovmon
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join our partner ecosystem. Whether you&apos;re an agency, technology provider, 
              or educator, we have a program for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="#programs">
                  Explore programs
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/30 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-accent mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Programs */}
      <section id="programs" className="py-16 lg:py-24 scroll-mt-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Partner programs
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Choose the program that fits your business model.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {partnerTypes.map((partner) => (
              <Card key={partner.title} className="bg-card/60 border-border/50 hover:border-accent/40 transition-colors h-full">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <partner.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {partner.title}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-6">
                    {partner.description}
                  </p>
                  <div className="space-y-3 mb-6">
                    {partner.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm text-foreground/80">
                        <BadgeCheck className="w-4 h-4 text-accent shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full group">
                    Apply now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Partners */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Featured partners
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Trusted by leading agencies and technology companies worldwide.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPartners.map((partner) => (
              <Card key={partner.name} className="bg-card/60 border-border/50 hover:border-accent/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{partner.name}</h3>
                      <p className="text-sm text-foreground/60">{partner.region}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {partner.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg">
              View all partners
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
                <Award className="w-3.5 h-3.5 mr-1.5" />
                Benefits
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Why partner with us?
              </h2>
              <p className="text-foreground/60 mb-8">
                Our partner program is designed to help you grow your business while 
                delivering exceptional results for your clients.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Dedicated support</h4>
                    <p className="text-sm text-foreground/60">
                      Access to partner success managers and priority technical support.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Recognition & visibility</h4>
                    <p className="text-sm text-foreground/60">
                      Partner badges, directory listing, and co-marketing opportunities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Training & resources</h4>
                    <p className="text-sm text-foreground/60">
                      Exclusive training programs, certifications, and technical resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-card/80 border-border/50">
                <CardContent className="p-8 lg:p-10">
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    Become a partner
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium text-sm">1</div>
                      <p className="text-sm text-foreground">Submit your application</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium text-sm">2</div>
                      <p className="text-sm text-foreground">Meet with our team</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium text-sm">3</div>
                      <p className="text-sm text-foreground">Get onboarded & start growing</p>
                    </div>
                  </div>
                  <Button className="w-full mt-8 group">
                    Start application
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <Card className="max-w-3xl mx-auto bg-card/80 border-border/50">
            <CardContent className="p-8 lg:p-12 text-center">
              <Handshake className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to partner with us?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Join our growing ecosystem of agencies, technology providers, and educators.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                  <Link href="/contact">
                    Apply today
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                  <Link href="/contact">Talk to sales</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
