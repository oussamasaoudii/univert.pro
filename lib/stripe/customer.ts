import "server-only";
import { stripe, isStripeConfigured } from "./client";
import { getMySQLPool } from "@/lib/mysql/pool";
import { logger } from "@/lib/utils/errors";

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string | null> {
  if (!isStripeConfigured()) {
    logger.warn("Stripe not configured", { action: "stripe_customer_skip" });
    return null;
  }

  try {
    const pool = getMySQLPool();

    // Check if user already has a Stripe customer ID
    const [rows] = await pool.query<Array<{ stripe_customer_id: string | null }>>(
      "SELECT stripe_customer_id FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const existingCustomerId = rows[0]?.stripe_customer_id;

    if (existingCustomerId) {
      // Verify customer still exists in Stripe
      try {
        await stripe.customers.retrieve(existingCustomerId);
        return existingCustomerId;
      } catch {
        // Customer was deleted in Stripe, create a new one
        logger.warn("Stripe customer not found, creating new", {
          action: "stripe_customer_recreate",
          userId,
        });
      }
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
        platform: "univert",
      },
    });

    // Store customer ID in database
    await pool.query(
      "UPDATE users SET stripe_customer_id = ? WHERE id = ?",
      [customer.id, userId]
    );

    logger.info("Stripe customer created", {
      action: "stripe_customer_created",
      userId,
      customerId: customer.id,
    });

    return customer.id;
  } catch (error) {
    logger.error("Failed to get/create Stripe customer", error, {
      action: "stripe_customer_error",
      userId,
    });
    return null;
  }
}

export async function updateStripeCustomer(
  customerId: string,
  updates: {
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
  }
): Promise<boolean> {
  if (!isStripeConfigured()) {
    return false;
  }

  try {
    await stripe.customers.update(customerId, {
      email: updates.email,
      name: updates.name,
      metadata: updates.metadata,
    });
    return true;
  } catch (error) {
    logger.error("Failed to update Stripe customer", error, {
      action: "stripe_customer_update_error",
      customerId,
    });
    return false;
  }
}

export async function getStripeCustomerByUserId(
  userId: string
): Promise<string | null> {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query<Array<{ stripe_customer_id: string | null }>>(
      "SELECT stripe_customer_id FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    return rows[0]?.stripe_customer_id ?? null;
  } catch (error) {
    logger.error("Failed to get Stripe customer", error, {
      action: "stripe_customer_fetch_error",
      userId,
    });
    return null;
  }
}
