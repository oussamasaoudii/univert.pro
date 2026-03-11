import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  GitBranch,
  Eye,
  RefreshCw,
  ArrowRight,
  Check,
  Zap,
  Clock,
  History,
  Share2,
  MessageSquare,
  Globe,
  Shield,
  Activity
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Deployments - Ovmon',
  description: 'Zero-config deployments with preview URLs for every push. Ship with confidence.',
};

const deployFeatures = [
  {
    icon: Zap,
    title: 'Instant Deployments',
    description: 'Deploy in seconds, not minutes. Our optimized build pipeline gets your changes live faster than ever.',
    stat: '<10s',
    statLabel: 'Average deploy time',
  },
  {
    icon: Eye,
    title: 'Preview Deployments',
    description: 'Every pull request gets a unique URL. Review, test, and share changes before they go to production.',
    stat: '100%',
    statLabel: 'PRs with previews',
  },
  {
    icon: RefreshCw,
    title: 'Instant Rollbacks',
    description: 'Something wrong? Roll back to any previous deployment with a single click. Zero downtime.',
    stat: '<1s',
    statLabel: 'Rollback time',
  },
  {
    icon: Globe,
    title: 'Global Edge Network',
    description: 'Deploy to 150+ edge locations simultaneously. Your users get the fastest experience everywhere.',
    stat: '150+',
    statLabel: 'Edge locations',
  },
];

const workflowSteps = [
  {
    step: '01',
    title: 'Push Your Code',
    description: 'Push to your Git repository. GitHub, GitLab, and Bitbucket supported.',
    icon: GitBranch,
  },
  {
    step: '02',
    title: 'Automatic Build',
    description: 'We detect your framework and build your project automatically.',
    icon: Zap,
  },
  {
    step: '03',
    title: 'Deploy Globally',
    description: 'Your site is deployed to our global edge network in seconds.',
    icon: Rocket,
  },
  {
    step: '04',
    title: 'Share & Review',
    description: 'Get a unique URL to share with your team or stakeholders.',
    icon: Share2,
  },
];

const additionalFeatures = [
  {
    icon: History,
    title: 'Deployment History',
    description: 'Complete history of all deployments with logs and build details.',
  },
  {
    icon: MessageSquare,
    title: 'Deploy Comments',
    description: 'Leave comments and feedback directly on preview deployments.',
  },
  {
    icon: Shield,
    title: 'Protected Branches',
    description: 'Require approvals before deploying to production.',
  },
  {
    icon: Activity,
    title: 'Build Analytics',
    description: 'Track build times and optimize your deployment pipeline.',
  },
  {
    icon: Clock,
    title: 'Scheduled Deploys',
    description: 'Schedule deployments for specific times and dates.',
  },
  {
    icon: GitBranch,
    title: 'Branch Deploys',
    description: 'Deploy any branch with custom domains and settings.',
  },
];

export default function DeploysPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Rocket className="h-3 w-3 mr-1" />
              Deployments
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Ship with{' '}
              <span className="text-accent">Confidence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Zero-config deployments that just work. Preview every change, roll back instantly, and deploy globally in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Deploying
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/deployments">Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deployFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-accent mb-4" />
                  <p className="text-3xl font-bold text-accent mb-1">{feature.stat}</p>
                  <p className="text-xs text-muted-foreground mb-4">{feature.statLabel}</p>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              From Code to Production in Seconds
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Our deployment pipeline is optimized for speed and reliability.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((step, index) => (
                <div key={step.step} className="relative">
                  <Card className="bg-card border-border/50 h-full">
                    <CardContent className="p-6">
                      <span className="text-5xl font-bold text-accent/20 absolute top-4 right-4">{step.step}</span>
                      <step.icon className="h-8 w-8 text-accent mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preview Deployments Highlight */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                <Eye className="h-3 w-3 mr-1" />
                Preview Deployments
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Review Every Change
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                Every pull request automatically gets a unique preview URL. Share with designers, product managers, and stakeholders for feedback before merging.
              </p>
              <ul className="space-y-3 mb-8">
                {['Unique URL per PR', 'Password protection', 'Comment threads', 'Mobile preview', 'Automatic cleanup'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground/80">
                    <Check className="h-5 w-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/docs/preview-deployments">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-xl bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-accent/20 p-6">
                <div className="rounded-lg bg-background border border-border/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/50">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-muted-foreground">preview-feature-xyz.ovmon.app</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">feature/new-checkout</span>
                      </div>
                      <Badge className="bg-accent/10 text-accent border-0 text-xs">Preview Live</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Deployed 2 minutes ago</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              More Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything You Need to Deploy
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <feature.icon className="h-6 w-6 text-accent mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Ready to Deploy?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Get started with deployments in under a minute. Connect your repository and ship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Start Deploying Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demos">See Examples</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
