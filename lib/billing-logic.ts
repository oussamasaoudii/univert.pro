import type { Subscription, Plan } from "@/lib/types";
import type { SubscriptionStatus } from "@/lib/auth-types";

/**
 * Billing Logic & Helpers
 *
 * Contains business logic for subscription states, plan limits,
 * trial calculations, and billing operations.
 */

export const billingLogic = {
  /**
   * Determine if user can perform action based on subscription
   */
  canPerformAction(subscription: Subscription | null, action: string): boolean {
    if (!subscription) return false;

    // Trial users can do everything
    if (subscription.status === "trialing") return true;

    // Active users can do everything
    if (subscription.status === "active") return true;

    // Past due users have limited access
    if (subscription.status === "past_due") {
      return ["view", "readonly"].includes(action);
    }

    // Canceled users have no access
    if (subscription.status === "canceled") return false;

    return false;
  },

  /**
   * Check if user has reached website limit
   */
  hasReachedWebsiteLimit(subscription: Subscription | null, currentCount: number, limit: number): boolean {
    if (!subscription) return true;
    if (subscription.status === "canceled" || subscription.status === "expired") return true;
    return currentCount >= limit;
  },

  /**
   * Calculate days remaining in trial
   */
  getDaysRemainingInTrial(trialEndsAt: string | null | undefined): number {
    if (!trialEndsAt) return 0;

    const trialEnd = new Date(trialEndsAt);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  },

  /**
   * Check if trial is active
   */
  isTrialActive(subscription: Subscription | null): boolean {
    if (!subscription || subscription.status !== "trialing") return false;
    const daysRemaining = this.getDaysRemainingInTrial(subscription.trialEndsAt);
    return daysRemaining > 0;
  },

  /**
   * Check if trial will expire soon (within 3 days)
   */
  isTrialExpiringsoon(subscription: Subscription | null): boolean {
    if (!this.isTrialActive(subscription)) return false;
    const daysRemaining = this.getDaysRemainingInTrial(subscription?.trialEndsAt);
    return daysRemaining > 0 && daysRemaining <= 3;
  },

  /**
   * Get subscription message based on status
   */
  getSubscriptionMessage(subscription: Subscription | null): string {
    if (!subscription) {
      return "No active subscription. Please upgrade to continue.";
    }

    switch (subscription.status) {
      case "trialing":
        const daysLeft = this.getDaysRemainingInTrial(subscription.trialEndsAt);
        return `Trial active. ${daysLeft} days remaining.`;
      case "active":
        return `Active subscription. Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}.`;
      case "past_due":
        return "Payment overdue. Please update your payment method.";
      case "canceled":
        return "Subscription canceled. Upgrade to continue.";
      default:
        return "Unknown subscription status.";
    }
  },

  /**
   * Determine if subscription needs action
   */
  needsAction(subscription: Subscription | null): boolean {
    if (!subscription) return true;
    if (subscription.status === "past_due") return true;
    if (this.isTrialExpiringsoon(subscription)) return true;
    return false;
  },

  /**
   * Get upgrade recommendations based on usage
   */
  getUpgradeRecommendation(
    currentPlan: Plan,
    allPlans: Plan[],
    usage: { websites: number; bandwidth: string; storage: string }
  ): Plan | null {
    // Find the next tier up that fits current usage
    const tiers = ["starter", "growth", "pro", "premium", "enterprise"];
    const currentTierIndex = tiers.indexOf(currentPlan.tier);

    if (currentTierIndex < 0 || currentTierIndex >= tiers.length - 1) return null;

    // Check if current plan limit is exceeded
    if (usage.websites > currentPlan.websiteLimit) {
      for (let i = currentTierIndex + 1; i < tiers.length; i++) {
        const plan = allPlans.find((p) => p.tier === tiers[i]);
        if (plan && usage.websites <= plan.websiteLimit) {
          return plan;
        }
      }
    }

    return null;
  },

  /**
   * Calculate refund amount for pro-rata cancellation
   */
  calculateRefund(subscription: Subscription, currentChargeAmount: number): number {
    const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const totalDays = (currentPeriodEnd.getTime() - new Date(subscription.currentPeriodEnd).getTime()) / (1000 * 60 * 60 * 24);
    const remainingDays = (currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (remainingDays <= 0) return 0;

    const refundAmount = (currentChargeAmount * remainingDays) / totalDays;
    return Math.round(refundAmount * 100) / 100;
  },

  /**
   * Get payment status badge color
   */
  getPaymentStatusColor(status: SubscriptionStatus): string {
    switch (status) {
      case "trialing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "past_due":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "canceled":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "expired":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-secondary";
    }
  },

  /**
   * Check if payment method is required
   */
  paymentMethodRequired(subscription: Subscription | null): boolean {
    if (!subscription) return true;
    if (subscription.status === "canceled" || subscription.status === "expired") return false;
    return true;
  },
};
