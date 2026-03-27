import "server-only";
import Stripe from "stripe";
import { stripe } from "./client";
import { getMySQLPool } from "@/lib/mysql/pool";
import { logger } from "@/lib/utils/errors";
import { randomUUID } from "node:crypto";
import { sendSubscriptionConfirmationEmail, sendInvoiceEmail } from "@/lib/email/send";
import { findUserById } from "@/lib/mysql/users";

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET not configured", null, {
      action: "webhook_secret_missing",
    });
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    logger.error("Webhook signature verification failed", error, {
      action: "webhook_signature_failed",
    });
    return null;
  }
}

export async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query<Array<{ processed: boolean }>>(
      "SELECT processed FROM stripe_events WHERE stripe_event_id = ? LIMIT 1",
      [eventId]
    );
    return rows[0]?.processed ?? false;
  } catch {
    return false;
  }
}

export async function markEventProcessed(
  eventId: string,
  eventType: string,
  payload: any,
  error?: string
): Promise<void> {
  try {
    const pool = getMySQLPool();
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO stripe_events (id, stripe_event_id, event_type, payload, processed, processed_at, error_message)
        VALUES (?, ?, ?, ?, TRUE, NOW(), ?)
        ON DUPLICATE KEY UPDATE
          processed = TRUE,
          processed_at = NOW(),
          error_message = VALUES(error_message)
      `,
      [id, eventId, eventType, JSON.stringify(payload), error || null]
    );
  } catch (err) {
    logger.error("Failed to mark event processed", err, {
      action: "event_mark_error",
      eventId,
    });
  }
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  // Check for idempotency
  if (await isEventProcessed(event.id)) {
    logger.info("Webhook event already processed", {
      action: "webhook_idempotent_skip",
      eventId: event.id,
      eventType: event.type,
    });
    return;
  }

  logger.info("Processing webhook event", {
    action: "webhook_processing",
    eventId: event.id,
    eventType: event.type,
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info("Unhandled webhook event type", {
          action: "webhook_unhandled",
          eventType: event.type,
        });
    }

    await markEventProcessed(event.id, event.type, event.data.object);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await markEventProcessed(event.id, event.type, event.data.object, errorMessage);
    throw error;
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    logger.warn("Checkout session missing metadata", {
      action: "checkout_missing_metadata",
      sessionId: session.id,
    });
    return;
  }

  logger.info("Checkout completed", {
    action: "checkout_complete",
    userId,
    planId,
    sessionId: session.id,
  });

  // The subscription will be created/updated via the subscription webhooks
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;

  if (!userId) {
    logger.warn("Subscription missing userId in metadata", {
      action: "subscription_missing_metadata",
      subscriptionId: subscription.id,
    });
    return;
  }

  try {
    const pool = getMySQLPool();

    // Update or create subscription record
    await pool.query(
      `
        UPDATE user_subscriptions
        SET stripe_subscription_id = ?,
            status = ?,
            plan_name = COALESCE(?, plan_name),
            renewal_date = ?
        WHERE user_id = ?
      `,
      [
        subscription.id,
        mapStripeStatus(subscription.status),
        planId,
        new Date(subscription.current_period_end * 1000).toISOString().slice(0, 10),
        userId,
      ]
    );

    // Send confirmation email
    const user = await findUserById(userId);
    if (user?.email && planId) {
      const billingPeriod = subscription.items.data[0]?.price?.recurring?.interval;
      const amount = subscription.items.data[0]?.price?.unit_amount || 0;

      await sendSubscriptionConfirmationEmail(user.email, {
        userName: user.fullName || "there",
        planName: planId.charAt(0).toUpperCase() + planId.slice(1),
        amount: (amount / 100).toFixed(2),
        currency: "$",
        billingPeriod: billingPeriod === "year" ? "yearly" : "monthly",
        nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
      });
    }

    logger.info("Subscription created", {
      action: "subscription_created",
      userId,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    logger.error("Failed to handle subscription created", error, {
      action: "subscription_created_error",
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    // Try to find user by customer ID
    const pool = getMySQLPool();
    const [rows] = await pool.query<Array<{ id: string }>>(
      "SELECT id FROM users WHERE stripe_customer_id = ? LIMIT 1",
      [subscription.customer]
    );

    if (!rows[0]) {
      logger.warn("Cannot find user for subscription update", {
        action: "subscription_user_not_found",
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      });
      return;
    }
  }

  try {
    const pool = getMySQLPool();

    await pool.query(
      `
        UPDATE user_subscriptions
        SET status = ?,
            renewal_date = ?
        WHERE stripe_subscription_id = ?
      `,
      [
        mapStripeStatus(subscription.status),
        new Date(subscription.current_period_end * 1000).toISOString().slice(0, 10),
        subscription.id,
      ]
    );

    logger.info("Subscription updated", {
      action: "subscription_updated",
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    logger.error("Failed to handle subscription updated", error, {
      action: "subscription_updated_error",
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  try {
    const pool = getMySQLPool();

    await pool.query(
      `
        UPDATE user_subscriptions
        SET status = 'cancelled'
        WHERE stripe_subscription_id = ?
      `,
      [subscription.id]
    );

    logger.info("Subscription deleted", {
      action: "subscription_deleted",
      subscriptionId: subscription.id,
    });
  } catch (error) {
    logger.error("Failed to handle subscription deleted", error, {
      action: "subscription_deleted_error",
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  try {
    const pool = getMySQLPool();

    // Find user by customer ID
    const [rows] = await pool.query<Array<{ id: string; email: string; full_name: string | null }>>(
      "SELECT id, email, full_name FROM users WHERE stripe_customer_id = ? LIMIT 1",
      [customerId]
    );

    const user = rows[0];
    if (!user) {
      logger.warn("User not found for invoice", {
        action: "invoice_user_not_found",
        customerId,
        invoiceId: invoice.id,
      });
      return;
    }

    // Send invoice email
    if (invoice.hosted_invoice_url) {
      await sendInvoiceEmail(user.email, {
        userName: user.full_name || "there",
        invoiceNumber: invoice.number || invoice.id,
        invoiceDate: new Date((invoice.created || Date.now()) * 1000).toLocaleDateString(),
        amount: ((invoice.amount_paid || 0) / 100).toFixed(2),
        currency: "$",
        planName: "Subscription",
        billingPeriod: "Monthly",
        invoiceUrl: invoice.hosted_invoice_url,
        isPaid: true,
      });
    }

    logger.info("Invoice paid", {
      action: "invoice_paid",
      invoiceId: invoice.id,
      userId: user.id,
    });
  } catch (error) {
    logger.error("Failed to handle invoice paid", error, {
      action: "invoice_paid_error",
      invoiceId: invoice.id,
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  try {
    const pool = getMySQLPool();

    // Find subscription by customer
    const [rows] = await pool.query<Array<{ id: string }>>(
      `
        SELECT us.id
        FROM user_subscriptions us
        JOIN users u ON us.user_id = u.id
        WHERE u.stripe_customer_id = ?
        LIMIT 1
      `,
      [customerId]
    );

    if (rows[0]) {
      // Update subscription to past_due
      await pool.query(
        "UPDATE user_subscriptions SET status = 'past_due' WHERE id = ?",
        [rows[0].id]
      );
    }

    logger.info("Invoice payment failed", {
      action: "invoice_payment_failed",
      invoiceId: invoice.id,
      customerId,
    });
  } catch (error) {
    logger.error("Failed to handle invoice payment failed", error, {
      action: "invoice_payment_failed_error",
      invoiceId: invoice.id,
    });
  }
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): "trialing" | "active" | "past_due" | "cancelled" {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "cancelled";
    default:
      return "cancelled";
  }
}
