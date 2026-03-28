"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ArrowRight, Globe, Shield, RefreshCw, Rocket } from "lucide-react";
import { FAQSection, CTABand, TrustMetrics, ComparisonTable } from "@/components/marketing/sections";
import type { Country } from "@/lib/countries/types";
import { formatCountryPrice } from "@/lib/countries/utils";
import { cn } from "@/lib/utils";

interface PlanWithCountryPricing {
  id: string;
  name: string;
  tier: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  supportLevel: string;
  countryPricing: {
    monthly: number | null;
    yearly: number | null;
  };
}

interface CountryPricingClientProps {
  country: Country;
  plans: PlanWithCountryPricing[];
  allCountries: Country[];
}

const pricingTrustItems = [
  { icon: Globe, label: "Managed Setup", sublabel: "We handle everything" },
  { icon: Shield, label: "Secure Hosting", sublabel: "SSL & daily backups" },
  { icon: RefreshCw, label: "Cancel Anytime", sublabel: "No lock-in" },
  { icon: Rocket, label: "24 Hour Launch", sublabel: "Fast setup process" },
];

const pricingComparison = {
  columns: [
    { name: "Feature", highlighted: false },
    { name: "Starter", highlighted: false },
    { name: "Growth", highlighted: true },
    { name: "Business", highlighted: false },
  ],
  rows: [
    { feature: "Number of Websites", values: ["1", "3", "Unlimited"] },
    { feature: "Template Stack", values: ["Any", "Any", "Any"] },
    { feature: "Custom Domains", values: [true, true, true] },
    { feature: "Managed Setup", values: [true, true, true] },
    { feature: "Managed Hosting", values: [true, true, true] },
    { feature: "Email Support", values: [true, true, true] },
    { feature: "Chat/Phone Support", values: [false, true, true] },
    { feature: "Backups & Recovery", values: [true, true, true] },
    { feature: "Analytics", values: ["Basic", "Advanced", "Custom"] },
    { feature: "Export Anytime", values: [true, true, true] },
  ],
};

const pricingFAQs = [
  {
    question: "What is included in managed setup?",
    answer:
      "We configure your template, connect your domain, secure the site with SSL, and prepare the essentials so you can launch quickly without technical hassle.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. You can upgrade or downgrade your plan as your business grows, and the change will apply on your next billing cycle.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day satisfaction guarantee on paid plans. If the service is not a fit, contact support and we will help you.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit cards and regional payment methods where available. Business customers can also request manual invoicing.",
  },
  {
    question: "Can I move my website later?",
    answer:
      "Yes. Univert is designed without lock-in. You can request export and migration support later if you decide to move the project to your own server.",
  },
];

export function CountryPricingClient({
  country,
  plans,
  allCountries,
}: CountryPricingClientProps) {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  const handleCountryChange = (slug: string) => {
    router.push(`/${slug}/pricing`);
  };

  const enterprisePlan = plans.find((plan) => plan.tier === "enterprise");
  const regularPlans = plans.filter((plan) => plan.tier !== "enterprise");

  const getDisplayPrice = (plan: PlanWithCountryPricing): number => {
    const countryPrice = isYearly
      ? plan.countryPricing.yearly
      : plan.countryPricing.monthly;

    if (countryPrice !== null) {
      return isYearly ? countryPrice / 12 : countryPrice;
    }

    // Fall back to default USD pricing
    return isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
  };

  const getYearlyTotal = (plan: PlanWithCountryPricing): number => {
    return plan.countryPricing.yearly ?? plan.yearlyPrice;
  };

  const formatPrice = (amount: number) => {
    return formatCountryPrice(amount, country, { showSymbol: true });
  };

  return (
    <div className={cn("min-h-screen", country.textDirection === "rtl" && "rtl")} dir={country.textDirection}>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="outline" className="border-accent/50 text-accent">
                {country.flagEmoji} {country.name}
              </Badge>
              <Select value={country.slug} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-auto gap-2 border-muted">
                  <Globe className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allCountries.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      <span className="flex items-center gap-2">
                        {c.flagEmoji} {c.name} ({c.currencyCode})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Plans that scale with{" "}
              <span className="text-accent">your growth</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Prices shown in {country.currencyCode}. Simple, transparent pricing aligned with your needs.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Label
                htmlFor="billing-toggle"
                className={!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}
              >
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label
                htmlFor="billing-toggle"
                className={isYearly ? "text-foreground font-medium" : "text-muted-foreground"}
              >
                Yearly
                <Badge variant="secondary" className="ms-2 bg-accent/20 text-accent border-accent/30">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {regularPlans.map((plan) => {
              const price = getDisplayPrice(plan);
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.supportLevel}
                    </p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        {formatPrice(Math.round(price))}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isYearly && (
                      <p className="text-xs text-accent mt-1">
                        Billed {formatPrice(getYearlyTotal(plan))}/year
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li
                          key={`${plan.id}-feature-${index}`}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isPopular ? "text-accent" : "text-muted-foreground"
                            }`}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/auth/signup?plan=${plan.id}&country=${country.slug}`}>
                      <Button
                        className={`w-full ${
                          isPopular
                            ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
                            : ""
                        }`}
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
                    <h3 className="text-2xl font-bold text-foreground">
                      {enterprisePlan.name}
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-xl">
                      Custom enterprise package with dedicated support, advanced
                      security, and unlimited scale.
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6">
                      {enterprisePlan.features.slice(0, 5).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <Check className="w-4 h-4 text-accent" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 shrink-0">
                    <Link href="/contact">
                      <Button
                        size="lg"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Contact Sales
                        <ArrowRight className="ms-2 h-4 w-4" />
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
        </div>
      </section>

      {/* Trust Metrics */}
      <TrustMetrics items={pricingTrustItems} variant="inline" />

      {/* Feature Comparison */}
      <ComparisonTable
        badge="Compare Plans"
        title="What&apos;s included in each plan"
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
          { label: "View Plans", href: "/pricing", variant: "primary" },
          { label: "Contact Sales", href: "/contact", variant: "outline" },
        ]}
        variant="gradient"
      />
    </div>
  );
}
