import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Video,
  Calendar,
  Clock,
  Play,
  Users,
  Bell,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Webinars - Ovmon",
  description: "Learn from experts with live and on-demand webinars. Best practices, tutorials, and deep dives into Ovmon features.",
};

const upcomingWebinars = [
  {
    title: "Getting Started with Ovmon",
    description: "A comprehensive introduction to deploying your first project on Ovmon. Perfect for beginners.",
    date: "March 25, 2026",
    time: "2:00 PM UTC",
    speaker: "Alex Johnson",
    speakerRole: "Developer Advocate",
    duration: "45 min",
    registrants: 234,
  },
  {
    title: "Advanced Deployment Strategies",
    description: "Learn about preview deployments, environment variables, and CI/CD best practices.",
    date: "April 1, 2026",
    time: "3:00 PM UTC",
    speaker: "Sarah Chen",
    speakerRole: "Solutions Engineer",
    duration: "60 min",
    registrants: 156,
  },
  {
    title: "Scaling for Enterprise",
    description: "Enterprise features, security best practices, and compliance considerations for large organizations.",
    date: "April 8, 2026",
    time: "4:00 PM UTC",
    speaker: "Michael Park",
    speakerRole: "Enterprise Architect",
    duration: "60 min",
    registrants: 89,
  },
];

const pastWebinars = [
  {
    title: "Edge Functions Deep Dive",
    description: "Everything you need to know about serverless functions at the edge.",
    views: "2.4K",
    duration: "52 min",
    category: "Technical",
  },
  {
    title: "Performance Optimization Workshop",
    description: "Practical tips for achieving perfect Core Web Vitals scores.",
    views: "3.1K",
    duration: "65 min",
    category: "Workshop",
  },
  {
    title: "Building E-commerce with Ovmon",
    description: "End-to-end guide to building high-performance storefronts.",
    views: "1.8K",
    duration: "58 min",
    category: "Tutorial",
  },
  {
    title: "Database Integration Patterns",
    description: "Best practices for connecting databases to your Ovmon projects.",
    views: "1.5K",
    duration: "48 min",
    category: "Technical",
  },
  {
    title: "CI/CD Pipeline Mastery",
    description: "Automate your deployments with GitHub Actions and Ovmon.",
    views: "2.1K",
    duration: "55 min",
    category: "DevOps",
  },
  {
    title: "Migrating to Ovmon",
    description: "Step-by-step migration guide from other hosting platforms.",
    views: "1.2K",
    duration: "42 min",
    category: "Tutorial",
  },
];

export default function WebinarsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Video className="w-3.5 h-3.5 mr-1.5" />
              Webinars
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Learn from the experts
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join live sessions or watch on-demand webinars to level up your skills. 
              From beginner tutorials to advanced deep dives.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <a href="#upcoming">
                  View upcoming webinars
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <a href="#library">Browse library</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section id="upcoming" className="py-16 lg:py-24 scroll-mt-20">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Upcoming webinars
              </h2>
              <p className="text-foreground/60">
                Register now to save your spot.
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              <Bell className="mr-2 h-4 w-4" />
              Get notified
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingWebinars.map((webinar) => (
              <Card key={webinar.title} className="bg-card/60 border-border/50 hover:border-accent/40 transition-colors overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-48 shrink-0 p-6 bg-secondary/50 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-border/50">
                      <Calendar className="w-6 h-6 text-accent mb-2" />
                      <p className="text-sm font-medium text-foreground">{webinar.date}</p>
                      <p className="text-xs text-foreground/60">{webinar.time}</p>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {webinar.title}
                          </h3>
                          <p className="text-sm text-foreground/60 mb-4">
                            {webinar.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent">
                                {webinar.speaker.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span>{webinar.speaker}</span>
                              <span className="text-foreground/40">·</span>
                              <span>{webinar.speakerRole}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {webinar.duration}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {webinar.registrants} registered
                            </div>
                          </div>
                        </div>
                        <Button className="shrink-0">
                          Register
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Past Webinars Library */}
      <section id="library" className="py-16 lg:py-24 bg-secondary/20 scroll-mt-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              On-demand library
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Watch past webinars at your own pace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastWebinars.map((webinar) => (
              <Card key={webinar.title} className="bg-card/60 border-border/50 hover:border-accent/40 transition-all group cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-video bg-secondary/80 relative flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all">
                      <Play className="w-6 h-6 text-accent-foreground ml-1" />
                    </div>
                    <Badge className="absolute top-3 right-3 bg-background/80 text-foreground/80">
                      {webinar.category}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {webinar.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4">
                      {webinar.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-foreground/50">
                      <span>{webinar.views} views</span>
                      <span>{webinar.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg">
              Load more webinars
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <Card className="max-w-3xl mx-auto bg-card/80 border-border/50">
            <CardContent className="p-8 lg:p-12 text-center">
              <Video className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Want to speak at a webinar?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Share your expertise with our community. We&apos;re always looking for knowledgeable speakers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                  <Link href="/contact">
                    Apply to speak
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                  <Link href="/docs">View documentation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
