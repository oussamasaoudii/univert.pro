"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, ArrowRight, AlertTriangle } from "lucide-react";

type PricingPlan = {
  id: string;
  name: string;
  tier: "starter" | "growth" | "pro" | "premium" | "enterprise";
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  supportLevel: string;
};

function hasPlans(
  value: { plans?: PricingPlan[]; error?: string } | { error?: string },
): value is { plans: PricingPlan[]; error?: string } {
  return Array.isArray((value as { plans?: PricingPlan[] }).plans);
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPlans = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/plans", { cache: "no-store" });
      const result = (await response.json().catch(() => ({}))) as
        | { plans?: PricingPlan[]; error?: string }
        | { error?: string };

      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_load_plans");
      }

      setPlans(hasPlans(result) ? result.plans : []);
    } catch (error) {
      console.error("[pricing] failed to load plans", error);
      setErrorMessage("Failed to load pricing plans from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const enterprisePlan = plans.find((plan) => plan.tier === "enterprise");
  const regularPlans = plans.filter((plan) => plan.tier !== "enterprise");

  return (
    <div className="min-h-screen">
      <section className="border-b border-border">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="border-accent text-accent mb-4">
              Simple, transparent pricing
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Plans and Pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Plans are loaded from your MySQL billing configuration.
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Label htmlFor="billing-toggle" className={!isYearly ? "text-foreground" : "text-muted-foreground"}>
                Monthly
              </Label>
              <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
              <Label htmlFor="billing-toggle" className={isYearly ? "text-foreground" : "text-muted-foreground"}>
                Yearly
                <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent">
                  Save 20%
                </Badge>
              </Label>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          {loading ? (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="py-10 text-center text-muted-foreground">
                Loading plans...
              </CardContent>
            </Card>
          ) : errorMessage ? (
            <Card className="max-w-4xl mx-auto border-red-500/30 bg-red-500/5">
              <CardContent className="py-6">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {regularPlans.map((plan) => {
                  const price = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
                  const isPopular = plan.tier === "pro";

                  return (
                    <Card
                      key={plan.id}
                      className={`bg-card relative ${
                        isPopular ? "border-accent ring-1 ring-accent" : "border-border"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-accent text-accent-foreground">Recommended</Badge>
                        </div>
                      )}
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">${Math.round(price)}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={`${plan.id}-feature-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Link href="/auth/signup">
                          <Button className="w-full" variant={isPopular ? "default" : "outline"}>
                            Get Started
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {enterprisePlan && (
                <Card className="mt-12 max-w-6xl mx-auto bg-card border-border">
                  <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div>
                        <h3 className="text-2xl font-bold">{enterprisePlan.name}</h3>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                          Custom enterprise package with dedicated support and advanced controls.
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                          {enterprisePlan.features.slice(0, 5).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-accent" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Link href="/dashboard/support">
                        <Button size="lg">
                          Contact Us
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
