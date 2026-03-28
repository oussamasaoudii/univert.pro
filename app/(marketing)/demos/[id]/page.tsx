"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LaunchTemplateButton } from "@/components/provisioning/launch-template-button";
import {
  ArrowLeft,
  ExternalLink,
  Check,
  Gauge,
  Globe,
  Shield,
  AlertTriangle,
} from "lucide-react";

type TemplateRecord = {
  id: string;
  name: string;
  description: string;
  category:
    | "corporate"
    | "agency"
    | "portfolio"
    | "ecommerce"
    | "restaurant"
    | "saas"
    | "marketplace";
  stack: "Laravel" | "Next.js" | "WordPress";
  liveDemoUrl: string | null;
  startingPrice: number;
  performanceScore: number;
  featured: boolean;
};

type PlanRecord = {
  id: string;
  name: string;
  tier: "starter" | "growth" | "pro" | "premium" | "enterprise";
  monthlyPrice: number;
  features: string[];
};

function hasPlans(
  value: { plans?: PlanRecord[]; error?: string } | { error?: string },
): value is { plans: PlanRecord[]; error?: string } {
  return Array.isArray((value as { plans?: PlanRecord[] }).plans);
}

const defaultFeatureByStack: Record<TemplateRecord["stack"], string[]> = {
  "Next.js": [
    "SEO-ready pages",
    "Fast static rendering",
    "Optimized performance pipeline",
    "Responsive components",
  ],
  Laravel: [
    "Robust backend foundation",
    "Scalable architecture",
    "Admin-ready modules",
    "Secure authentication",
  ],
  WordPress: [
    "Easy content editing",
    "Plugin-compatible setup",
    "Blog and CMS support",
    "SEO plugins ready",
  ],
};

export default function DemoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [template, setTemplate] = useState<TemplateRecord | null>(null);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [templateResponse, plansResponse] = await Promise.all([
        fetch(`/api/templates/${id}`, { cache: "no-store" }),
        fetch("/api/plans", { cache: "no-store" }),
      ]);

      const templateResult = (await templateResponse.json().catch(() => ({}))) as
        | { template?: TemplateRecord; error?: string }
        | { error?: string };
      const plansResult = (await plansResponse.json().catch(() => ({}))) as
        | { plans?: PlanRecord[]; error?: string }
        | { error?: string };

      if (!templateResponse.ok) {
        throw new Error((templateResult as { error?: string }).error || "template_not_found");
      }
      if (!plansResponse.ok) {
        throw new Error((plansResult as { error?: string }).error || "failed_to_load_plans");
      }

      setTemplate((templateResult as { template?: TemplateRecord }).template || null);
      setPlans(hasPlans(plansResult) ? plansResult.plans : []);
    } catch (error) {
      console.error("[demos/:id] failed to load template", error);
      setErrorMessage("Failed to load template details from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const recommendedPlans = useMemo(
    () => plans.filter((plan) => plan.tier !== "enterprise").slice(0, 3),
    [plans],
  );

  if (loading) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading template...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorMessage || !template) {
    return (
      <div className="container py-10">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="py-8">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm font-medium">{errorMessage || "Template not found."}</p>
            </div>
            <div className="mt-4">
              <Link href="/demos">
                <Button variant="outline">Back to templates</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const featureList = defaultFeatureByStack[template.stack];

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-secondary/20">
        <div className="container py-4">
          <Link
            href="/demos"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Link>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/15 to-background aspect-video" />
            <div className="flex items-center gap-2 flex-wrap">
              {template.featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
              <Badge variant="secondary" className="capitalize">
                {template.category}
              </Badge>
              <Badge variant="outline">{template.stack}</Badge>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{template.name}</h1>
              <p className="text-muted-foreground mt-3 text-lg">{template.description}</p>
            </div>

            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Starting from</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold">${template.startingPrice}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Gauge className="w-4 h-4" />
                    Performance
                  </div>
                  <p className="text-2xl font-bold mt-2">{template.performanceScore}/5</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Globe className="w-4 h-4" />
                    Deployment
                  </div>
                  <p className="text-2xl font-bold mt-2">Ready</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <LaunchTemplateButton templateId={template.id} templateName={template.name} />
              {template.liveDemoUrl && (
                <a href={template.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-12">
        <div className="container space-y-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">What&apos;s Included</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {featureList.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-accent" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-bold mb-4">Recommended Plans</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {recommendedPlans.map((plan) => (
                <Card key={plan.id} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-2xl font-bold">${plan.monthlyPrice}/mo</p>
                    <div className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          • {feature}
                        </p>
                      ))}
                    </div>
                    <Link href="/auth/signup">
                      <Button variant="outline" className="w-full">
                        Choose Plan
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-secondary/30">
            <CardContent className="p-6 flex items-start gap-3">
              <Shield className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="font-semibold">Fully managed hosting and setup</p>
                <p className="text-sm text-muted-foreground">
                  SSL, automatic backups, and infrastructure management included. We handle the technical details so you can focus on your business.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
