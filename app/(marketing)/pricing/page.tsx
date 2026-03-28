"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, ArrowRight, AlertTriangle, Shield, Zap, Headphones, CreditCard, RefreshCw, Rocket } from "lucide-react";
import { FAQSection, CTABand, TrustMetrics, ComparisonTable } from "@/components/marketing/sections";

type PricingPlan = {
  id: string;
  name: string;
  tier: "starter" | "growth" | "business" | "enterprise";
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

// Trust items for pricing page
const pricingTrustItems = [
  { icon: CreditCard, label: 'Transparent Pricing', sublabel: 'No hidden fees' },
  { icon: Shield, label: 'Secure Payments', sublabel: 'PCI compliant' },
  { icon: RefreshCw, label: 'Cancel Anytime', sublabel: 'Month-to-month' },
  { icon: Headphones, label: '24/7 Support', sublabel: 'Real people helping' },
];

// Comparison table for pricing
const pricingComparison = {
  columns: [
    { name: 'Feature', highlighted: false },
    { name: 'Starter', highlighted: false },
    { name: 'Growth', highlighted: true },
    { name: 'Business', highlighted: false },
  ],
  rows: [
    { feature: 'Number of Websites', values: ['1', '3', 'Unlimited'] },
    { feature: 'Template Stack', values: ['Any', 'Any', 'Any'] },
    { feature: 'Custom Domain', values: [true, true, true] },
    { feature: 'Managed Setup', values: [true, true, true] },
    { feature: 'Managed Hosting', values: [true, true, true] },
    { feature: 'Email Support', values: [true, true, true] },
    { feature: 'Chat/Phone Support', values: [false, true, true] },
    { feature: 'Backups & Recovery', values: [true, true, true] },
    { feature: 'Analytics', values: ['Basic', 'Advanced', 'Custom'] },
    { feature: 'Export Anytime', values: [true, true, true] },
  ],
};

// FAQ data
const pricingFAQs = [
  {
    question: 'What&apos;s included in managed setup?',
    answer: 'We&apos;ll configure your template, connect your domain, set up email, and get everything running. You&apos;re typically live within 24 hours.',
  },
  {
    question: 'Can I change my plan later?',
    answer: 'Yes! You can upgrade or downgrade your plan anytime. Changes take effect on your next billing date.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day satisfaction guarantee on all plans. If you&apos;re not happy, contact support for a full refund.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for Business plans.',
  },
  {
    question: 'Can I export my website later?',
    answer: 'Absolutely. Export your website anytime at no extra cost. We&apos;ll provide migration support to help move to your own server.',
  },
  {
    question: 'What support do I get on each plan?',
    answer: 'Starter includes email support. Growth adds chat and phone support. Business includes dedicated account management and 24/7 priority support.',
  },
];

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
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="border-accent/50 text-accent mb-6">
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Plans that scale with{' '}
              <span className="text-accent">your growth</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Simple pricing that scales with your business. Transparent costs, no hidden fees. Cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Label htmlFor="billing-toggle" className={!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}>
                Monthly
              </Label>
              <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
              <Label htmlFor="billing-toggle" className={isYearly ? "text-foreground font-medium" : "text-muted-foreground"}>
                Yearly
                <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent border-accent/30">
                  Save 20%
                </Badge>
              </Label>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {loading ? (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading pricing plans...</p>
              </CardContent>
            </Card>
          ) : errorMessage ? (
            <Card className="max-w-4xl mx-auto border-destructive/30 bg-destructive/5">
              <CardContent className="py-8">
                <div className="flex items-center justify-center gap-3 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-medium">{errorMessage}</p>
                </div>
                <div className="text-center mt-4">
                  <Button variant="outline" onClick={loadPlans}>
                    Try Again
                  </Button>
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
                      className={`bg-card relative transition-all duration-300 hover:shadow-lg ${
                        isPopular 
                          ? "border-accent ring-1 ring-accent shadow-lg shadow-accent/10 scale-[1.02]" 
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-accent text-accent-foreground shadow-lg shadow-accent/30">
                            Recommended
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{plan.supportLevel}</p>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-foreground">${Math.round(price)}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {isYearly && (
                          <p className="text-xs text-accent mt-1">
                            Billed ${plan.yearlyPrice}/year
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={`${plan.id}-feature-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-accent' : 'text-muted-foreground'}`} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Link href="/auth/signup">
                          <Button 
                            className={`w-full ${isPopular ? 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20' : ''}`} 
                            variant={isPopular ? "default" : "outline"}
                          >
                            Get Started
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Enterprise Card */}
              {enterprisePlan && (
                <Card className="mt-12 max-w-6xl mx-auto bg-gradient-to-br from-card via-card to-accent/5 border-accent/30 hover:border-accent/50 transition-colors">
                  <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                      <div>
                        <Badge variant="outline" className="border-accent/50 text-accent mb-4">
                          Enterprise
                        </Badge>
                        <h3 className="text-2xl font-bold text-foreground">{enterprisePlan.name}</h3>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                          Custom enterprise package with dedicated support, advanced security, and unlimited scale.
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6">
                          {enterprisePlan.features.slice(0, 5).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                              <Check className="w-4 h-4 text-accent" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0">
                        <Link href="/contact">
                          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            Contact Sales
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <p className="text-xs text-muted-foreground text-center">
                          Custom pricing for your needs
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </section>

      {/* Trust Metrics */}
      <TrustMetrics
        items={pricingTrustItems}
        variant="inline"
      />

      {/* Feature Comparison */}
      <ComparisonTable
        badge="Compare Plans"
        title="What's included in each plan"
        description="A detailed breakdown of features across all pricing tiers."
        columns={pricingComparison.columns}
        rows={pricingComparison.rows}
        variant="default"
      />

      {/* FAQ Section */}
      <FAQSection
        badge="Pricing FAQ"
        title="Common questions about pricing"
        description="Everything you need to know about our pricing and billing."
        faqs={pricingFAQs}
        variant="default"
      />

      {/* Final CTA */}
      <CTABand
        title="Ready to get started?"
        description="Choose a plan and launch your professional website in 24 hours."
        actions={[
          { label: 'View Plans', href: '/pricing', variant: 'primary' },
          { label: 'Contact Sales', href: '/contact', variant: 'outline' },
        ]}
        variant="gradient"
      />
    </div>
  );
}
