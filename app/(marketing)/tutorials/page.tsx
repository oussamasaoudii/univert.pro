import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Lightbulb, Play, Clock, ArrowRight, BookOpen, Code, Settings, Zap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Tutorials - Ovmon',
  description: 'Step-by-step guides and walkthroughs for the Ovmon platform.'
};

export default function TutorialsPage() {
  const featuredTutorials = [
    {
      title: 'Deploy Your First Website in 5 Minutes',
      description: 'Learn the basics of Ovmon and deploy your first website from scratch.',
      duration: '5 min',
      level: 'Beginner',
      category: 'Getting Started',
      icon: BookOpen,
      href: '/docs/getting-started'
    },
    {
      title: 'Setting Up Custom Domains',
      description: 'Configure your own domain with automatic SSL certificates.',
      duration: '10 min',
      level: 'Beginner',
      category: 'Configuration',
      icon: Settings,
      href: '/docs/configuration'
    },
    {
      title: 'Building a CI/CD Pipeline',
      description: 'Automate your deployments with GitHub Actions and Ovmon.',
      duration: '15 min',
      level: 'Intermediate',
      category: 'Deployment',
      icon: Zap,
      href: '/docs/deployment'
    },
    {
      title: 'API Authentication Best Practices',
      description: 'Secure your API endpoints with proper authentication.',
      duration: '20 min',
      level: 'Intermediate',
      category: 'Security',
      icon: Shield,
      href: '/docs/security'
    }
  ];

  const tutorialCategories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      tutorials: [
        { title: 'Creating Your Account', duration: '2 min', level: 'Beginner' },
        { title: 'Installing the CLI', duration: '3 min', level: 'Beginner' },
        { title: 'Your First Deployment', duration: '5 min', level: 'Beginner' },
        { title: 'Understanding the Dashboard', duration: '8 min', level: 'Beginner' }
      ]
    },
    {
      title: 'Configuration',
      icon: Settings,
      tutorials: [
        { title: 'Environment Variables', duration: '10 min', level: 'Beginner' },
        { title: 'Custom Domains & SSL', duration: '10 min', level: 'Beginner' },
        { title: 'Build Settings', duration: '12 min', level: 'Intermediate' },
        { title: 'Serverless Functions', duration: '15 min', level: 'Intermediate' }
      ]
    },
    {
      title: 'Deployment',
      icon: Zap,
      tutorials: [
        { title: 'Git Integration', duration: '8 min', level: 'Beginner' },
        { title: 'Preview Deployments', duration: '10 min', level: 'Beginner' },
        { title: 'Rollbacks & Recovery', duration: '10 min', level: 'Intermediate' },
        { title: 'Multi-Region Deployment', duration: '15 min', level: 'Advanced' }
      ]
    },
    {
      title: 'API & Integrations',
      icon: Code,
      tutorials: [
        { title: 'REST API Basics', duration: '15 min', level: 'Intermediate' },
        { title: 'Webhooks Setup', duration: '12 min', level: 'Intermediate' },
        { title: 'Third-Party Integrations', duration: '20 min', level: 'Intermediate' },
        { title: 'Building Custom Tools', duration: '25 min', level: 'Advanced' }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      tutorials: [
        { title: 'Securing Environment Variables', duration: '10 min', level: 'Beginner' },
        { title: 'Access Control & Permissions', duration: '12 min', level: 'Intermediate' },
        { title: 'Security Headers', duration: '10 min', level: 'Intermediate' },
        { title: 'Compliance & Auditing', duration: '15 min', level: 'Advanced' }
      ]
    },
    {
      title: 'Team Collaboration',
      icon: Users,
      tutorials: [
        { title: 'Inviting Team Members', duration: '5 min', level: 'Beginner' },
        { title: 'Role-Based Access', duration: '10 min', level: 'Intermediate' },
        { title: 'Team Workflows', duration: '15 min', level: 'Intermediate' },
        { title: 'Enterprise SSO Setup', duration: '20 min', level: 'Advanced' }
      ]
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <MarketingLayout
      title="Tutorials"
      description="Step-by-step guides and walkthroughs"
    >
      {/* Featured Tutorials */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-accent" />
          <h2 className="text-3xl font-bold">Featured Tutorials</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredTutorials.map((tutorial, idx) => {
            const Icon = tutorial.icon;
            return (
              <Link
                key={idx}
                href={tutorial.href}
                className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-accent">{tutorial.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(tutorial.level)}`}>
                        {tutorial.level}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">{tutorial.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {tutorial.duration}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Tutorials by Category */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold">All Tutorials</h2>

        {tutorialCategories.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-semibold">{category.title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.tutorials.map((tutorial, tidx) => (
                  <a
                    key={tidx}
                    href="#"
                    className="p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Play className="w-4 h-4 text-accent" />
                      <span className="group-hover:text-accent transition-colors">{tutorial.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(tutorial.level)}`}>
                        {tutorial.level}
                      </span>
                      <span className="text-xs text-muted-foreground">{tutorial.duration}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Video Tutorials */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Play className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Video Tutorials</h2>
        </div>
        <p className="text-muted-foreground">
          Prefer watching over reading? Check out our video tutorials on YouTube.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[
            { title: 'Getting Started with Ovmon', views: '12K views' },
            { title: 'Advanced Deployment Strategies', views: '8K views' },
            { title: 'Building with Serverless Functions', views: '6K views' }
          ].map((video, idx) => (
            <a
              key={idx}
              href="#"
              className="p-4 rounded-lg border border-border bg-background hover:border-accent transition-colors group"
            >
              <div className="aspect-video bg-secondary/50 rounded-lg mb-3 flex items-center justify-center">
                <Play className="w-12 h-12 text-accent/50 group-hover:text-accent transition-colors" />
              </div>
              <h4 className="font-medium text-sm group-hover:text-accent transition-colors">{video.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{video.views}</p>
            </a>
          ))}
        </div>
        <Button variant="outline" className="gap-2 mt-2">
          View All Videos
          <ArrowRight className="w-4 h-4" />
        </Button>
      </section>

      {/* Request Tutorial */}
      <section className="space-y-4 p-6 rounded-lg border border-accent bg-accent/10">
        <h2 className="text-2xl font-bold">Can't Find What You Need?</h2>
        <p className="text-muted-foreground">
          Request a tutorial on a specific topic and we'll create it for you.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/support">
            <Button variant="outline" className="gap-2">
              Request Tutorial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" className="gap-2">
              Browse Documentation <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
