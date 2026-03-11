import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Newspaper,
  Download,
  Mail,
  ExternalLink,
  ArrowRight,
  Calendar,
  FileText,
  Image as ImageIcon,
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Press & Media - Ovmon',
  description: 'Press releases, media resources, and company information for journalists and analysts.',
};

const pressReleases = [
  {
    date: 'March 2026',
    title: 'Ovmon Raises $50M Series B to Accelerate Global Expansion',
    excerpt: 'Funding will be used to expand edge network to 200+ locations and grow the enterprise team.',
    link: '#',
  },
  {
    date: 'January 2026',
    title: 'Ovmon Launches Edge Functions with Sub-50ms Cold Starts',
    excerpt: 'New serverless offering enables developers to run code at the edge with industry-leading performance.',
    link: '#',
  },
  {
    date: 'November 2025',
    title: 'Ovmon Achieves SOC 2 Type II Certification',
    excerpt: 'Platform passes rigorous security audit, demonstrating commitment to enterprise-grade security.',
    link: '#',
  },
  {
    date: 'September 2025',
    title: 'Ovmon Reaches 100,000 Active Developers',
    excerpt: 'Milestone reflects strong adoption among developers and teams building modern web applications.',
    link: '#',
  },
];

const mediaResources = [
  {
    title: 'Logo Package',
    description: 'Official Ovmon logos in SVG, PNG, and EPS formats for light and dark backgrounds.',
    icon: ImageIcon,
    link: '#',
  },
  {
    title: 'Brand Guidelines',
    description: 'Complete brand guide including colors, typography, and usage guidelines.',
    icon: FileText,
    link: '#',
  },
  {
    title: 'Product Screenshots',
    description: 'High-resolution screenshots of the Ovmon dashboard and developer tools.',
    icon: ImageIcon,
    link: '#',
  },
  {
    title: 'Executive Bios',
    description: 'Biographies and headshots of Ovmon leadership team.',
    icon: FileText,
    link: '#',
  },
];

const newsFeatures = [
  {
    publication: 'TechCrunch',
    title: 'Ovmon is making web deployment faster than ever',
    date: 'Feb 2026',
    link: '#',
  },
  {
    publication: 'The Verge',
    title: 'This startup wants to be the next big thing in cloud hosting',
    date: 'Jan 2026',
    link: '#',
  },
  {
    publication: 'Wired',
    title: 'How edge computing is changing the web',
    date: 'Dec 2025',
    link: '#',
  },
  {
    publication: 'Forbes',
    title: 'Top 50 Cloud Companies to Watch',
    date: 'Nov 2025',
    link: '#',
  },
];

const companyStats = [
  { label: 'Developers', value: '100K+' },
  { label: 'Edge Locations', value: '150+' },
  { label: 'Daily Deployments', value: '1M+' },
  { label: 'Countries', value: '190+' },
];

const awards = [
  { title: 'Best Developer Tool 2025', organization: 'DevTools Awards' },
  { title: 'Top Cloud Startup', organization: 'Cloud 100' },
  { title: 'Best New Technology', organization: 'WebExpo' },
];

export default function PressPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Newspaper className="h-3 w-3 mr-1" />
              Press & Media
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              News & Resources
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Find the latest news, press releases, and media resources about Ovmon. For press inquiries, contact our media team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="mailto:press@ovmon.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Press Team
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#resources">
                  <Download className="mr-2 h-4 w-4" />
                  Media Kit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyStats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border/50 text-center">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-accent mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Press Releases
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Latest Announcements
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {pressReleases.map((release) => (
              <Card key={release.title} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{release.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{release.title}</h3>
                  <p className="text-muted-foreground mb-4">{release.excerpt}</p>
                  <Link
                    href={release.link}
                    className="inline-flex items-center text-sm font-medium text-accent hover:underline"
                  >
                    Read full release
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News Coverage */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              In the News
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Media Coverage
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {newsFeatures.map((news) => (
              <Card key={news.title} className="bg-card/50 border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3 text-accent border-accent/30">
                    {news.publication}
                  </Badge>
                  <h3 className="font-semibold text-foreground mb-2">{news.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{news.date}</span>
                    <Link
                      href={news.link}
                      className="inline-flex items-center text-sm font-medium text-accent hover:underline"
                    >
                      Read
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              <Award className="h-3 w-3 mr-1" />
              Recognition
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Awards & Accolades
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {awards.map((award) => (
              <Card key={award.title} className="bg-card/50 border-border/50 text-center">
                <CardContent className="p-6">
                  <Award className="h-8 w-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">{award.title}</h3>
                  <p className="text-sm text-muted-foreground">{award.organization}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Resources */}
      <section id="resources" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              <Download className="h-3 w-3 mr-1" />
              Media Resources
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Press Kit
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Download official Ovmon brand assets and resources for your coverage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {mediaResources.map((resource) => (
              <Card key={resource.title} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 shrink-0">
                      <resource.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      <Link
                        href={resource.link}
                        className="inline-flex items-center text-sm font-medium text-accent hover:underline"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Press Inquiries
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              For press inquiries, interview requests, or additional information, please contact our communications team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="mailto:press@ovmon.com">
                  <Mail className="mr-2 h-4 w-4" />
                  press@ovmon.com
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">
                  About Ovmon
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
