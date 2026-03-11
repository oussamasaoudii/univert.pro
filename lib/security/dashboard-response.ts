import type { AdminDomainRecord } from "@/lib/mysql/domains";
import type {
  UserActivityRecord,
  UserNotificationRecord,
  UserSubscriptionRecord,
  WebsiteRecord,
} from "@/lib/mysql/platform";

export function sanitizeDashboardWebsiteSummary(website: WebsiteRecord) {
  return {
    id: website.id,
    templateId: website.templateId,
    templateName: website.templateName,
    templateStack: website.templateStack,
    projectName: website.projectName,
    status: website.status,
    subdomain: website.subdomain,
    customDomain: website.customDomain,
    liveUrl: website.liveUrl,
    dashboardUrl: website.dashboardUrl,
    renewalDate: website.renewalDate,
    createdAt: website.createdAt,
  };
}

export function sanitizeDashboardOverviewWebsite(website: WebsiteRecord) {
  return {
    id: website.id,
    projectName: website.projectName,
    templateName: website.templateName,
    status: website.status,
    customDomain: website.customDomain,
    liveUrl: website.liveUrl,
    pageViews: website.pageViews,
    visits: website.visits,
  };
}

export function sanitizeDashboardDomainSummary(domain: AdminDomainRecord) {
  return {
    id: domain.id,
    domain: domain.domain,
  };
}

export function sanitizeDashboardSubscriptionSummary(
  subscription: UserSubscriptionRecord,
) {
  return {
    planName: subscription.planName,
    renewalDate: subscription.renewalDate,
  };
}

export function sanitizeDashboardActivitySummary(activity: UserActivityRecord) {
  return {
    id: activity.id,
    activityType: activity.activityType,
    message: activity.message,
    createdAt: activity.createdAt,
  };
}

export function sanitizeDashboardNotificationSummary(
  notification: UserNotificationRecord,
) {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}
