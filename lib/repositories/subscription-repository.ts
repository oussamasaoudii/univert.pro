import type { Subscription, Invoice, Plan } from "@/lib/types";
import type { SubscriptionStatus } from "@/lib/auth-types";
import {
  getUserBillingSnapshot,
  listBillingPlans,
  listInvoicesForAdmin,
  listUserInvoices,
  updateUserSubscriptionPlan,
} from "@/lib/mysql/billing";
import { listUserWebsites } from "@/lib/mysql/platform";

function normalizeTier(value: string): Plan["tier"] {
  const lower = value.trim().toLowerCase();
  if (lower.includes("enterprise")) return "enterprise";
  if (lower.includes("premium")) return "premium";
  if (lower.includes("pro")) return "pro";
  if (lower.includes("growth")) return "growth";
  return "starter";
}

function toPlan(plan: Awaited<ReturnType<typeof listBillingPlans>>[number]): Plan {
  return {
    id: plan.id,
    name: plan.name,
    tier: plan.tier,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    features: plan.features,
    websiteLimit: plan.websiteLimit,
    storageLimit: plan.storageLimit,
    bandwidthLimit: plan.bandwidthLimit,
    supportLevel: plan.supportLevel,
  };
}

function toInvoice(invoice: Awaited<ReturnType<typeof listUserInvoices>>[number]): Invoice {
  return {
    id: invoice.invoiceNumber,
    amount: invoice.amount,
    status: invoice.status,
    date: invoice.issuedAt,
    description: invoice.description,
    paymentMethod: invoice.paymentMethod || undefined,
    downloadUrl: invoice.downloadUrl || undefined,
  };
}

function toSubscriptionStatus(
  status: "trialing" | "active" | "past_due" | "cancelled",
): SubscriptionStatus {
  if (status === "cancelled") {
    return "canceled";
  }
  return status;
}

export const subscriptionRepository = {
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const snapshot = await getUserBillingSnapshot(userId);
    const websites = await listUserWebsites(userId);
    const currentPlan = snapshot.currentPlan;

    return {
      id: snapshot.subscription.id,
      planId: currentPlan?.id || snapshot.subscription.planName,
      planName: currentPlan?.name || snapshot.subscription.planName,
      status: toSubscriptionStatus(snapshot.subscription.status),
      currentPeriodEnd: snapshot.subscription.renewalDate,
      renewalDate: snapshot.subscription.renewalDate,
      billingCycle: snapshot.subscription.billingCycle,
      websitesUsed: websites.length,
      websitesLimit: currentPlan?.websiteLimit || 0,
    };
  },

  async createSubscription(
    userId: string,
    planId: string,
    billingCycle: "monthly" | "yearly",
  ): Promise<Subscription> {
    const plans = await listBillingPlans();
    const selected = plans.find((plan) => plan.id === planId);
    const tier = selected ? selected.tier : normalizeTier(planId);
    await updateUserSubscriptionPlan(userId, { tier, billingCycle });
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error("Failed to create subscription");
    }
    return subscription;
  },

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const invoices = await listInvoicesForAdmin({ limit: 1000 });
    const invoice = invoices.find((item) => item.subscriptionId === subscriptionId);
    if (!invoice) {
      return null;
    }

    const payload: { tier?: Plan["tier"]; billingCycle?: "monthly" | "yearly" } = {};
    if (updates.planName) {
      payload.tier = normalizeTier(updates.planName);
    }
    if (updates.billingCycle) {
      payload.billingCycle = updates.billingCycle;
    }

    await updateUserSubscriptionPlan(invoice.userId, payload);
    return this.getUserSubscription(invoice.userId);
  },

  async cancelSubscription(
    subscriptionId: string,
    _immediately = false,
  ): Promise<Subscription | null> {
    const invoices = await listInvoicesForAdmin({ limit: 1000 });
    const invoice = invoices.find((item) => item.subscriptionId === subscriptionId);
    if (!invoice) {
      return null;
    }

    await updateUserSubscriptionPlan(invoice.userId, { tier: "starter" });
    return this.getUserSubscription(invoice.userId);
  },

  async getPlans(): Promise<Plan[]> {
    const plans = await listBillingPlans();
    return plans.map(toPlan);
  },

  async getPlanById(planId: string): Promise<Plan | null> {
    const plans = await listBillingPlans({ includeInactive: true });
    const plan = plans.find((item) => item.id === planId);
    return plan ? toPlan(plan) : null;
  },

  async getUserInvoices(userId: string, limit = 20): Promise<Invoice[]> {
    const invoices = await listUserInvoices(userId, limit);
    return invoices.map(toInvoice);
  },

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    const invoices = await listInvoicesForAdmin({ limit: 1000 });
    const invoice = invoices.find(
      (item) => item.id === invoiceId || item.invoiceNumber === invoiceId,
    );
    return invoice
      ? {
          id: invoice.invoiceNumber,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.issuedAt,
          description: invoice.description,
          paymentMethod: invoice.paymentMethod || undefined,
          downloadUrl: invoice.downloadUrl || undefined,
        }
      : null;
  },

  async updatePaymentMethod(
    _userId: string,
    _stripePaymentMethodId: string,
  ): Promise<boolean> {
    return false;
  },

  async checkTrialStatus(
    userId: string,
  ): Promise<{ isTrialing: boolean; daysRemaining: number }> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return { isTrialing: false, daysRemaining: 0 };
    }

    const isTrialing = subscription.status === "trialing";
    const renewal = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd)
      : null;
    const now = new Date();
    const daysRemaining =
      renewal && !Number.isNaN(renewal.getTime())
        ? Math.max(0, Math.ceil((renewal.getTime() - now.getTime()) / 86400000))
        : 0;

    return {
      isTrialing,
      daysRemaining: isTrialing ? daysRemaining : 0,
    };
  },
};
