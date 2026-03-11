import { getUserWebsites } from "@/lib/db/websites";
import { getUserSubscription } from "@/lib/db/subscriptions";
import { getCurrentUserProfile } from "@/lib/db/users";
import { getUserInvoices } from "@/lib/db/invoices";
import { getUserTickets } from "@/lib/db/support";
import { getWebsiteDomains } from "@/lib/db/domains";

/**
 * Server-side data loaders for dashboard pages
 * These functions fetch real data from MySQL-backed services for authenticated users
 */

export async function getDashboardData(userId: string) {
  const [websites, subscription, profile] = await Promise.all([
    getUserWebsites(userId),
    getUserSubscription(userId),
    getCurrentUserProfile(),
  ]);

  return {
    websites,
    subscription,
    profile,
  };
}

export async function getBillingData(userId: string) {
  const [invoices, subscription] = await Promise.all([
    getUserInvoices(userId),
    getUserSubscription(userId),
  ]);

  return {
    invoices,
    subscription,
  };
}

export async function getSupportData(userId: string) {
  return {
    tickets: await getUserTickets(userId),
  };
}

export async function getWebsiteDetailsData(userId: string, websiteId: string) {
  const [websites, domains] = await Promise.all([
    getUserWebsites(userId),
    getWebsiteDomains(websiteId),
  ]);

  const website = websites.find(w => w.id === websiteId);
  
  return {
    website,
    domains,
  };
}
