import { updateSubscriptionStatus } from "@/lib/db/subscriptions";
import { logSubscriptionAction, getPlanById, getPlanFeatures } from "@/lib/db/plans";
import type { SubscriptionRow, PlanName } from "@/lib/db/types";

// Subscription state machine with validation and automatic transitions
export class SubscriptionLifecycle {
  /**
   * Valid state transitions
   */
  private static readonly TRANSITIONS: Record<string, Set<string>> = {
    trialing: new Set(['active', 'canceled']),
    active: new Set(['past_due', 'canceled']),
    past_due: new Set(['active', 'canceled']),
    canceled: new Set([]), // Terminal state
    ended: new Set([]), // Terminal state
  };

  /**
   * Check if a state transition is valid
   */
  static canTransition(from: string, to: string): boolean {
    return this.TRANSITIONS[from]?.has(to) ?? false;
  }

  /**
   * Transition subscription to a new status
   */
  static async transition(
    subscription: SubscriptionRow,
    newStatus: SubscriptionRow['status'],
    reason: string = ''
  ): Promise<SubscriptionRow | null> {
    // Validate transition
    if (!this.canTransition(subscription.status, newStatus)) {
      console.error(`[billing] Invalid transition from ${subscription.status} to ${newStatus}`);
      return null;
    }

    // Update subscription
    const updated = await updateSubscriptionStatus(subscription.id, newStatus);
    if (!updated) return null;

    // Log action
    await logSubscriptionAction(
      subscription.id,
      subscription.user_id,
      this.getActionForTransition(subscription.status, newStatus),
      subscription.plan_id,
      subscription.plan_id,
      subscription.status,
      newStatus,
      null,
      { reason }
    );

    return updated;
  }

  /**
   * Upgrade subscription to a new plan
   */
  static async upgradePlan(
    subscription: SubscriptionRow,
    newPlanId: string,
    proRationFactor: number = 1.0
  ): Promise<SubscriptionRow | null> {
    // Verify new plan exists
    const newPlan = await getPlanById(newPlanId);
    if (!newPlan) {
      console.error(`[billing] Plan not found: ${newPlanId}`);
      return null;
    }

    // Calculate pro-ration if applicable
    const proRationAmount = Math.round(newPlan.price_monthly * proRationFactor);

    // Update subscription
    const updated = await updateSubscriptionStatus(subscription.id, subscription.status);
    if (!updated) return null;

    // Log upgrade action
    await logSubscriptionAction(
      subscription.id,
      subscription.user_id,
      'upgraded',
      subscription.plan_id,
      newPlanId,
      subscription.status,
      subscription.status,
      proRationAmount,
      { proRationFactor }
    );

    return updated;
  }

  /**
   * Downgrade subscription to a new plan
   */
  static async downgradePlan(
    subscription: SubscriptionRow,
    newPlanId: string
  ): Promise<SubscriptionRow | null> {
    // Verify new plan exists
    const newPlan = await getPlanById(newPlanId);
    if (!newPlan) {
      console.error(`[billing] Plan not found: ${newPlanId}`);
      return null;
    }

    // Update subscription
    const updated = await updateSubscriptionStatus(subscription.id, subscription.status);
    if (!updated) return null;

    // Log downgrade action
    await logSubscriptionAction(
      subscription.id,
      subscription.user_id,
      'downgraded',
      subscription.plan_id,
      newPlanId,
      subscription.status,
      subscription.status,
      null
    );

    return updated;
  }

  /**
   * Renew subscription for next period
   */
  static async renewSubscription(subscription: SubscriptionRow): Promise<SubscriptionRow | null> {
    // Can only renew active or past_due subscriptions
    if (!['active', 'past_due'].includes(subscription.status)) {
      console.error(`[billing] Cannot renew subscription with status: ${subscription.status}`);
      return null;
    }

    const now = new Date();
    const billingCycle = subscription.metadata?.billingCycle || 'monthly';
    
    const daysToAdd = billingCycle === 'annual' ? 365 : 30;
    const nextPeriodEnd = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // Update subscription periods
    const updated = await updateSubscriptionStatus(subscription.id, 'active');
    if (!updated) return null;

    // Log renewal action
    await logSubscriptionAction(
      subscription.id,
      subscription.user_id,
      'renewed',
      subscription.plan_id,
      subscription.plan_id,
      subscription.status,
      'active',
      subscription.amount_paid
    );

    return updated;
  }

  /**
   * Mark subscription as payment failed
   */
  static async markPaymentFailed(
    subscription: SubscriptionRow,
    errorMessage: string = ''
  ): Promise<SubscriptionRow | null> {
    // Increment failed payment count
    const failedCount = (subscription.failed_payment_count || 0) + 1;
    const maxRetries = 3;

    // Cancel if exceeded max retries
    if (failedCount > maxRetries) {
      return this.transition(subscription, 'canceled', `Payment failed ${failedCount} times`);
    }

    // Move to past_due
    const updated = await updateSubscriptionStatus(subscription.id, 'past_due');
    if (!updated) return null;

    // Log action
    await logSubscriptionAction(
      subscription.id,
      subscription.user_id,
      'payment_failed',
      subscription.plan_id,
      subscription.plan_id,
      subscription.status,
      'past_due',
      null,
      { failedCount, errorMessage, willRetryAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
    );

    return updated;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    subscription: SubscriptionRow,
    reason: string = 'user_requested'
  ): Promise<SubscriptionRow | null> {
    // Can cancel from any non-terminal state
    if (['canceled', 'ended'].includes(subscription.status)) {
      console.error(`[billing] Subscription already in terminal state: ${subscription.status}`);
      return null;
    }

    const updated = await updateSubscriptionStatus(subscription.id, 'canceled');
    if (!updated) return null;

    // Log cancellation
    await logSubscriptionAction(
      subscription.id,
      subscription.user_id,
      'canceled',
      subscription.plan_id,
      subscription.plan_id,
      subscription.status,
      'canceled',
      null,
      { reason }
    );

    return updated;
  }

  /**
   * Get the next recommended action for a subscription
   */
  static getNextAction(subscription: SubscriptionRow): string {
    switch (subscription.status) {
      case 'trialing':
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
        const daysUntilTrialEnd = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        return daysUntilTrialEnd ? `Trial ends in ${daysUntilTrialEnd} days. Add payment method to continue.` : 'Trial has ended. Select a plan to continue.';
      
      case 'active':
        return 'Your subscription is active. Renews on ' + new Date(subscription.current_period_end).toLocaleDateString();
      
      case 'past_due':
        return 'Payment failed. Please update your payment method to restore service.';
      
      case 'canceled':
        return 'Subscription has been canceled. Reactivate to restore service.';
      
      case 'ended':
        return 'Subscription has ended.';
      
      default:
        return 'Unknown status';
    }
  }

  /**
   * Get action name for state transition
   */
  private static getActionForTransition(from: string, to: string): 'created' | 'upgraded' | 'downgraded' | 'renewed' | 'canceled' | 'payment_failed' {
    if (from === 'trialing' && to === 'active') return 'created';
    if (to === 'canceled') return 'canceled';
    return 'renewed';
  }
}

/**
 * Get subscription with enriched plan information
 */
export async function getSubscriptionWithPlan(subscription: SubscriptionRow) {
  const plan = await getPlanById(subscription.plan_id);
  const features = plan ? await getPlanFeatures(subscription.plan_id) : [];

  return {
    ...subscription,
    plan,
    features,
  };
}

/**
 * Check if subscription is in good standing (active or trialing)
 */
export function isSubscriptionActive(subscription: SubscriptionRow | null): boolean {
  return subscription?.status === 'active' || subscription?.status === 'trialing' || false;
}

/**
 * Check if subscription is expired or canceled
 */
export function isSubscriptionTerminated(subscription: SubscriptionRow | null): boolean {
  return subscription?.status === 'canceled' || subscription?.status === 'ended' || false;
}
