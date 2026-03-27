export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // in cents
  priceYearly: number; // in cents (discounted)
  features: string[];
  highlighted?: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

// Pricing plans - source of truth for the application
// Prices are stored in cents for precision
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for getting started with your first website",
    priceMonthly: 900, // $9/mo
    priceYearly: 9000, // $90/yr (save $18)
    features: [
      "1 Website",
      "5GB Storage",
      "50GB Bandwidth",
      "Free SSL Certificate",
      "Email Support",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_STARTER_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_STARTER_YEARLY,
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing businesses with multiple sites",
    priceMonthly: 2900, // $29/mo
    priceYearly: 29000, // $290/yr (save $58)
    features: [
      "5 Websites",
      "25GB Storage",
      "250GB Bandwidth",
      "Free SSL Certificate",
      "Custom Domains",
      "Priority Support",
      "Daily Backups",
    ],
    highlighted: true,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_GROWTH_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_GROWTH_YEARLY,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and agencies",
    priceMonthly: 7900, // $79/mo
    priceYearly: 79000, // $790/yr (save $158)
    features: [
      "20 Websites",
      "100GB Storage",
      "1TB Bandwidth",
      "Free SSL Certificate",
      "Custom Domains",
      "24/7 Priority Support",
      "Hourly Backups",
      "Staging Environments",
      "Advanced Analytics",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Enterprise-grade for large organizations",
    priceMonthly: 19900, // $199/mo
    priceYearly: 199000, // $1990/yr (save $398)
    features: [
      "Unlimited Websites",
      "500GB Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificate",
      "Custom Domains",
      "24/7 Dedicated Support",
      "Real-time Backups",
      "Staging Environments",
      "Advanced Analytics",
      "White-label Options",
      "API Access",
      "SLA Guarantee",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY,
  },
];

export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.id === planId);
}

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
