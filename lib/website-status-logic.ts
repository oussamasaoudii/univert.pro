import type { Website, WebsiteStatus } from "@/lib/types";

/**
 * Website Status Logic & Helpers
 *
 * Contains business logic for website lifecycle states,
 * actions available in each state, and status transitions.
 */

export const websiteStatusLogic = {
  /**
   * Get status badge color
   */
  getStatusColor(status: WebsiteStatus): string {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "provisioning":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "ready":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "suspended":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "failed":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-secondary";
    }
  },

  /**
   * Get status display name
   */
  getStatusName(status: WebsiteStatus): string {
    const names: Record<WebsiteStatus, string> = {
      pending: "Pending",
      provisioning: "Provisioning",
      ready: "Ready",
      suspended: "Suspended",
      failed: "Failed",
    };
    return names[status] || status;
  },

  /**
   * Check if website is accessible
   */
  isAccessible(website: Website): boolean {
    return website.status === "ready";
  },

  /**
   * Check if website can be edited
   */
  canEdit(website: Website): boolean {
    return website.status === "ready";
  },

  /**
   * Check if website is provisioning
   */
  isProvisioning(website: Website): boolean {
    return website.status === "provisioning" || website.status === "pending";
  },

  /**
   * Check if website has error
   */
  hasError(website: Website): boolean {
    return website.status === "failed" || website.status === "suspended";
  },

  /**
   * Get available actions for website
   */
  getAvailableActions(website: Website): string[] {
    const actions: string[] = [];

    if (website.status === "ready") {
      actions.push("edit", "domain", "analytics", "backup", "suspend", "delete");
    } else if (website.status === "provisioning" || website.status === "pending") {
      actions.push("cancel", "view-logs");
    } else if (website.status === "suspended") {
      actions.push("unsuspend", "delete");
    } else if (website.status === "failed") {
      actions.push("retry", "delete", "view-logs");
    }

    actions.push("details");
    return actions;
  },

  /**
   * Check if website can be renewed
   */
  canRenew(website: Website): boolean {
    if (website.status === "suspended") return true;
    if (website.status === "ready") {
      const renewalDate = new Date(website.renewalDate);
      const daysUntilRenewal = (renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilRenewal <= 30; // Can renew 30 days before expiry
    }
    return false;
  },

  /**
   * Get days until renewal
   */
  getDaysUntilRenewal(website: Website): number {
    const renewalDate = new Date(website.renewalDate);
    const now = new Date();
    return Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  },

  /**
   * Check if website renewal is urgent (within 7 days)
   */
  isRenewalUrgent(website: Website): boolean {
    const daysUntilRenewal = this.getDaysUntilRenewal(website);
    return daysUntilRenewal > 0 && daysUntilRenewal <= 7;
  },

  /**
   * Get renewal message
   */
  getRenewalMessage(website: Website): string {
    if (website.status === "suspended") {
      return "Website suspended. Renew to restore access.";
    }

    const daysUntilRenewal = this.getDaysUntilRenewal(website);
    if (daysUntilRenewal < 0) {
      return "Website renewal expired. Please renew immediately.";
    }

    if (daysUntilRenewal === 0) {
      return "Website renews today.";
    }

    if (daysUntilRenewal === 1) {
      return "Website renews tomorrow.";
    }

    return `Website renews in ${daysUntilRenewal} days.`;
  },

  /**
   * Get status icon
   */
  getStatusIcon(status: WebsiteStatus): string {
    switch (status) {
      case "pending":
        return "clock";
      case "provisioning":
        return "zap";
      case "ready":
        return "check-circle-2";
      case "suspended":
        return "alert-circle";
      case "failed":
        return "x-circle";
      default:
        return "help-circle";
    }
  },

  /**
   * Get provisioning progress percentage
   */
  getProvisioningProgress(website: Website): number {
    if (!website.provisioningProgress) return 0;

    const steps = website.provisioningProgress.steps;
    const completed = steps.filter((s) => s.status === "completed").length;
    return Math.round((completed / steps.length) * 100);
  },

  /**
   * Check if provisioning has error
   */
  provisioningHasError(website: Website): boolean {
    if (!website.provisioningProgress) return false;
    return website.provisioningProgress.steps.some((s) => s.status === "failed");
  },

  /**
   * Get current provisioning step
   */
  getCurrentProvisioningStep(website: Website) {
    if (!website.provisioningProgress) return null;
    return website.provisioningProgress.steps.find((s) => s.status === "in_progress");
  },

  /**
   * Get last provisioning error
   */
  getLastProvisioningError(website: Website): string | null {
    if (!website.provisioningProgress) return null;

    const failedStep = website.provisioningProgress.steps.find((s) => s.status === "failed");
    return failedStep?.message || null;
  },
};
