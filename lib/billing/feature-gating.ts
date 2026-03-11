import { getUserSubscription } from "@/lib/db/subscriptions";
import { getPlanById, getPlanFeatures, getFeatureUsage } from "@/lib/db/plans";
import { isSubscriptionActive } from "@/lib/billing/subscription-lifecycle";

/**
 * Feature gating system for subscription-based access control
 */
export class FeatureGate {
  /**
   * Check if user has access to a feature
   */
  static async userHasAccess(userId: string, featureKey: string): Promise<boolean> {
    try {
      const subscription = await getUserSubscription(userId);
      if (!subscription || !isSubscriptionActive(subscription)) {
        return false;
      }

      return this.planHasFeature(subscription.plan_id, featureKey);
    } catch (error) {
      console.error(`[feature-gating] Error checking access for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if plan has a feature enabled
   */
  static async planHasFeature(planId: string, featureKey: string): Promise<boolean> {
    try {
      const features = await getPlanFeatures(planId);
      return features.some(f => f.feature_key === featureKey && f.is_enabled);
    } catch (error) {
      console.error(`[feature-gating] Error checking plan features:`, error);
      return false;
    }
  }

  /**
   * Get feature limit for a plan
   */
  static async getFeatureLimit(planId: string, featureKey: string): Promise<number | null> {
    try {
      const features = await getPlanFeatures(planId);
      const feature = features.find(f => f.feature_key === featureKey);
      
      if (!feature || feature.feature_value === 'unlimited') {
        return null; // Unlimited
      }

      return parseInt(feature.feature_value || '0', 10);
    } catch (error) {
      console.error(`[feature-gating] Error getting feature limit:`, error);
      return 0;
    }
  }

  /**
   * Check if user can perform an action (with quota checking)
   */
  static async canUserPerformAction(
    userId: string,
    actionKey: string,
    currentUsage: number = 0
  ): Promise<{ allowed: boolean; reason?: string; limit?: number; remaining?: number }> {
    try {
      const subscription = await getUserSubscription(userId);
      if (!subscription || !isSubscriptionActive(subscription)) {
        return { allowed: false, reason: 'No active subscription' };
      }

      const limit = await this.getFeatureLimit(subscription.plan_id, actionKey);
      
      // Unlimited access
      if (limit === null) {
        return { allowed: true };
      }

      // Check quota
      if (currentUsage >= limit) {
        return {
          allowed: false,
          reason: `Quota exceeded. Limit: ${limit}`,
          limit,
          remaining: 0,
        };
      }

      return {
        allowed: true,
        limit,
        remaining: limit - currentUsage,
      };
    } catch (error) {
      console.error(`[feature-gating] Error checking action permission:`, error);
      return { allowed: false, reason: 'Error checking permissions' };
    }
  }

  /**
   * Get feature metadata for display
   */
  static async getFeatureInfo(userId: string, featureKey: string) {
    try {
      const subscription = await getUserSubscription(userId);
      if (!subscription) {
        return { available: false };
      }

      const plan = await getPlanById(subscription.plan_id);
      const features = await getPlanFeatures(subscription.plan_id);
      const feature = features.find(f => f.feature_key === featureKey);
      const usage = await getFeatureUsage(userId, featureKey);

      if (!feature) {
        return { available: false };
      }

      const limit = feature.feature_value === 'unlimited' ? null : parseInt(feature.feature_value || '0', 10);

      return {
        available: feature.is_enabled,
        name: feature.feature_name,
        plan: plan?.display_name,
        limit,
        usage: usage?.usage_count || 0,
        unlimited: limit === null,
      };
    } catch (error) {
      console.error(`[feature-gating] Error getting feature info:`, error);
      return { available: false };
    }
  }
}

/**
 * Feature availability matrix (which features are on which plans)
 */
export const FEATURE_MATRIX = {
  max_websites: {
    name: 'Max Websites',
    description: 'Maximum number of websites you can create',
    starter: 1,
    growth: 5,
    pro: 25,
    premium: null, // unlimited
    enterprise: null, // unlimited
  },
  max_custom_domains: {
    name: 'Custom Domains',
    description: 'Maximum number of custom domains per website',
    starter: 1,
    growth: 5,
    pro: 25,
    premium: null,
    enterprise: null,
  },
  ssl_certificates: {
    name: 'Free SSL',
    description: 'Automatic SSL certificate provisioning',
    starter: true,
    growth: true,
    pro: true,
    premium: true,
    enterprise: true,
  },
  analytics: {
    name: 'Website Analytics',
    description: 'Basic traffic analytics and insights',
    starter: true,
    growth: true,
    pro: true,
    premium: true,
    enterprise: true,
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Detailed analytics, heatmaps, and session replay',
    starter: false,
    growth: true,
    pro: true,
    premium: true,
    enterprise: true,
  },
  api_access: {
    name: 'API Access',
    description: 'REST API for programmatic access',
    starter: false,
    growth: false,
    pro: true,
    premium: true,
    enterprise: true,
  },
  priority_support: {
    name: 'Priority Support',
    description: '24/7 priority support with SLA',
    starter: false,
    growth: false,
    pro: false,
    premium: true,
    enterprise: true,
  },
  sso: {
    name: 'Single Sign-On',
    description: 'SSO integration for team members',
    starter: false,
    growth: false,
    pro: false,
    premium: true,
    enterprise: true,
  },
  team_members: {
    name: 'Team Members',
    description: 'Number of team members allowed',
    starter: 1,
    growth: 5,
    pro: 25,
    premium: null,
    enterprise: null,
  },
} as const;

/**
 * Check if a feature is available on a plan
 */
export function isPlanFeatureAvailable(planName: string, featureKey: keyof typeof FEATURE_MATRIX): boolean {
  const feature = FEATURE_MATRIX[featureKey];
  if (!feature) return false;

  const value = feature[planName as keyof typeof feature];
  return value !== false && value !== 0;
}

/**
 * Get feature value for a plan (limit or boolean)
 */
export function getPlanFeatureValue(planName: string, featureKey: keyof typeof FEATURE_MATRIX): number | boolean | null {
  const feature = FEATURE_MATRIX[featureKey];
  if (!feature) return null;

  return feature[planName as keyof typeof feature] || null;
}
