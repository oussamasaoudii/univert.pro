import "server-only";
import { stripe, isStripeConfigured } from "./client";
import { getOrCreateStripeCustomer } from "./customer";
import { getPlanById, type PricingPlan } from "./products";
import { logger } from "@/lib/utils/errors";

export interface CheckoutSessionOptions {
  userId: string;
  email: string;
  planId: string;
  billingPeriod: "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId?: string;
  clientSecret?: string;
  url?: string;
  error?: string;
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

  const priceId =
    options.billingPeriod === "yearly"
      ? plan.stripePriceIdYearly
      : plan.stripePriceIdMonthly;

  try {
    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      options.userId,
      options.email
    );

    if (!customerId) {
      return { error: "Failed to create customer" };
    }

    // If we have a Stripe price ID configured, use it
    // Otherwise, create a price on the fly (for testing)
    let lineItems;

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
      },
      subscription_data: {
        metadata: {
          userId: options.userId,
          planId: options.planId,
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

    const amount =
      options.billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      ui_mode: "embedded",
      redirect_on_completion: "never",
      line_items: [
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
      ],
      mode: "subscription",
      metadata: {
        userId: options.userId,
        planId: options.planId,
        billingPeriod: options.billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: options.userId,
          planId: options.planId,
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
