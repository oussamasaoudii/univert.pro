import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { MessageSquare, Users, Github, Twitter, MessagesSquare, HelpCircle, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Community - Ovmon',
  description: 'Join the Ovmon community. Connect with developers, get help, and share your projects.'
};

export default function CommunityPage() {
  const communityChannels = [
    {
      icon: MessagesSquare,
      title: 'Discord Server',
      description: 'Join our Discord server for real-time discussions, help, and community events.',
      members: '15,000+',
      link: '#',
      buttonText: 'Join Discord',
      color: 'bg-indigo-500/20 text-indigo-400'
    },
    {
      icon: Github,
      title: 'GitHub Discussions',
      description: 'Ask questions, share ideas, and collaborate on GitHub Discussions.',
      members: '8,500+',
      link: '#',
      buttonText: 'Visit GitHub',
      color: 'bg-gray-500/20 text-gray-400'
    },
    {
      icon: Twitter,
      title: 'Twitter/X',
      description: 'Follow us for updates, tips, and community highlights.',
      members: '25,000+',
      link: '#',
      buttonText: 'Follow Us',
      color: 'bg-sky-500/20 text-sky-400'
    }
  ];

  const featuredProjects = [
    {
      name: 'Next.js E-commerce Starter',
      author: '@devjohn',
      description: 'A complete e-commerce template built with Next.js and Ovmon',
      stars: 1240
    },
    {
      name: 'Ovmon CLI Extensions',
      author: '@sarahcodes',
      description: 'Useful CLI plugins for enhanced Ovmon workflows',
      stars: 856
    },
    {
      name: 'Multi-tenant SaaS Boilerplate',
      author: '@techstartup',
      description: 'Production-ready SaaS starter with authentication and billing',
      stars: 2100
    },
    {
      name: 'Portfolio Template',
      author: '@designpro',
      description: 'Beautiful portfolio template optimized for Ovmon hosting',
      stars: 643
    }
  ];

  const upcomingEvents = [
    {
      title: 'Ovmon Community Meetup',
      date: 'March 20, 2026',
      time: '6:00 PM UTC',
      type: 'Virtual'
    },
    {
      title: 'Workshop: Advanced Deployments',
      date: 'March 25, 2026',
      time: '3:00 PM UTC',
      type: 'Workshop'
    },
    {
      title: 'Ovmon Conference 2026',
      date: 'April 15-16, 2026',
      time: 'All Day',
      type: 'Conference'
    }
  ];

  const contributors = [
    { name: 'Alex Chen', contributions: 156, avatar: 'AC' },
    { name: 'Maria Garcia', contributions: 134, avatar: 'MG' },
    { name: 'James Wilson', contributions: 98, avatar: 'JW' },
    { name: 'Yuki Tanaka', contributions: 87, avatar: 'YT' },
    { name: 'Omar Hassan', contributions: 76, avatar: 'OH' },
    { name: 'Sophie Martin', contributions: 65, avatar: 'SM' }
  ];

  return (
    <MarketingLayout
      title="Community"
      description="Connect with developers, get help, and share your projects"
    >
      {/* Community Channels */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Join the Conversation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityChannels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50 flex flex-col">
                <div className={`w-12 h-12 rounded-lg ${channel.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{channel.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 flex-1">{channel.description}</p>
                <p className="text-sm text-accent mb-4">{channel.members} members</p>
                <Button variant="outline" className="w-full gap-2">
                  {channel.buttonText}
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Projects</h2>
          <Link href="#" className="text-sm text-accent hover:underline">
            View all projects
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredProjects.map((project, idx) => (
            <a
              key={idx}
              href="#"
              className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold group-hover:text-accent transition-colors">{project.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  {project.stars}
                </div>
              </div>
              <p className="text-xs text-accent mb-2">{project.author}</p>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Upcoming Events</h2>
        <div className="space-y-3">
          {upcomingEvents.map((event, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">{event.type}</span>
                <Button variant="outline" size="sm">RSVP</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Contributors */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Top Contributors</h2>
        <p className="text-muted-foreground">
          Thanks to our amazing community members who help make Ovmon better every day.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {contributors.map((contributor, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3 text-accent font-semibold">
                {contributor.avatar}
              </div>
              <p className="font-medium text-sm">{contributor.name}</p>
              <p className="text-xs text-muted-foreground">{contributor.contributions} contributions</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">Community Guidelines</h2>
        <p className="text-muted-foreground">
          Our community is built on respect and collaboration. Please follow these guidelines:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            'Be respectful and inclusive to all members',
            'Help others when you can - we all learn together',
            'Share knowledge and best practices openly',
            'Report issues constructively with reproducible examples',
            'Keep discussions on-topic and professional'
          ].map((guideline, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              {guideline}
            </li>
          ))}
        </ul>
      </section>

      {/* Get Help */}
      <section className="space-y-4 p-6 rounded-lg border border-accent bg-accent/10">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Need Help?</h2>
        </div>
        <p className="text-muted-foreground">
          Can't find what you're looking for? Check our documentation or reach out to support.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs">
            <Button variant="outline">Documentation</Button>
          </Link>
          <Link href="/support">
            <Button variant="outline">Contact Support</Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
