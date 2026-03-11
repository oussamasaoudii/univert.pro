// Comprehensive Admin Mock Data for Enterprise Dashboard

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: "starter" | "growth" | "pro" | "premium" | "enterprise";
  websitesCount: number;
  joinedAt: string;
  status: "active" | "suspended" | "churned";
  mrr: number;
  lastActive: string;
}

export interface AdminWebsite {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  websiteName: string;
  templateId: string;
  templateName: string;
  stack: "Next.js" | "Laravel" | "WordPress";
  status: "ready" | "provisioning" | "failed" | "suspended" | "pending";
  subdomain: string;
  customDomain?: string;
  createdAt: string;
  renewalDate: string;
  mrr: number;
}

export interface ProvisioningJob {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  templateName: string;
  websiteName: string;
  currentStep: string;
  startedAt: string;
  duration: string;
  status: "queued" | "in_progress" | "completed" | "failed" | "retrying";
  progress: number;
  steps: {
    name: string;
    status: "completed" | "in_progress" | "pending" | "failed";
    timestamp?: string;
  }[];
  errorMessage?: string;
  logs?: string[];
}

export interface AdminDomain {
  id: string;
  domain: string;
  websiteId: string;
  websiteName: string;
  customerId: string;
  customerName: string;
  sslStatus: "active" | "pending" | "expired" | "failed";
  verificationStatus: "verified" | "pending" | "failed";
  dnsHealth: "healthy" | "warning" | "critical";
  createdAt: string;
  expiresAt: string;
}

export interface AdminTicket {
  id: string;
  subject: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  category: "billing" | "technical" | "general" | "feature_request";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  lastReply: string;
  replyCount: number;
}

export interface AdminInvoice {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
  date: string;
  plan: string;
}

export interface RevenueData {
  month: string;
  mrr: number;
  newMrr: number;
  churnedMrr: number;
  expansionMrr: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
  revenue: number;
  percentage: number;
}

// Admin Users Data
export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Sarah Chen", email: "sarah.chen@techcorp.io", plan: "enterprise", websitesCount: 45, joinedAt: "2023-03-15", status: "active", mrr: 2499, lastActive: "2024-11-22T14:30:00Z" },
  { id: "u2", name: "Marcus Johnson", email: "marcus@designstudio.com", plan: "pro", websitesCount: 8, joinedAt: "2023-06-22", status: "active", mrr: 99, lastActive: "2024-11-22T10:15:00Z" },
  { id: "u3", name: "Emily Rodriguez", email: "emily.r@startup.co", plan: "growth", websitesCount: 3, joinedAt: "2023-09-10", status: "active", mrr: 59, lastActive: "2024-11-21T18:45:00Z" },
  { id: "u4", name: "David Kim", email: "david.kim@agency.net", plan: "premium", websitesCount: 18, joinedAt: "2023-04-28", status: "active", mrr: 199, lastActive: "2024-11-22T09:00:00Z" },
  { id: "u5", name: "Rachel Thompson", email: "rachel@ecommerce.shop", plan: "pro", websitesCount: 6, joinedAt: "2023-08-14", status: "active", mrr: 99, lastActive: "2024-11-20T16:30:00Z" },
  { id: "u6", name: "James Wilson", email: "james.w@consulting.biz", plan: "growth", websitesCount: 2, joinedAt: "2023-11-05", status: "suspended", mrr: 0, lastActive: "2024-10-15T12:00:00Z" },
  { id: "u7", name: "Sophia Martinez", email: "sophia@creative.agency", plan: "starter", websitesCount: 1, joinedAt: "2024-01-20", status: "active", mrr: 29, lastActive: "2024-11-22T11:20:00Z" },
  { id: "u8", name: "Michael Brown", email: "m.brown@realestate.com", plan: "premium", websitesCount: 22, joinedAt: "2023-02-08", status: "active", mrr: 199, lastActive: "2024-11-21T14:00:00Z" },
  { id: "u9", name: "Lisa Anderson", email: "lisa@healthcare.org", plan: "enterprise", websitesCount: 67, joinedAt: "2022-12-01", status: "active", mrr: 4999, lastActive: "2024-11-22T08:30:00Z" },
  { id: "u10", name: "Robert Taylor", email: "rtaylor@law.firm", plan: "growth", websitesCount: 3, joinedAt: "2024-02-14", status: "churned", mrr: 0, lastActive: "2024-09-20T10:00:00Z" },
  { id: "u11", name: "Jennifer Davis", email: "jen.davis@media.co", plan: "pro", websitesCount: 9, joinedAt: "2023-07-30", status: "active", mrr: 99, lastActive: "2024-11-22T13:45:00Z" },
  { id: "u12", name: "Chris Lee", email: "chris@fintech.io", plan: "premium", websitesCount: 15, joinedAt: "2023-05-19", status: "active", mrr: 199, lastActive: "2024-11-21T17:30:00Z" },
];

// Admin Websites Data
export const adminWebsites: AdminWebsite[] = [
  { id: "w1", customerId: "u1", customerName: "Sarah Chen", customerEmail: "sarah.chen@techcorp.io", websiteName: "TechCorp Global", templateId: "1", templateName: "Luxe Corporate", stack: "Next.js", status: "ready", subdomain: "techcorp", customDomain: "techcorp.io", createdAt: "2023-03-20", renewalDate: "2025-03-20", mrr: 89 },
  { id: "w2", customerId: "u2", customerName: "Marcus Johnson", customerEmail: "marcus@designstudio.com", websiteName: "Design Studio Pro", templateId: "2", templateName: "Agency Pro", stack: "Next.js", status: "ready", subdomain: "designstudio", customDomain: "designstudio.com", createdAt: "2023-06-25", renewalDate: "2025-06-25", mrr: 69 },
  { id: "w3", customerId: "u3", customerName: "Emily Rodriguez", customerEmail: "emily.r@startup.co", websiteName: "StartupLaunch", templateId: "6", templateName: "SaaS Launch", stack: "Next.js", status: "provisioning", subdomain: "startuplaunch", createdAt: "2024-11-20", renewalDate: "2025-11-20", mrr: 69 },
  { id: "w4", customerId: "u4", customerName: "David Kim", customerEmail: "david.kim@agency.net", websiteName: "Kim Agency", templateId: "2", templateName: "Agency Pro", stack: "Next.js", status: "ready", subdomain: "kimagency", customDomain: "kimagency.net", createdAt: "2023-05-01", renewalDate: "2025-05-01", mrr: 69 },
  { id: "w5", customerId: "u5", customerName: "Rachel Thompson", customerEmail: "rachel@ecommerce.shop", websiteName: "Fashion Hub", templateId: "4", templateName: "Commerce Elite", stack: "Laravel", status: "ready", subdomain: "fashionhub", customDomain: "fashionhub.store", createdAt: "2023-08-20", renewalDate: "2025-08-20", mrr: 99 },
  { id: "w6", customerId: "u1", customerName: "Sarah Chen", customerEmail: "sarah.chen@techcorp.io", websiteName: "TechCorp Blog", templateId: "3", templateName: "Starter Portfolio", stack: "Next.js", status: "ready", subdomain: "techcorp-blog", createdAt: "2023-04-15", renewalDate: "2025-04-15", mrr: 29 },
  { id: "w7", customerId: "u8", customerName: "Michael Brown", customerEmail: "m.brown@realestate.com", websiteName: "Brown Realty", templateId: "1", templateName: "Luxe Corporate", stack: "Next.js", status: "failed", subdomain: "brownrealty", createdAt: "2024-11-18", renewalDate: "2025-11-18", mrr: 89 },
  { id: "w8", customerId: "u9", customerName: "Lisa Anderson", customerEmail: "lisa@healthcare.org", websiteName: "HealthCare Plus", templateId: "8", templateName: "Corporate Edge", stack: "Next.js", status: "ready", subdomain: "healthcareplus", customDomain: "healthcareplus.org", createdAt: "2023-01-10", renewalDate: "2025-01-10", mrr: 89 },
  { id: "w9", customerId: "u11", customerName: "Jennifer Davis", customerEmail: "jen.davis@media.co", websiteName: "MediaCo News", templateId: "1", templateName: "Luxe Corporate", stack: "Next.js", status: "suspended", subdomain: "mediaco", createdAt: "2023-08-01", renewalDate: "2024-08-01", mrr: 0 },
  { id: "w10", customerId: "u12", customerName: "Chris Lee", customerEmail: "chris@fintech.io", websiteName: "FinTech Solutions", templateId: "6", templateName: "SaaS Launch", stack: "Next.js", status: "ready", subdomain: "fintechsolutions", customDomain: "fintechsolutions.io", createdAt: "2023-05-25", renewalDate: "2025-05-25", mrr: 69 },
];

// Provisioning Jobs Data
export const provisioningJobs: ProvisioningJob[] = [
  {
    id: "pj1",
    customerId: "u3",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@startup.co",
    templateName: "SaaS Launch",
    websiteName: "StartupLaunch",
    currentStep: "Installing Dependencies",
    startedAt: "2024-11-22T10:30:00Z",
    duration: "4m 23s",
    status: "in_progress",
    progress: 45,
    steps: [
      { name: "Payment Verified", status: "completed", timestamp: "2024-11-22T10:30:00Z" },
      { name: "Server Allocated", status: "completed", timestamp: "2024-11-22T10:31:15Z" },
      { name: "Template Cloned", status: "completed", timestamp: "2024-11-22T10:32:30Z" },
      { name: "Installing Dependencies", status: "in_progress" },
      { name: "Database Setup", status: "pending" },
      { name: "SSL Certificate", status: "pending" },
      { name: "Final Checks", status: "pending" },
    ],
  },
  {
    id: "pj2",
    customerId: "u8",
    customerName: "Michael Brown",
    customerEmail: "m.brown@realestate.com",
    templateName: "Luxe Corporate",
    websiteName: "Brown Realty",
    currentStep: "Database Setup",
    startedAt: "2024-11-22T09:15:00Z",
    duration: "1h 19m",
    status: "failed",
    progress: 65,
    steps: [
      { name: "Payment Verified", status: "completed", timestamp: "2024-11-22T09:15:00Z" },
      { name: "Server Allocated", status: "completed", timestamp: "2024-11-22T09:16:30Z" },
      { name: "Template Cloned", status: "completed", timestamp: "2024-11-22T09:18:00Z" },
      { name: "Installing Dependencies", status: "completed", timestamp: "2024-11-22T09:25:00Z" },
      { name: "Database Setup", status: "failed", timestamp: "2024-11-22T10:34:00Z" },
      { name: "SSL Certificate", status: "pending" },
      { name: "Final Checks", status: "pending" },
    ],
    errorMessage: "Database connection timeout. Max retries exceeded.",
    logs: [
      "[10:30:15] Attempting database connection...",
      "[10:31:00] Connection timeout (30s)",
      "[10:31:05] Retry 1/3...",
      "[10:32:00] Connection timeout (30s)",
      "[10:32:05] Retry 2/3...",
      "[10:33:00] Connection timeout (30s)",
      "[10:33:05] Retry 3/3...",
      "[10:34:00] Max retries exceeded. Job failed.",
    ],
  },
  {
    id: "pj3",
    customerId: "u7",
    customerName: "Sophia Martinez",
    customerEmail: "sophia@creative.agency",
    templateName: "Starter Portfolio",
    websiteName: "Creative Works",
    currentStep: "Queued",
    startedAt: "2024-11-22T11:00:00Z",
    duration: "0m 0s",
    status: "queued",
    progress: 0,
    steps: [
      { name: "Payment Verified", status: "pending" },
      { name: "Server Allocated", status: "pending" },
      { name: "Template Cloned", status: "pending" },
      { name: "Installing Dependencies", status: "pending" },
      { name: "Database Setup", status: "pending" },
      { name: "SSL Certificate", status: "pending" },
      { name: "Final Checks", status: "pending" },
    ],
  },
  {
    id: "pj4",
    customerId: "u4",
    customerName: "David Kim",
    customerEmail: "david.kim@agency.net",
    templateName: "Agency Pro",
    websiteName: "Kim Portfolio",
    currentStep: "Final Checks",
    startedAt: "2024-11-22T08:45:00Z",
    duration: "6m 12s",
    status: "in_progress",
    progress: 90,
    steps: [
      { name: "Payment Verified", status: "completed", timestamp: "2024-11-22T08:45:00Z" },
      { name: "Server Allocated", status: "completed", timestamp: "2024-11-22T08:46:00Z" },
      { name: "Template Cloned", status: "completed", timestamp: "2024-11-22T08:47:30Z" },
      { name: "Installing Dependencies", status: "completed", timestamp: "2024-11-22T08:49:00Z" },
      { name: "Database Setup", status: "completed", timestamp: "2024-11-22T08:50:30Z" },
      { name: "SSL Certificate", status: "completed", timestamp: "2024-11-22T08:51:00Z" },
      { name: "Final Checks", status: "in_progress" },
    ],
  },
  {
    id: "pj5",
    customerId: "u2",
    customerName: "Marcus Johnson",
    customerEmail: "marcus@designstudio.com",
    templateName: "Agency Pro",
    websiteName: "Design Showcase",
    currentStep: "Completed",
    startedAt: "2024-11-22T07:30:00Z",
    duration: "5m 45s",
    status: "completed",
    progress: 100,
    steps: [
      { name: "Payment Verified", status: "completed", timestamp: "2024-11-22T07:30:00Z" },
      { name: "Server Allocated", status: "completed", timestamp: "2024-11-22T07:31:00Z" },
      { name: "Template Cloned", status: "completed", timestamp: "2024-11-22T07:32:15Z" },
      { name: "Installing Dependencies", status: "completed", timestamp: "2024-11-22T07:34:00Z" },
      { name: "Database Setup", status: "completed", timestamp: "2024-11-22T07:35:00Z" },
      { name: "SSL Certificate", status: "completed", timestamp: "2024-11-22T07:35:30Z" },
      { name: "Final Checks", status: "completed", timestamp: "2024-11-22T07:35:45Z" },
    ],
  },
];

// Admin Domains Data
export const adminDomains: AdminDomain[] = [
  { id: "d1", domain: "techcorp.io", websiteId: "w1", websiteName: "TechCorp Global", customerId: "u1", customerName: "Sarah Chen", sslStatus: "active", verificationStatus: "verified", dnsHealth: "healthy", createdAt: "2023-03-21", expiresAt: "2025-03-21" },
  { id: "d2", domain: "designstudio.com", websiteId: "w2", websiteName: "Design Studio Pro", customerId: "u2", customerName: "Marcus Johnson", sslStatus: "active", verificationStatus: "verified", dnsHealth: "healthy", createdAt: "2023-06-26", expiresAt: "2025-06-26" },
  { id: "d3", domain: "kimagency.net", websiteId: "w4", websiteName: "Kim Agency", customerId: "u4", customerName: "David Kim", sslStatus: "pending", verificationStatus: "pending", dnsHealth: "warning", createdAt: "2024-11-15", expiresAt: "2025-11-15" },
  { id: "d4", domain: "fashionhub.store", websiteId: "w5", websiteName: "Fashion Hub", customerId: "u5", customerName: "Rachel Thompson", sslStatus: "active", verificationStatus: "verified", dnsHealth: "healthy", createdAt: "2023-08-21", expiresAt: "2025-08-21" },
  { id: "d5", domain: "healthcareplus.org", websiteId: "w8", websiteName: "HealthCare Plus", customerId: "u9", customerName: "Lisa Anderson", sslStatus: "active", verificationStatus: "verified", dnsHealth: "healthy", createdAt: "2023-01-11", expiresAt: "2025-01-11" },
  { id: "d6", domain: "fintechsolutions.io", websiteId: "w10", websiteName: "FinTech Solutions", customerId: "u12", customerName: "Chris Lee", sslStatus: "expired", verificationStatus: "verified", dnsHealth: "critical", createdAt: "2023-05-26", expiresAt: "2024-11-01" },
  { id: "d7", domain: "newstartup.co", websiteId: "w3", websiteName: "StartupLaunch", customerId: "u3", customerName: "Emily Rodriguez", sslStatus: "pending", verificationStatus: "pending", dnsHealth: "warning", createdAt: "2024-11-20", expiresAt: "2025-11-20" },
];

// Admin Tickets Data
export const adminTickets: AdminTicket[] = [
  { id: "t1", subject: "Website loading slowly", customerId: "u2", customerName: "Marcus Johnson", customerEmail: "marcus@designstudio.com", priority: "high", status: "open", category: "technical", createdAt: "2024-11-22T08:00:00Z", updatedAt: "2024-11-22T08:00:00Z", lastReply: "2024-11-22T08:00:00Z", replyCount: 0 },
  { id: "t2", subject: "Billing question about upgrade", customerId: "u7", customerName: "Sophia Martinez", customerEmail: "sophia@creative.agency", priority: "medium", status: "in_progress", category: "billing", assignedTo: "Support Agent 1", createdAt: "2024-11-21T14:30:00Z", updatedAt: "2024-11-22T09:15:00Z", lastReply: "2024-11-22T09:15:00Z", replyCount: 2 },
  { id: "t3", subject: "Custom domain not connecting", customerId: "u4", customerName: "David Kim", customerEmail: "david.kim@agency.net", priority: "urgent", status: "open", category: "technical", createdAt: "2024-11-22T10:45:00Z", updatedAt: "2024-11-22T10:45:00Z", lastReply: "2024-11-22T10:45:00Z", replyCount: 0 },
  { id: "t4", subject: "Request for custom feature", customerId: "u9", customerName: "Lisa Anderson", customerEmail: "lisa@healthcare.org", priority: "low", status: "waiting", category: "feature_request", assignedTo: "Product Team", createdAt: "2024-11-19T11:00:00Z", updatedAt: "2024-11-21T16:00:00Z", lastReply: "2024-11-21T16:00:00Z", replyCount: 4 },
  { id: "t5", subject: "SSL certificate error", customerId: "u12", customerName: "Chris Lee", customerEmail: "chris@fintech.io", priority: "high", status: "in_progress", category: "technical", assignedTo: "Support Agent 2", createdAt: "2024-11-20T09:30:00Z", updatedAt: "2024-11-22T11:00:00Z", lastReply: "2024-11-22T11:00:00Z", replyCount: 5 },
  { id: "t6", subject: "Need help with template setup", customerId: "u3", customerName: "Emily Rodriguez", customerEmail: "emily.r@startup.co", priority: "medium", status: "resolved", category: "general", assignedTo: "Support Agent 1", createdAt: "2024-11-18T13:00:00Z", updatedAt: "2024-11-20T10:00:00Z", lastReply: "2024-11-20T10:00:00Z", replyCount: 6 },
  { id: "t7", subject: "Payment failed for renewal", customerId: "u5", customerName: "Rachel Thompson", customerEmail: "rachel@ecommerce.shop", priority: "urgent", status: "open", category: "billing", createdAt: "2024-11-22T07:00:00Z", updatedAt: "2024-11-22T07:00:00Z", lastReply: "2024-11-22T07:00:00Z", replyCount: 0 },
  { id: "t8", subject: "Account access issue", customerId: "u6", customerName: "James Wilson", customerEmail: "james.w@consulting.biz", priority: "high", status: "closed", category: "general", assignedTo: "Support Agent 2", createdAt: "2024-11-15T16:00:00Z", updatedAt: "2024-11-17T09:00:00Z", lastReply: "2024-11-17T09:00:00Z", replyCount: 3 },
];

// Admin Invoices Data
export const adminInvoices: AdminInvoice[] = [
  { id: "inv1", customerId: "u1", customerName: "Sarah Chen", customerEmail: "sarah.chen@techcorp.io", amount: 2499, status: "paid", date: "2024-11-01", plan: "Enterprise" },
  { id: "inv2", customerId: "u2", customerName: "Marcus Johnson", customerEmail: "marcus@designstudio.com", amount: 99, status: "paid", date: "2024-11-01", plan: "Pro" },
  { id: "inv3", customerId: "u3", customerName: "Emily Rodriguez", customerEmail: "emily.r@startup.co", amount: 59, status: "paid", date: "2024-11-01", plan: "Growth" },
  { id: "inv4", customerId: "u4", customerName: "David Kim", customerEmail: "david.kim@agency.net", amount: 199, status: "paid", date: "2024-11-01", plan: "Premium" },
  { id: "inv5", customerId: "u5", customerName: "Rachel Thompson", customerEmail: "rachel@ecommerce.shop", amount: 99, status: "failed", date: "2024-11-22", plan: "Pro" },
  { id: "inv6", customerId: "u7", customerName: "Sophia Martinez", customerEmail: "sophia@creative.agency", amount: 29, status: "paid", date: "2024-11-01", plan: "Starter" },
  { id: "inv7", customerId: "u8", customerName: "Michael Brown", customerEmail: "m.brown@realestate.com", amount: 199, status: "paid", date: "2024-11-01", plan: "Premium" },
  { id: "inv8", customerId: "u9", customerName: "Lisa Anderson", customerEmail: "lisa@healthcare.org", amount: 4999, status: "paid", date: "2024-11-01", plan: "Enterprise" },
  { id: "inv9", customerId: "u11", customerName: "Jennifer Davis", customerEmail: "jen.davis@media.co", amount: 99, status: "pending", date: "2024-11-20", plan: "Pro" },
  { id: "inv10", customerId: "u12", customerName: "Chris Lee", customerEmail: "chris@fintech.io", amount: 199, status: "paid", date: "2024-11-01", plan: "Premium" },
];

// Revenue Data (Last 12 months)
export const revenueData: RevenueData[] = [
  { month: "Dec 2023", mrr: 45200, newMrr: 5200, churnedMrr: 1800, expansionMrr: 1200 },
  { month: "Jan 2024", mrr: 48600, newMrr: 4800, churnedMrr: 1400, expansionMrr: 800 },
  { month: "Feb 2024", mrr: 52100, newMrr: 5100, churnedMrr: 1600, expansionMrr: 1000 },
  { month: "Mar 2024", mrr: 56800, newMrr: 6200, churnedMrr: 1500, expansionMrr: 1200 },
  { month: "Apr 2024", mrr: 61200, newMrr: 5800, churnedMrr: 1400, expansionMrr: 900 },
  { month: "May 2024", mrr: 65400, newMrr: 5600, churnedMrr: 1400, expansionMrr: 1100 },
  { month: "Jun 2024", mrr: 69800, newMrr: 5900, churnedMrr: 1500, expansionMrr: 1300 },
  { month: "Jul 2024", mrr: 74200, newMrr: 6100, churnedMrr: 1700, expansionMrr: 1400 },
  { month: "Aug 2024", mrr: 78900, newMrr: 6400, churnedMrr: 1700, expansionMrr: 1200 },
  { month: "Sep 2024", mrr: 83100, newMrr: 5800, churnedMrr: 1600, expansionMrr: 1100 },
  { month: "Oct 2024", mrr: 87400, newMrr: 5900, churnedMrr: 1600, expansionMrr: 1300 },
  { month: "Nov 2024", mrr: 89420, newMrr: 4200, churnedMrr: 2180, expansionMrr: 980 },
];

// Plan Distribution Data
export const planDistribution: PlanDistribution[] = [
  { plan: "Starter", count: 312, revenue: 9048, percentage: 28 },
  { plan: "Growth", count: 245, revenue: 14455, percentage: 22 },
  { plan: "Pro", count: 198, revenue: 19602, percentage: 18 },
  { plan: "Premium", count: 156, revenue: 31044, percentage: 14 },
  { plan: "Enterprise", count: 89, revenue: 15271, percentage: 8 },
];

// New Users Data (Last 12 months)
export const newUsersData = [
  { month: "Dec 2023", count: 89 },
  { month: "Jan 2024", count: 102 },
  { month: "Feb 2024", count: 95 },
  { month: "Mar 2024", count: 118 },
  { month: "Apr 2024", count: 134 },
  { month: "May 2024", count: 127 },
  { month: "Jun 2024", count: 142 },
  { month: "Jul 2024", count: 156 },
  { month: "Aug 2024", count: 163 },
  { month: "Sep 2024", count: 148 },
  { month: "Oct 2024", count: 139 },
  { month: "Nov 2024", count: 112 },
];

// Template Usage Data
export const templateUsageData = [
  { name: "Luxe Corporate", usage: 423, percentage: 25 },
  { name: "Agency Pro", usage: 356, percentage: 21 },
  { name: "SaaS Launch", usage: 298, percentage: 18 },
  { name: "Commerce Elite", usage: 245, percentage: 15 },
  { name: "Starter Portfolio", usage: 189, percentage: 11 },
  { name: "Corporate Edge", usage: 112, percentage: 7 },
  { name: "Others", usage: 67, percentage: 4 },
];

// Failed Deployments Data
export const failedDeployments = [
  { id: "fd1", websiteName: "Brown Realty", customerName: "Michael Brown", template: "Luxe Corporate", error: "Database connection timeout", timestamp: "2024-11-22T10:34:00Z", retryCount: 3 },
  { id: "fd2", websiteName: "MediaCo News", customerName: "Jennifer Davis", template: "Luxe Corporate", error: "Out of memory during build", timestamp: "2024-11-21T15:22:00Z", retryCount: 2 },
  { id: "fd3", websiteName: "Test Project", customerName: "James Wilson", template: "Agency Pro", error: "Invalid configuration file", timestamp: "2024-11-20T09:15:00Z", retryCount: 1 },
];

// Admin KPI Summary
export const adminKPIs = {
  totalUsers: 1247,
  activeUsers: 1089,
  totalWebsites: 3892,
  activeWebsites: 3654,
  websitesInProvisioning: 23,
  failedJobs: 3,
  monthlyRecurringRevenue: 89420,
  churnRate: 2.4,
  averageRevenuePerUser: 71.67,
  netPromoterScore: 72,
  ticketsOpen: 4,
  ticketsInProgress: 2,
  avgTicketResolutionTime: "4.2 hours",
};

// Support Agents
export const supportAgents = [
  { id: "sa1", name: "Support Agent 1", email: "agent1@ovmon.com", ticketsAssigned: 12, avgResolutionTime: "3.8 hours" },
  { id: "sa2", name: "Support Agent 2", email: "agent2@ovmon.com", ticketsAssigned: 15, avgResolutionTime: "4.5 hours" },
  { id: "sa3", name: "Product Team", email: "product@ovmon.com", ticketsAssigned: 5, avgResolutionTime: "24 hours" },
];
