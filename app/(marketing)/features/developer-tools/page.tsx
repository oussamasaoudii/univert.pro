import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Code2,
  GitBranch,
  Terminal,
  Bug,
  Layers,
  Zap,
  ArrowRight,
  Check,
  Play,
  FileCode,
  Braces,
  Puzzle,
  Workflow,
  Package,
  RefreshCw,
  Eye
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Developer Tools - Ovmon',
  description: 'Powerful developer tools for building, testing, and deploying modern web applications.',
  robots: { index: false, follow: false },
};

const tools = [
  {
    icon: GitBranch,
    title: 'Git Integration',
    description: 'Connect your GitHub, GitLab, or Bitbucket repositories. Every push triggers automatic deployments with full version control.',
    features: ['Auto-deploy on push', 'Branch previews', 'Rollback support', 'Commit status checks'],
  },
  {
    icon: Terminal,
    title: 'CLI Tools',
    description: 'Powerful command-line interface for managing deployments, environments, and configurations from your terminal.',
    features: ['Deploy from CLI', 'Environment management', 'Log streaming', 'Local development'],
  },
  {
    icon: Bug,
    title: 'Debugging Suite',
    description: 'Built-in debugging tools with source maps, error tracking, and real-time log streaming for faster issue resolution.',
    features: ['Source maps', 'Error tracking', 'Log viewer', 'Performance profiler'],
  },
  {
    icon: Puzzle,
    title: 'API & SDKs',
    description: 'Comprehensive APIs and SDKs for Node.js, Python, Go, and more. Automate your workflows programmatically.',
    features: ['REST API', 'GraphQL support', 'Webhooks', 'SDK libraries'],
  },
];

const devFeatures = [
  {
    icon: Play,
    title: 'Hot Reloading',
    description: 'See changes instantly without losing application state.',
  },
  {
    icon: FileCode,
    title: 'TypeScript Support',
    description: 'First-class TypeScript support with automatic type checking.',
  },
  {
    icon: Braces,
    title: 'Code Splitting',
    description: 'Automatic code splitting for optimal bundle sizes.',
  },
  {
    icon: Workflow,
    title: 'CI/CD Pipelines',
    description: 'Customizable build and deployment pipelines.',
  },
  {
    icon: Package,
    title: 'Dependency Management',
    description: 'Automatic dependency caching and updates.',
  },
  {
    icon: RefreshCw,
    title: 'Instant Rollbacks',
    description: 'One-click rollback to any previous deployment.',
  },
];

const codeExample = `// Deploy with the Ovmon CLI
$ ovmon deploy

Ovmon  Deploying to production...
  ✓  Building application...
  ✓  Optimizing assets...
  ✓  Deploying to 100+ edge locations...
  ✓  SSL certificate issued

Success!  Deployed to https://app.ovmon.com
Deploy time: 2.3s  Build: Passed`;

export default function DeveloperToolsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Code2 className="h-3 w-3 mr-1" />
              Developer Tools
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Build Better,{' '}
              <span className="text-accent">Ship Faster</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              A complete developer toolkit designed to streamline your workflow from local development to production deployment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/docs">
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signup">Start Building</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-16 lg:py-24 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl bg-background border border-border/50 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">Terminal</span>
              </div>
              <pre className="p-6 text-sm overflow-x-auto">
                <code className="text-foreground/90 font-mono whitespace-pre">{codeExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tools Grid */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Core Tools
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything You Need to Develop
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Professional-grade tools that integrate seamlessly with your existing workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {tools.map((tool) => (
              <Card key={tool.title} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 mb-6">
                    <tool.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{tool.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{tool.description}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Check className="h-4 w-4 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              More Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Built for Modern Development
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {devFeatures.map((feature) => (
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

      {/* Preview Deployments */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                <Eye className="h-3 w-3 mr-1" />
                Preview Deployments
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Test Every Change Before It Goes Live
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                Every pull request automatically gets a unique preview URL. Share with your team, get feedback, and iterate faster without affecting production.
              </p>
              <ul className="space-y-3 mb-8">
                {['Unique URL for every PR', 'Comments and annotations', 'Mobile and desktop preview', 'Share with stakeholders'].map((item) => (
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
              <div className="rounded-xl bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-accent/20 p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-background/80 border border-border/50">
                    <GitBranch className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-sm text-foreground">feature/new-checkout</p>
                      <p className="text-xs text-muted-foreground">Preview ready in 12s</p>
                    </div>
                    <Badge className="ml-auto bg-accent/10 text-accent border-0">Live</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-background/80 border border-border/50">
                    <GitBranch className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm text-foreground">fix/responsive-nav</p>
                      <p className="text-xs text-muted-foreground">Building...</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">Building</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-background/80 border border-border/50">
                    <GitBranch className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm text-foreground">main</p>
                      <p className="text-xs text-muted-foreground">Production</p>
                    </div>
                    <Badge className="ml-auto bg-green-500/10 text-green-500 border-0">Production</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Start Building Today
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Get access to all developer tools with a free account. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">Read Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
