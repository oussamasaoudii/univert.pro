import { randomUUID } from "node:crypto";
import { getAapanelConfig } from "@/lib/aapanel/config";
import { createProvisioningJob } from "@/lib/db/provisioning";
import { enqueueProvisioningJob, processNextJob } from "@/lib/queue/queue-manager";
import { getBillingPlanByTier, type BillingPlanTier } from "@/lib/mysql/billing";
import {
  createUserActivity,
  createUserNotification,
  createWebsite as createPlatformWebsite,
  getTemplateById,
  getUserSubscription,
  listUserWebsites,
  updateWebsiteDeployment,
  type TemplateRecord,
} from "@/lib/mysql/platform";
import { createProvisioningQueueJob } from "@/lib/mysql/operations";
import type { ProvisioningConfig, ProvisioningContext } from "@/lib/provisioning/types";

type LaunchUser = {
  id: string;
  email: string;
  fullName?: string | null;
  role?: "user" | "admin";
};

export type LaunchWebsiteInput = {
  templateId: string;
  name: string;
  subdomain: string;
  customDomain?: string;
};

export type LaunchWorkflowResult = {
  success: boolean;
  websiteId?: string;
  jobId?: string;
  error?: string;
};

type LaunchWorkflowDeps = {
  createPlatformWebsite: typeof createPlatformWebsite;
  createProvisioningJob: typeof createProvisioningJob;
  createProvisioningQueueJob: typeof createProvisioningQueueJob;
  createUserActivity: typeof createUserActivity;
  createUserNotification: typeof createUserNotification;
  enqueueProvisioningJob: typeof enqueueProvisioningJob;
  getAapanelConfig: typeof getAapanelConfig;
  getBillingPlanByTier: typeof getBillingPlanByTier;
  getTemplateById: typeof getTemplateById;
  getUserSubscription: typeof getUserSubscription;
  kickProvisioningWorker: () => void;
  listUserWebsites: typeof listUserWebsites;
  updateWebsiteDeployment: typeof updateWebsiteDeployment;
};

const launchWorkflowDeps: LaunchWorkflowDeps = {
  createPlatformWebsite,
  createProvisioningJob,
  createProvisioningQueueJob,
  createUserActivity,
  createUserNotification,
  enqueueProvisioningJob,
  getAapanelConfig,
  getBillingPlanByTier,
  getTemplateById,
  getUserSubscription,
  kickProvisioningWorker,
  listUserWebsites,
  updateWebsiteDeployment,
};

export async function launchWebsiteForUser(
  user: LaunchUser,
  input: LaunchWebsiteInput,
  deps: LaunchWorkflowDeps = launchWorkflowDeps,
): Promise<LaunchWorkflowResult> {
  const projectName = input.name.trim();
  const subdomain = normalizeSubdomain(input.subdomain);
  const customDomain = input.customDomain?.trim().toLowerCase() || undefined;

  if (!projectName || !subdomain) {
    return {
      success: false,
      error: "Project name and subdomain are required",
    };
  }

  const template = await deps.getTemplateById(input.templateId, { includeInactive: false });
  if (!template) {
    return {
      success: false,
      error: "Selected template was not found",
    };
  }

  const [subscription, existingWebsites] = await Promise.all([
    deps.getUserSubscription(user.id),
    deps.listUserWebsites(user.id),
  ]);
  if (subscription.status === "cancelled" || subscription.status === "past_due") {
    return {
      success: false,
      error: "Your subscription is not active enough to launch a website",
    };
  }

  const activeWebsiteCount = existingWebsites.filter((website) => website.status !== "failed").length;
  const plan = await deps.getBillingPlanByTier(normalizePlanTier(subscription.planName));
  if (plan && activeWebsiteCount >= plan.websiteLimit) {
    return {
      success: false,
      error: "plan_limit_reached",
    };
  }

  const conflictingWebsite = existingWebsites.find((website) => {
    const sameSubdomain = website.subdomain.trim().toLowerCase() === subdomain;
    const sameCustomDomain =
      Boolean(customDomain) &&
      website.customDomain?.trim().toLowerCase() === customDomain;
    return sameSubdomain || sameCustomDomain;
  });

  if (conflictingWebsite) {
    return {
      success: false,
      error: "website_already_exists",
    };
  }

  const env = deps.getAapanelConfig();
  const websiteId = randomUUID();
  const defaultDomain = `${subdomain}.${env.platformSubdomainSuffix}`;
  const fqdn = customDomain || defaultDomain;
  const liveUrl = `${env.defaultProtocol}://${fqdn}`;

  try {
    await deps.createPlatformWebsite({
      id: websiteId,
      userId: user.id,
      templateId: template.id,
      projectName,
      subdomain,
      customDomain: customDomain || null,
      status: "pending",
      liveUrl,
      dashboardUrl: `${liveUrl}/admin`,
      renewalDate: subscription.renewalDate,
    });

    const job = await deps.createProvisioningJob(websiteId, user.id);
    if (!job) {
      throw new Error("Failed to create provisioning job");
    }

    const config = buildProvisioningConfig(template);
    const context: ProvisioningContext = {
      jobId: job.id,
      websiteId,
      userId: user.id,
      templateId: template.id,
      subdomain,
      customDomain,
      metadata: {
        projectName,
        ownerEmail: user.email,
        templateName: template.name,
        templateSlug: template.slug,
        templateSourcePath: template.templateSourcePath,
        deploymentProfile: template.deploymentProfile,
      },
    };

    await deps.updateWebsiteDeployment(websiteId, {
      provisioningJobId: job.id,
      provisioningError: null,
    });

    await deps.createProvisioningQueueJob({
      id: job.id,
      websiteName: projectName,
      serverName: new URL(env.baseUrl).host,
      status: "pending",
      progress: 0,
      step: "Queued for provisioning",
      etaMinutes: 5,
      retries: 0,
    });

    const queueId = await deps.enqueueProvisioningJob(job.id, context, config);
    if (!queueId) {
      throw new Error("Failed to enqueue provisioning job");
    }

    await deps.createUserActivity(user.id, {
      activityType: "provisioning_queued",
      message: `${projectName} has been queued for provisioning.`,
    });
    await deps.createUserNotification(user.id, {
      title: "Website launch started",
      message: `${projectName} is now being provisioned on your managed infrastructure.`,
    });

    deps.kickProvisioningWorker();

    return {
      success: true,
      websiteId,
      jobId: job.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to launch website";
    await deps.updateWebsiteDeployment(websiteId, {
      status: "failed",
      provisioningError: message,
    }).catch(() => {});
    return {
      success: false,
      error: message,
    };
  }
}

function normalizePlanTier(value: string): BillingPlanTier {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("enterprise")) return "enterprise";
  if (normalized.includes("premium")) return "premium";
  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("growth")) return "growth";
  return "starter";
}

function buildProvisioningConfig(template: TemplateRecord): ProvisioningConfig {
  return {
    stack: normalizeTemplateStack(template.stack),
    environment: "production",
    templateSlug: template.slug,
    templateSourcePath: template.templateSourcePath || undefined,
    deploymentProfile: template.deploymentProfile || undefined,
    scaling: {
      minServers: 1,
      maxServers: 1,
    },
    backup: {
      enabled: true,
      frequency: "daily",
    },
  };
}

function normalizeTemplateStack(stack: TemplateRecord["stack"]): ProvisioningConfig["stack"] {
  if (stack === "Laravel") return "laravel";
  if (stack === "WordPress") return "wordpress";
  return "nextjs";
}

function normalizeSubdomain(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function kickProvisioningWorker() {
  const workerId = `launch-${Date.now().toString(36)}`;
  setTimeout(() => {
    processNextJob(workerId, ["provisioning"]).catch((error) => {
      console.error("[launch-workflow] Failed to kick provisioning worker:", error);
    });
  }, 0);
}
