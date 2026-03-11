'use server';

import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import { getUserSubscription, updateSubscriptionStatus, createSubscription } from '@/lib/db/subscriptions';
import { getUserInvoices, createInvoice, markInvoiceAsPaid } from '@/lib/db/invoices';
import { getPlanByName, getSubscriptionHistory, getFeatureUsage, incrementFeatureUsage } from '@/lib/db/plans';
import { SubscriptionLifecycle, getSubscriptionWithPlan, isSubscriptionActive } from '@/lib/billing/subscription-lifecycle';
import type { PlanName } from '@/lib/db/types';

/**
 * Get current user's subscription with plan details
 */
export async function getCurrentSubscription() {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const subscription = await getUserSubscription(user.id);
    if (!subscription) {
      return { subscription: null };
    }

    const enriched = await getSubscriptionWithPlan(subscription);
    return { subscription: enriched };
  } catch (error) {
    console.error('[subscription-actions] Error getting current subscription:', error);
    return { error: 'Failed to fetch subscription' };
  }
}

/**
 * Upgrade user to a new plan
 */
export async function upgradeToPlan(planName: PlanName) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const subscription = await getUserSubscription(user.id);
    if (!subscription) {
      return { error: 'No active subscription' };
    }

    const newPlan = await getPlanByName(planName);
    if (!newPlan) {
      return { error: 'Plan not found' };
    }

    // Upgrade subscription
    const updated = await SubscriptionLifecycle.upgradePlan(subscription, newPlan.id);
    if (!updated) {
      return { error: 'Failed to upgrade subscription' };
    }

    // In a real scenario, create invoice for pro-ration and charge via Stripe
    const invoice = await createInvoice(user.id, subscription.id, newPlan.price_monthly);
    if (!invoice) {
      return { error: 'Failed to create invoice' };
    }

    // Mark as paid (in real scenario, this happens after Stripe payment)
    await markInvoiceAsPaid(invoice.id);

    return { success: true, subscription: updated };
  } catch (error) {
    console.error('[subscription-actions] Error upgrading plan:', error);
    return { error: 'Failed to upgrade plan' };
  }
}

/**
 * Downgrade user to a new plan
 */
export async function downgradeToPlan(planName: PlanName) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const subscription = await getUserSubscription(user.id);
    if (!subscription) {
      return { error: 'No active subscription' };
    }

    const newPlan = await getPlanByName(planName);
    if (!newPlan) {
      return { error: 'Plan not found' };
    }

    // Downgrade subscription
    const updated = await SubscriptionLifecycle.downgradePlan(subscription, newPlan.id);
    if (!updated) {
      return { error: 'Failed to downgrade subscription' };
    }

    return { success: true, subscription: updated };
  } catch (error) {
    console.error('[subscription-actions] Error downgrading plan:', error);
    return { error: 'Failed to downgrade plan' };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(reason: string = 'user_requested') {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const subscription = await getUserSubscription(user.id);
    if (!subscription) {
      return { error: 'No active subscription' };
    }

    const updated = await SubscriptionLifecycle.cancelSubscription(subscription, reason);
    if (!updated) {
      return { error: 'Failed to cancel subscription' };
    }

    return { success: true, subscription: updated };
  } catch (error) {
    console.error('[subscription-actions] Error canceling subscription:', error);
    return { error: 'Failed to cancel subscription' };
  }
}

/**
 * Get subscription history
 */
export async function getSubscriptionChangeHistory() {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const subscription = await getUserSubscription(user.id);
    if (!subscription) {
      return { history: [] };
    }

    const history = await getSubscriptionHistory(subscription.id);
    return { history };
  } catch (error) {
    console.error('[subscription-actions] Error fetching history:', error);
    return { error: 'Failed to fetch subscription history' };
  }
}

/**
 * Get user invoices
 */
export async function getUserBillingInvoices() {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const invoices = await getUserInvoices(user.id);
    return { invoices };
  } catch (error) {
    console.error('[subscription-actions] Error fetching invoices:', error);
    return { error: 'Failed to fetch invoices' };
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(featureKey: string) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { hasAccess: false, reason: 'Unauthorized' };
    }

    const subscription = await getUserSubscription(user.id);
    if (!subscription || !isSubscriptionActive(subscription)) {
      return { hasAccess: false, reason: 'No active subscription' };
    }

    const usage = await getFeatureUsage(user.id, featureKey);
    if (!usage) {
      return { hasAccess: false, reason: 'Feature not available on plan' };
    }

    const hasAccess = usage.limit_value === null || usage.usage_count < usage.limit_value;
    return {
      hasAccess,
      usage: usage.usage_count,
      limit: usage.limit_value,
      remaining: usage.limit_value ? usage.limit_value - usage.usage_count : null,
    };
  } catch (error) {
    console.error('[subscription-actions] Error checking feature access:', error);
    return { hasAccess: false, reason: 'Error checking access' };
  }
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(featureKey: string, amount: number = 1) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const result = await incrementFeatureUsage(user.id, featureKey, amount);
    if (!result) {
      return { error: 'Failed to track usage' };
    }

    return { success: true, usage: result };
  } catch (error) {
    console.error('[subscription-actions] Error tracking usage:', error);
    return { error: 'Failed to track feature usage' };
  }
}
