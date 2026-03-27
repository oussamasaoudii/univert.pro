import "server-only";
import { stripe, isStripeConfigured } from "./client";
import { getOrCreateStripeCustomer } from "./customer";
import { getPlanById, type PricingPlan } from "./products";
import { getCountryBySlug, getCountryPlanPrice, getDefaultCountry } from "@/lib/countries/db";
import type { Country, BillingPeriod } from "@/lib/countries/types";
import { logger } from "@/lib/utils/errors";

export interface CheckoutSessionOptions {
  userId: string;
  email: string;
  planId: string;
  billingPeriod: BillingPeriod;
  successUrl: string;
  cancelUrl: string;
  countrySlug?: string; // Optional country slug for country-specific pricing
}

export interface CheckoutSessionResult {
  sessionId?: string;
  clientSecret?: string;
  url?: string;
  error?: string;
}

interface CountryPricingInfo {
  country: Country;
  price: number;
  currency: string;
  stripePriceId: string | null;
}

/**
 * Get country-specific pricing for a plan
 */
async function getCountryPricing(
  planId: string,
  billingPeriod: BillingPeriod,
  countrySlug?: string
): Promise<CountryPricingInfo | null> {
  // Try to get the specified country, or fall back to default
  let country: Country | null = null;
  
  if (countrySlug) {
    country = await getCountryBySlug(countrySlug);
  }
  
  if (!country) {
    country = await getDefaultCountry();
  }
  
  if (!country) {
    return null;
  }

  // Get country-specific price
  const countryPrice = await getCountryPlanPrice(country.id, planId, billingPeriod);
  
  if (!countryPrice) {
    return null;
  }

  return {
    country,
    price: countryPrice.price,
    currency: country.currencyCode.toLowerCase(),
    stripePriceId: countryPrice.stripePriceId,
  };
}

export async function createCheckoutSession(
  options: CheckoutSessionOptions
): Promise<CheckoutSessionResult> {
  if (!isStripeConfigured()) {
    return { error: "Payment system not configured" };
  }

  const plan = getPlanById(options.planId);
  if (!plan) {
    return { error: "Invalid plan selected" };
  }

  try {
    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      options.userId,
      options.email
    );

    if (!customerId) {
      return { error: "Failed to create customer" };
    }

    // Try to get country-specific pricing first
    const countryPricing = await getCountryPricing(
      options.planId,
      options.billingPeriod,
      options.countrySlug
    );

    let lineItems;
    let currency = "usd";

    // If we have country-specific pricing with a Stripe price ID, use it
    if (countryPricing?.stripePriceId) {
      lineItems = [
        {
          price: countryPricing.stripePriceId,
          quantity: 1,
        },
      ];
      currency = countryPricing.currency;
    } else if (countryPricing) {
      // Create price inline with country-specific amount and currency
      // Convert price to cents (Stripe expects smallest currency unit)
      const amount = Math.round(countryPricing.price * 100);
      currency = countryPricing.currency;

      lineItems = [
        {
          price_data: {
            currency,
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: amount,
            recurring: {
              interval: options.billingPeriod === "yearly" ? "year" : "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ];
    } else {
      // Fall back to default USD pricing from plan configuration
      const priceId =
        options.billingPeriod === "yearly"
          ? plan.stripePriceIdYearly
          : plan.stripePriceIdMonthly;

      if (priceId) {
        lineItems = [
          {
            price: priceId,
            quantity: 1,
          },
        ];
      } else {
        // Create price inline for testing without pre-configured Stripe prices
        const amount =
          options.billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly;

        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${plan.name} Plan`,
                description: plan.description,
              },
              unit_amount: amount,
              recurring: {
                interval: options.billingPeriod === "yearly" ? "year" : "month",
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ];
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: {
        userId: options.userId,
        planId: options.planId,
        billingPeriod: options.billingPeriod,
        countrySlug: options.countrySlug || "",
        currency: currency.toUpperCase(),
      },
      subscription_data: {
        metadata: {
          userId: options.userId,
          planId: options.planId,
          countrySlug: options.countrySlug || "",
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    logger.info("Checkout session created", {
      action: "checkout_session_created",
      userId: options.userId,
      planId: options.planId,
      sessionId: session.id,
      countrySlug: options.countrySlug,
      currency,
    });

    return {
      sessionId: session.id,
      url: session.url || undefined,
    };
  } catch (error) {
    logger.error("Failed to create checkout session", error, {
      action: "checkout_session_error",
      userId: options.userId,
      planId: options.planId,
      countrySlug: options.countrySlug,
    });
    return {
      error: error instanceof Error ? error.message : "Checkout failed",
    };
  }
}

export async function createEmbeddedCheckoutSession(
  options: CheckoutSessionOptions
): Promise<CheckoutSessionResult> {
  if (!isStripeConfigured()) {
    return { error: "Payment system not configured" };
  }

  const plan = getPlanById(options.planId);
  if (!plan) {
    return { error: "Invalid plan selected" };
  }

  try {
    const customerId = await getOrCreateStripeCustomer(
      options.userId,
      options.email
    );

    if (!customerId) {
      return { error: "Failed to create customer" };
    }

    // Try to get country-specific pricing
    const countryPricing = await getCountryPricing(
      options.planId,
      options.billingPeriod,
      options.countrySlug
    );

    let lineItems;
    let currency = "usd";

    if (countryPricing?.stripePriceId) {
      lineItems = [
        {
          price: countryPricing.stripePriceId,
          quantity: 1,
        },
      ];
      currency = countryPricing.currency;
    } else if (countryPricing) {
      const amount = Math.round(countryPricing.price * 100);
      currency = countryPricing.currency;

      lineItems = [
        {
          price_data: {
            currency,
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: amount,
            recurring: {
              interval: options.billingPeriod === "yearly" ? "year" : "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ];
    } else {
      const amount =
        options.billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly;

      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: amount,
            recurring: {
              interval: options.billingPeriod === "yearly" ? "year" : "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      ui_mode: "embedded",
      redirect_on_completion: "never",
      line_items: lineItems,
      mode: "subscription",
      metadata: {
        userId: options.userId,
        planId: options.planId,
        billingPeriod: options.billingPeriod,
        countrySlug: options.countrySlug || "",
        currency: currency.toUpperCase(),
      },
      subscription_data: {
        metadata: {
          userId: options.userId,
          planId: options.planId,
          countrySlug: options.countrySlug || "",
        },
      },
    });

    return {
      sessionId: session.id,
      clientSecret: session.client_secret || undefined,
    };
  } catch (error) {
    logger.error("Failed to create embedded checkout", error, {
      action: "embedded_checkout_error",
      userId: options.userId,
      countrySlug: options.countrySlug,
    });
    return {
      error: error instanceof Error ? error.message : "Checkout failed",
    };
  }
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url?: string; error?: string }> {
  if (!isStripeConfigured()) {
    return { error: "Payment system not configured" };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    logger.error("Failed to create billing portal session", error, {
      action: "billing_portal_error",
      customerId,
    });
    return {
      error: error instanceof Error ? error.message : "Portal access failed",
    };
  }
}
