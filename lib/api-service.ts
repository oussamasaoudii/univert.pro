import type {
  Website,
  Template,
  Subscription,
  Invoice,
  Ticket,
  Domain,
  Server,
  ProvisioningProfile,
  Job,
  Backup,
  Alert,
  AdminStats,
} from "./types";

const DELAY = 50;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const userApi = {
  async getSubscriptionStats() {
    await delay(DELAY);
    return {
      plan: null,
      status: null,
      websitesUsed: 0,
      websitesLimit: 0,
      renewalDate: null,
      trialEndsAt: null,
    };
  },
  async getProfile() {
    await delay(DELAY);
    return {
      name: "",
      email: "",
      avatar: "",
      plan: null,
      websiteCount: 0,
    };
  },
};

export const websiteApi = {
  async getWebsites(): Promise<Website[]> {
    await delay(DELAY);
    return [];
  },
  async getWebsite(_id: string): Promise<Website | undefined> {
    await delay(DELAY);
    return undefined;
  },
  async getWebsitesByStatus(_status: Website["status"]): Promise<Website[]> {
    await delay(DELAY);
    return [];
  },
  async getWebsiteStats() {
    await delay(DELAY);
    return {
      total: 0,
      ready: 0,
      provisioning: 0,
      pending: 0,
      suspended: 0,
      failed: 0,
    };
  },
};

export const templateApi = {
  async getTemplates(): Promise<Template[]> {
    await delay(DELAY);
    return [];
  },
  async getTemplate(_id: string): Promise<Template | undefined> {
    await delay(DELAY);
    return undefined;
  },
  async getFeaturedTemplates(): Promise<Template[]> {
    await delay(DELAY);
    return [];
  },
  async getTemplatesByStack(_stack: "Laravel" | "Next.js" | "WordPress"): Promise<Template[]> {
    await delay(DELAY);
    return [];
  },
  async getTemplatesByCategory(_category: string): Promise<Template[]> {
    await delay(DELAY);
    return [];
  },
  async searchTemplates(_query: string): Promise<Template[]> {
    await delay(DELAY);
    return [];
  },
};

export const domainApi = {
  async getDomains(): Promise<Domain[]> {
    await delay(DELAY);
    return [];
  },
  async getWebsiteDomains(_websiteId: string): Promise<Domain[]> {
    await delay(DELAY);
    return [];
  },
  async getDomain(_id: string): Promise<Domain | undefined> {
    await delay(DELAY);
    return undefined;
  },
  async getDomainStats() {
    await delay(DELAY);
    return {
      total: 0,
      verified: 0,
      pending: 0,
      healthy: 0,
      sslExpiring: 0,
    };
  },
};

export const provisioningApi = {
  async getProvisioningJobs(): Promise<Job[]> {
    await delay(DELAY);
    return [];
  },
  async getProvisioningJob(_id: string): Promise<Job | undefined> {
    await delay(DELAY);
    return undefined;
  },
  async getJobsByStatus(_status: Job["status"]): Promise<Job[]> {
    await delay(DELAY);
    return [];
  },
  async getProvisioningStats() {
    await delay(DELAY);
    return {
      total: 0,
      queued: 0,
      running: 0,
      completed: 0,
      failed: 0,
      totalDuration: "0m",
    };
  },
};

export const billingApi = {
  async getSubscription(): Promise<Subscription | null> {
    await delay(DELAY);
    return null;
  },
  async getInvoices(): Promise<Invoice[]> {
    await delay(DELAY);
    return [];
  },
  async getInvoice(_id: string): Promise<Invoice | undefined> {
    await delay(DELAY);
    return undefined;
  },
  async getPlans(): Promise<import("./types").Plan[]> {
    await delay(DELAY);
    return [];
  },
  async getBillingStats() {
    await delay(DELAY);
    return {
      currentPlan: null,
      monthlyPrice: 0,
      nextRenewal: null,
      totalSpent: 0,
      invoiceCount: 0,
      overdue: 0,
    };
  },
};

export const supportApi = {
  async getTickets(): Promise<Ticket[]> {
    await delay(DELAY);
    return [];
  },
  async getTicket(_id: string): Promise<Ticket | undefined> {
    await delay(DELAY);
    return undefined;
  },
  async getTicketsByStatus(_status: Ticket["status"]): Promise<Ticket[]> {
    await delay(DELAY);
    return [];
  },
  async getSupportStats() {
    await delay(DELAY);
    return {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      avgResponseTime: "0m",
      satisfactionScore: 0,
    };
  },
};

export const infrastructureApi = {
  async getServers(): Promise<Server[]> {
    await delay(DELAY);
    return [];
  },
  async getServer(_id: string): Promise<Server | undefined> {
    await delay(DELAY);
    return undefined;
  },
  async getProvisioningProfiles(): Promise<ProvisioningProfile[]> {
    await delay(DELAY);
    return [];
  },
  async getProvisioningProfile(_id: string): Promise<ProvisioningProfile | undefined> {
    await delay(DELAY);
    return undefined;
  },
  async getBackups(): Promise<Backup[]> {
    await delay(DELAY);
    return [];
  },
  async getAlerts(): Promise<Alert[]> {
    await delay(DELAY);
    return [];
  },
  async getInfrastructureStats() {
    await delay(DELAY);
    return {
      totalServers: 0,
      healthyServers: 0,
      degradedServers: 0,
      totalWebsites: 0,
      avgCpuUsage: 0,
      avgRamUsage: 0,
      avgDiskUsage: 0,
      totalCapacity: 0,
      criticalAlerts: 0,
    };
  },
};

export const analyticsApi = {
  async getAdminStats(): Promise<AdminStats> {
    await delay(DELAY);
    return {
      totalUsers: 0,
      totalWebsites: 0,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      pendingProvisioning: 0,
      failedJobs: 0,
      openTickets: 0,
      avgResponseTime: "0m",
      customerSatisfaction: 0,
      churnRate: 0,
    };
  },
  async getRevenueData() {
    await delay(DELAY);
    return [];
  },
  async getPlanDistribution() {
    await delay(DELAY);
    return [];
  },
  async getAdminUsers() {
    await delay(DELAY);
    return [];
  },
  async getAdminWebsites() {
    await delay(DELAY);
    return [];
  },
  async getAdminInvoices() {
    await delay(DELAY);
    return [];
  },
};

export const api = {
  user: userApi,
  website: websiteApi,
  template: templateApi,
  domain: domainApi,
  provisioning: provisioningApi,
  billing: billingApi,
  support: supportApi,
  infrastructure: infrastructureApi,
  analytics: analyticsApi,
};
