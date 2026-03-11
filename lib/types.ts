// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type TemplateCategory = 
  | "corporate"
  | "agency"
  | "portfolio"
  | "ecommerce"
  | "restaurant"
  | "saas"
  | "marketplace";

export type TemplateStack = "Laravel" | "Next.js" | "WordPress";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  stack: TemplateStack;
  previewImage: string;
  liveDemo: string;
  startingPrice: number;
  featured: boolean;
  features: string[];
  performanceScore: number;
  businessType?: string[];
}

// ============================================================================
// WEBSITE TYPES
// ============================================================================

export type WebsiteStatus = 
  | "pending"
  | "provisioning"
  | "ready"
  | "suspended"
  | "failed";

export type ProvisioningStep = 
  | "payment_received"
  | "template_selected"
  | "server_provisioning"
  | "database_created"
  | "domain_linked"
  | "ssl_enabled"
  | "ready";

export interface ProvisioningProgress {
  websiteId: string;
  currentStep: ProvisioningStep;
  steps: {
    step: ProvisioningStep;
    status: "completed" | "in_progress" | "pending" | "failed";
    timestamp?: string;
    message?: string;
  }[];
}

export interface Website {
  id: string;
  projectName: string;
  templateId: string;
  templateName: string;
  status: WebsiteStatus;
  liveUrl: string;
  dashboardUrl: string;
  subdomain: string;
  customDomain?: string;
  createdAt: string;
  renewalDate: string;
  provisioningProgress?: ProvisioningProgress;
  analytics?: {
    pageViews: number;
    visitors: number;
    avgSessionDuration: string;
  };
}

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export type DomainVerificationStatus = "pending" | "verified" | "failed";
export type SSLStatus = "pending" | "active" | "expired";

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

export interface Domain {
  id: string;
  websiteId: string;
  subdomain: string;
  customDomain?: string;
  verificationStatus: DomainVerificationStatus;
  sslStatus: SSLStatus;
  isPrimary: boolean;
  dnsRecords?: DnsRecord[];
  lastVerifiedAt?: string;
}

// ============================================================================
// PLAN & SUBSCRIPTION TYPES
// ============================================================================

export type PlanTier = "starter" | "growth" | "pro" | "premium" | "enterprise";

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  websiteLimit: number;
  storageLimit: string;
  bandwidthLimit: string;
  supportLevel: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
  currentPeriodEnd: string;
  renewalDate?: string;
  billingCycle: "monthly" | "yearly";
  websitesUsed?: number;
  storageUsed?: string;
  bandwidthUsed?: string;
  trialEndsAt?: string;
}

// ============================================================================
// BILLING TYPES
// ============================================================================

export interface Invoice {
  id: string;
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
  date: string;
  description: string;
  paymentMethod?: string;
  downloadUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt: string;
  subscription?: string;
  websiteCount?: number;
  department?: string;
  lastLoginAt?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
  addedAt: string;
  lastActive?: string;
}

// ============================================================================
// SUPPORT TYPES
// ============================================================================

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  message: string;
  createdAt: string;
  attachments?: string[];
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  assignedTo?: string;
  category?: string;
}

// ============================================================================
// ACTIVITY & NOTIFICATION TYPES
// ============================================================================

export type ActivityType = 
  | "website_created" 
  | "domain_connected" 
  | "payment_received" 
  | "ticket_opened" 
  | "provisioning_complete"
  | "website_updated"
  | "plan_upgraded"
  | "ssl_renewed";

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type NotificationType = "info" | "success" | "warning" | "error" | "feature";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: NotificationType;
  actionUrl?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AdminStats {
  totalUsers: number;
  totalWebsites: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  pendingProvisioning: number;
  failedJobs: number;
  openTickets: number;
  avgResponseTime?: string;
  customerSatisfaction?: number;
  churnRate?: number;
}

// ============================================================================
// INFRASTRUCTURE & ADMIN TYPES
// ============================================================================

export type ServerStatus = "healthy" | "degraded" | "offline" | "maintenance";
export type ProvisioningMethod = "docker" | "traditional" | "managed";
export type DeploymentStrategy = "blue-green" | "canary" | "rolling";
export type BackupFrequency = "hourly" | "daily" | "weekly" | "monthly";

export interface Server {
  id: string;
  name: string;
  region: string;
  provider: "digitalocean" | "linode" | "aws" | "custom";
  ipAddress: string;
  operatingSystem: "ubuntu" | "debian" | "centos";
  stackSupport: ("Laravel" | "Next.js" | "WordPress")[];
  status: ServerStatus;
  metrics: {
    cpuUsage: number;
    ramUsage: number;
    diskUsage: number;
  };
  websitesCount: number;
  lastSyncAt: string;
  capacity: number;
  isProvisioning: boolean;
}

export interface ProvisioningProfile {
  id: string;
  name: string;
  stackType: "Laravel" | "Next.js" | "WordPress";
  deploymentMethod: ProvisioningMethod;
  targetServerId?: string;
  databaseStrategy: "managed" | "server" | "external";
  domainStrategy: "auto" | "manual";
  sslStrategy: "letsencrypt" | "custom";
  backupProfile: string;
  environmentPreset: Record<string, string>;
  status: "active" | "disabled" | "archived";
  createdAt: string;
}

export interface DeploymentRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  type: "provisioning" | "backup" | "restore" | "maintenance" | "export";
  status: "pending" | "running" | "completed" | "failed" | "retrying";
  serverId?: string;
  websiteId?: string;
  progress?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  retryCount?: number;
}

export interface Backup {
  id: string;
  websiteId: string;
  serverId: string;
  size: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  retentionExpiry: string;
  backupType: "full" | "incremental";
}

export interface Alert {
  id: string;
  type: "uptime" | "ssl" | "domain" | "provisioning" | "queue" | "cpu" | "disk";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  createdAt: string;
  resolvedAt?: string;
  websiteId?: string;
  serverId?: string;
}

export interface UsageMetrics {
  currentPeriod: {
    startDate: string;
    endDate: string;
  };
  bandwidth: {
    used: number;
    limit: number;
    unit: string;
    trend: string;
  };
  storage: {
    used: number;
    limit: number;
    unit: string;
    trend: string;
  };
  pageViews: {
    total: number;
    trend: string;
    byWebsite: {
      websiteId: string;
      name: string;
      views: number;
    }[];
  };
  visitors: {
    unique: number;
    returning: number;
    trend: string;
  };
  formSubmissions: {
    used: number;
    limit: number;
    trend: string;
  };
  apiCalls: {
    used: number;
    limit: number;
    trend: string;
  };
}

export interface TrafficData {
  weekly: {
    date: string;
    views: number;
    visits: number;
    conversions: number;
  }[];
  monthly: {
    month: string;
    views: number;
    visits: number;
    revenue: number;
  }[];
  topPages: {
    path: string;
    views: number;
    avgTime: string;
  }[];
  topReferrers: {
    source: string;
    visits: number;
    percentage: number;
  }[];
}
