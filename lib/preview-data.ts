import { randomUUID } from "node:crypto";
import {
  activities as mockActivities,
  currentSubscription as mockCurrentSubscription,
  domains as mockDomains,
  invoices as mockInvoices,
  notifications as mockNotifications,
  plans as mockPlans,
  templates as mockTemplates,
  websites as mockWebsites,
} from "@/lib/mock-data";
import type { DashboardDomainRecord } from "@/lib/domain/dashboard-records";
import type {
  BillingPlanRecord,
  BillingPlanTier,
  BillingSnapshot,
  UserInvoiceRecord,
  UserPaymentMethodRecord,
} from "@/lib/mysql/billing";
import type {
  TemplateRecord,
  UserActivityRecord,
  UserNotificationRecord,
  UserSubscriptionRecord,
  WebsiteRecord,
} from "@/lib/mysql/platform";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketRecord,
} from "@/lib/mysql/support";

const PREVIEW_USER_ID = "preview-user";
const NOW = "2026-03-11T18:30:00.000Z";

const previewPlans: BillingPlanRecord[] = mockPlans.map((plan, index) => ({
  id: plan.id,
  name: plan.name,
  tier: plan.tier,
  monthlyPrice: plan.monthlyPrice,
  yearlyPrice: plan.yearlyPrice,
  websiteLimit: plan.websiteLimit,
  storageLimit: plan.storageLimit,
  bandwidthLimit: plan.bandwidthLimit,
  supportLevel: plan.supportLevel,
  isActive: true,
  position: index + 1,
  features: plan.features,
  createdAt: NOW,
  updatedAt: NOW,
}));

const previewPaymentMethods: UserPaymentMethodRecord[] = [
  {
    id: "pm_preview_visa",
    userId: PREVIEW_USER_ID,
    methodType: "card",
    brand: "Visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2028,
    isDefault: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

let previewSubscriptionState: UserSubscriptionRecord = {
  id: mockCurrentSubscription.id,
  userId: PREVIEW_USER_ID,
  planName: mockCurrentSubscription.planName,
  status: mockCurrentSubscription.status,
  billingCycle: mockCurrentSubscription.billingCycle,
  renewalDate: mockCurrentSubscription.renewalDate || mockCurrentSubscription.currentPeriodEnd,
  createdAt: NOW,
  updatedAt: NOW,
};

function planTierFromName(planName: string): BillingPlanTier {
  const value = planName.trim().toLowerCase();
  if (value.includes("enterprise")) return "enterprise";
  if (value.includes("premium")) return "premium";
  if (value.includes("pro")) return "pro";
  if (value.includes("growth")) return "growth";
  return "starter";
}

function getPreviewCurrentPlan(): BillingPlanRecord | null {
  const currentTier = planTierFromName(previewSubscriptionState.planName);
  return previewPlans.find((plan) => plan.tier === currentTier) || null;
}

function toPreviewInvoice(invoice: (typeof mockInvoices)[number], index: number): UserInvoiceRecord {
  const monthToken = invoice.date.slice(0, 7).replace("-", "");

  return {
    id: invoice.id,
    invoiceNumber: `INV-${monthToken}-${String(index + 1).padStart(3, "0")}`,
    userId: PREVIEW_USER_ID,
    subscriptionId: previewSubscriptionState.id,
    amount: invoice.amount,
    currency: "USD",
    status: invoice.status,
    description: invoice.description,
    paymentMethod: invoice.paymentMethod || "Visa ending in 4242",
    downloadUrl: invoice.downloadUrl || `/api/preview/invoices/${invoice.id}`,
    issuedAt: invoice.date,
    paidAt: invoice.status === "paid" ? invoice.date : null,
    createdAt: invoice.date,
    updatedAt: invoice.date,
  };
}

function toPreviewWebsiteRecord(
  website: (typeof mockWebsites)[number],
  index: number,
): WebsiteRecord {
  const template = mockTemplates.find((entry) => entry.id === website.templateId);

  return {
    id: website.id,
    userId: PREVIEW_USER_ID,
    ownerEmail: "preview@univert.pro",
    templateId: website.templateId,
    templateName: website.templateName,
    templateStack: template?.stack || "Next.js",
    projectName: website.projectName,
    status: website.status,
    subdomain: website.subdomain,
    customDomain: website.customDomain || null,
    liveUrl: website.liveUrl || null,
    dashboardUrl: website.dashboardUrl || null,
    provisioningJobId: website.provisioningProgress?.websiteId || null,
    provisioningError: null,
    renewalDate: website.renewalDate || null,
    pageViews: website.analytics?.pageViews || 4200 + index * 1900,
    visits: website.analytics?.visitors || 1800 + index * 760,
    avgSessionDuration: website.analytics?.avgSessionDuration || "02:34",
    createdAt: website.createdAt,
    updatedAt: website.createdAt,
  };
}

function toPreviewTemplateRecord(
  template: (typeof mockTemplates)[number],
): TemplateRecord {
  return {
    id: template.id,
    name: template.name,
    slug: template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: template.description,
    category: template.category,
    stack: template.stack,
    previewImageUrl: template.previewImage,
    liveDemoUrl: template.liveDemo,
    startingPrice: template.startingPrice,
    performanceScore: template.performanceScore,
    featured: template.featured,
    isActive: true,
    templateSourcePath: null,
    deploymentProfile: template.stack.toLowerCase(),
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function toPreviewActivityRecord(
  activity: (typeof mockActivities)[number],
): UserActivityRecord {
  return {
    id: activity.id,
    userId: PREVIEW_USER_ID,
    activityType: activity.type,
    message: activity.message,
    createdAt: activity.timestamp,
  };
}

function toPreviewNotificationRecord(
  notification: (typeof mockNotifications)[number],
): UserNotificationRecord {
  return {
    id: notification.id,
    userId: PREVIEW_USER_ID,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

export function getPreviewBillingSnapshot(): BillingSnapshot {
  return {
    subscription: { ...previewSubscriptionState },
    currentPlan: getPreviewCurrentPlan(),
    plans: previewPlans,
    invoices: mockInvoices.map(toPreviewInvoice),
    paymentMethods: previewPaymentMethods,
  };
}

export function updatePreviewBillingSnapshot(input: {
  billingCycle?: "monthly" | "yearly";
  planTier?: BillingPlanTier;
}): BillingSnapshot {
  const currentPlan = getPreviewCurrentPlan();

  if (input.planTier && currentPlan && input.planTier === currentPlan.tier) {
    previewSubscriptionState = {
      ...previewSubscriptionState,
      planName: currentPlan.name,
      updatedAt: NOW,
    };
  }

  if (input.billingCycle) {
    previewSubscriptionState = {
      ...previewSubscriptionState,
      billingCycle: input.billingCycle,
      updatedAt: NOW,
    };
  }

  return getPreviewBillingSnapshot();
}

export function getPreviewPlanRecords(): BillingPlanRecord[] {
  return previewPlans;
}

export function getPreviewWebsiteRecords(): WebsiteRecord[] {
  return mockWebsites.map(toPreviewWebsiteRecord);
}

export function getPreviewTemplateRecords(): TemplateRecord[] {
  return mockTemplates.map(toPreviewTemplateRecord);
}

export function getPreviewActivityRecords(limit = 8): UserActivityRecord[] {
  return mockActivities
    .map(toPreviewActivityRecord)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, limit);
}

export function getPreviewNotificationRecords(limit = 8): UserNotificationRecord[] {
  return mockNotifications
    .map(toPreviewNotificationRecord)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, limit);
}

export function getPreviewDomains() {
  return mockDomains.map((domain) => ({
    id: domain.id,
    domain: domain.customDomain || domain.subdomain,
  }));
}

function getPreviewWebsiteName(websiteId: string | undefined) {
  return mockWebsites.find((website) => website.id === websiteId)?.projectName || null;
}

function buildPreviewDashboardDomain(
  domain: (typeof mockDomains)[number],
): DashboardDomainRecord {
  const domainValue = domain.customDomain || domain.subdomain;
  const routingRecord =
    domain.dnsRecords?.find((record) => record.type === "A" || record.type === "CNAME") || null;
  const ownerTokenRecord = domain.dnsRecords?.find((record) => record.type === "TXT") || null;

  return {
    id: domain.id,
    userId: PREVIEW_USER_ID,
    websiteId: domain.websiteId,
    websiteName: getPreviewWebsiteName(domain.websiteId),
    domain: domainValue,
    isPrimary: Boolean(domain.isPrimary),
    verificationStatus: domain.verificationStatus,
    sslStatus: domain.sslStatus,
    status: domain.verificationStatus === "verified" ? "active" : "verifying",
    domainType: domain.customDomain ? "custom_domain" : "platform_subdomain",
    dnsRecords: domain.dnsRecords || [],
    instructions:
      domain.verificationStatus === "verified"
        ? ["This domain is already connected and secured."]
        : [
            "Point your DNS to the values shown here.",
            "Wait for DNS propagation to finish.",
            "SSL will be issued automatically after verification.",
          ],
    ownerTokenRecord,
    routingRecord,
    dnsVerifiedAt: domain.verificationStatus === "verified" ? NOW : null,
    sslExpiresAt: domain.sslStatus === "active" ? "2027-03-01T00:00:00.000Z" : null,
    lastCheckedAt: NOW,
    errorMessage: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

let previewDashboardDomainsState: DashboardDomainRecord[] = mockDomains.map(buildPreviewDashboardDomain);

export function getPreviewDashboardDomains(): DashboardDomainRecord[] {
  return previewDashboardDomainsState.map((domain) => ({ ...domain }));
}

export function createPreviewDashboardDomain(input: {
  domain: string;
  websiteId?: string | null;
  isPrimary?: boolean;
}): DashboardDomainRecord {
  const createdAt = new Date().toISOString();
  const websiteName = getPreviewWebsiteName(input.websiteId || undefined);
  const normalizedDomain = input.domain.trim().toLowerCase();

  const record: DashboardDomainRecord = {
    id: randomUUID(),
    userId: PREVIEW_USER_ID,
    websiteId: input.websiteId || null,
    websiteName,
    domain: normalizedDomain,
    isPrimary: input.isPrimary === true,
    verificationStatus: "pending",
    sslStatus: "pending",
    status: "verifying",
    domainType: "custom_domain",
    dnsRecords: [
      { type: "TXT", name: "_univert-verify", value: `univert-verify=${normalizedDomain}` },
      { type: "CNAME", name: "www", value: "domains.univert.pro" },
    ],
    instructions: [
      "Add the TXT record to confirm ownership.",
      "Point your www record to the Univert target.",
      "Return here after DNS propagation to verify the domain.",
    ],
    ownerTokenRecord: {
      type: "TXT",
      name: "_univert-verify",
      value: `univert-verify=${normalizedDomain}`,
    },
    routingRecord: {
      type: "CNAME",
      name: "www",
      value: "domains.univert.pro",
    },
    dnsVerifiedAt: null,
    sslExpiresAt: null,
    lastCheckedAt: createdAt,
    errorMessage: null,
    createdAt,
    updatedAt: createdAt,
  };

  previewDashboardDomainsState = [record, ...previewDashboardDomainsState];
  return record;
}

let previewSupportTicketsState: SupportTicketRecord[] = [
  {
    id: "ticket_preview_1",
    ticketNumber: "TKT-PREVIEW-001",
    userId: PREVIEW_USER_ID,
    userEmail: "preview@univert.pro",
    userName: "Preview User",
    subject: "Can I connect my own domain later?",
    description: "I want to launch with a Univert subdomain first and connect my custom domain later.",
    category: "domain",
    priority: "medium",
    status: "open",
    assignedAdminId: null,
    assignedAdminEmail: null,
    responsesCount: 1,
    lastReplyAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function getPreviewSupportTickets(): SupportTicketRecord[] {
  return previewSupportTicketsState
    .map((ticket) => ({ ...ticket }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function createPreviewSupportTicket(input: {
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
}): SupportTicketRecord {
  const createdAt = new Date().toISOString();
  const ticket: SupportTicketRecord = {
    id: randomUUID(),
    ticketNumber: `TKT-PREVIEW-${String(previewSupportTicketsState.length + 1).padStart(3, "0")}`,
    userId: PREVIEW_USER_ID,
    userEmail: "preview@univert.pro",
    userName: "Preview User",
    subject: input.subject,
    description: input.description,
    category: input.category,
    priority: input.priority,
    status: "open",
    assignedAdminId: null,
    assignedAdminEmail: null,
    responsesCount: 0,
    lastReplyAt: null,
    createdAt,
    updatedAt: createdAt,
  };

  previewSupportTicketsState = [ticket, ...previewSupportTicketsState];
  return ticket;
}
