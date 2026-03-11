import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Database,
  Cloud,
  Code2,
  BarChart3,
  MessageSquare,
  CreditCard,
  Search,
  Mail,
  ShieldCheck,
  Puzzle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations - Ovmon",
  description: "Connect Ovmon with your favorite tools. Seamless integrations for databases, analytics, CMS, and more.",
};

const categories = [
  {
    name: "Databases",
    icon: Database,
    integrations: [
      { name: "PostgreSQL", description: "Relational database", popular: true },
      { name: "MongoDB", description: "Document database", popular: true },
      { name: "Redis", description: "In-memory data store", popular: false },
      { name: "PlanetScale", description: "Serverless MySQL", popular: true },
      { name: "Supabase", description: "Open source Firebase", popular: true },
      { name: "Neon", description: "Serverless Postgres", popular: false },
    ],
  },
  {
    name: "CMS",
    icon: Code2,
    integrations: [
      { name: "Sanity", description: "Structured content", popular: true },
      { name: "Contentful", description: "Content platform", popular: true },
      { name: "Strapi", description: "Headless CMS", popular: false },
      { name: "Prismic", description: "Content management", popular: false },
      { name: "Hygraph", description: "GraphQL CMS", popular: false },
      { name: "WordPress", description: "Headless WordPress", popular: true },
    ],
  },
  {
    name: "Analytics",
    icon: BarChart3,
    integrations: [
      { name: "Google Analytics", description: "Web analytics", popular: true },
      { name: "Mixpanel", description: "Product analytics", popular: true },
      { name: "Amplitude", description: "Digital analytics", popular: false },
      { name: "PostHog", description: "Product analytics", popular: true },
      { name: "Plausible", description: "Privacy-focused", popular: false },
      { name: "Segment", description: "Customer data", popular: true },
    ],
  },
  {
    name: "Commerce",
    icon: CreditCard,
    integrations: [
      { name: "Stripe", description: "Payments", popular: true },
      { name: "Shopify", description: "E-commerce", popular: true },
      { name: "BigCommerce", description: "E-commerce", popular: false },
      { name: "Medusa", description: "Open source", popular: false },
      { name: "Saleor", description: "GraphQL commerce", popular: false },
      { name: "PayPal", description: "Payments", popular: true },
    ],
  },
  {
    name: "Communication",
    icon: MessageSquare,
    integrations: [
      { name: "Slack", description: "Team messaging", popular: true },
      { name: "Discord", description: "Community chat", popular: false },
      { name: "Intercom", description: "Customer support", popular: true },
      { name: "Zendesk", description: "Help desk", popular: false },
      { name: "Twilio", description: "SMS & voice", popular: true },
      { name: "SendGrid", description: "Email delivery", popular: true },
    ],
  },
  {
    name: "Search",
    icon: Search,
    integrations: [
      { name: "Algolia", description: "Search API", popular: true },
      { name: "Elasticsearch", description: "Search engine", popular: true },
      { name: "Meilisearch", description: "Search API", popular: false },
      { name: "Typesense", description: "Search engine", popular: false },
    ],
  },
  {
    name: "Email",
    icon: Mail,
    integrations: [
      { name: "Resend", description: "Email API", popular: true },
      { name: "Mailchimp", description: "Email marketing", popular: true },
      { name: "Postmark", description: "Transactional", popular: false },
      { name: "Klaviyo", description: "E-commerce email", popular: true },
    ],
  },
  {
    name: "Auth & Security",
    icon: ShieldCheck,
    integrations: [
      { name: "Auth0", description: "Authentication", popular: true },
      { name: "Clerk", description: "User management", popular: true },
      { name: "NextAuth", description: "Auth for Next.js", popular: true },
      { name: "Okta", description: "Identity", popular: false },
    ],
  },
];

const featuredIntegrations = [
  { name: "GitHub", description: "Source control and CI/CD integration" },
  { name: "Vercel", description: "Deployment and hosting platform" },
  { name: "Stripe", description: "Payment processing and subscriptions" },
  { name: "Supabase", description: "Database, auth, and storage" },
];

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              <Puzzle className="w-3.5 h-3.5 mr-1.5" />
              Integrations
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Connect your favorite tools
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Ovmon integrates seamlessly with the tools you already use. From databases to analytics, 
              we&apos;ve got you covered.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/docs/integrations">
                  View documentation
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/contact">Request integration</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Integrations */}
      <section className="py-12 border-y border-border/50 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-muted-foreground">Featured integrations</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredIntegrations.map((integration) => (
              <div
                key={integration.name}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-card/40 border border-border/40"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <Cloud className="w-6 h-6 text-accent" />
                </div>
                <p className="font-medium text-foreground">{integration.name}</p>
                <p className="text-xs text-foreground/60">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.integrations.map((integration) => (
                    <Card key={integration.name} className="bg-card/60 border-border/50 hover:border-accent/40 transition-colors">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-foreground/80">
                              {integration.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{integration.name}</p>
                            <p className="text-xs text-foreground/60">{integration.description}</p>
                          </div>
                        </div>
                        {integration.popular && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            Popular
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Need a custom integration?
            </h2>
            <p className="text-foreground/60 mb-8">
              Don&apos;t see your tool? Let us know and we&apos;ll prioritize adding it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-medium group" asChild>
                <Link href="/contact">
                  Request integration
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 font-medium" asChild>
                <Link href="/docs/api">Build with our API</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
