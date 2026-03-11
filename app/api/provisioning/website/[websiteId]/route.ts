import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import {
  getProvisioningJob,
  getRecentJobLogs,
  getWebsiteProvisioningJob,
} from "@/lib/db/provisioning";
import { getJobsForProvisioning } from "@/lib/queue/data-access";
import { getWebsiteById } from "@/lib/mysql/platform";
import {
  queueCrossTenantAccessAuditLog,
  toSecurityActorType,
  type CrossTenantAuditLogger,
} from "@/lib/security/audit";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";

type RouteContext = {
  params: Promise<{
    websiteId: string;
  }>;
};

type ProvisioningWebsiteRouteDeps = {
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAuthenticatedRequestUser: typeof getAuthenticatedRequestUser;
  getJobsForProvisioning: typeof getJobsForProvisioning;
  getProvisioningJob: typeof getProvisioningJob;
  getRecentJobLogs: typeof getRecentJobLogs;
  getWebsiteById: typeof getWebsiteById;
  getWebsiteProvisioningJob: typeof getWebsiteProvisioningJob;
  securityAuditLog: CrossTenantAuditLogger;
};

const provisioningWebsiteRouteDeps: ProvisioningWebsiteRouteDeps = {
  enforceRouteRateLimit,
  getAuthenticatedRequestUser,
  getJobsForProvisioning,
  getProvisioningJob,
  getRecentJobLogs,
  getWebsiteById,
  getWebsiteProvisioningJob,
  securityAuditLog: queueCrossTenantAccessAuditLog,
};

export async function handleProvisioningWebsiteGet(
  request: Request,
  context: RouteContext,
  deps: ProvisioningWebsiteRouteDeps = provisioningWebsiteRouteDeps,
) {
  try {
    const user = await deps.getAuthenticatedRequestUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { websiteId } = await context.params;
    await deps.enforceRouteRateLimit({
      scope: "provisioning-website-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    let website = null;
    if (user.role === "admin") {
      website = await deps.getWebsiteById(websiteId);
    } else {
      website = await deps.getWebsiteById(websiteId, user.id);
      if (!website) {
        const existingWebsite = await deps.getWebsiteById(websiteId);
        if (existingWebsite) {
          await Promise.resolve(
            deps.securityAuditLog(request, {
              actorId: user.id,
              actorType: toSecurityActorType(user.role),
              resourceType: "website",
              targetId: websiteId,
              routeId: "/api/provisioning/website/[websiteId]",
              statusCode: 404,
            }),
          );
        }
      }
    }

    if (!website) {
      return NextResponse.json({ error: "website_not_found" }, { status: 404 });
    }

    const job =
      (website.provisioningJobId
        ? await deps.getProvisioningJob(website.provisioningJobId)
        : await deps.getWebsiteProvisioningJob(websiteId)) || null;

    if (!job) {
      return NextResponse.json({ website, job: null, logs: [], queue: null });
    }

    const [logs, queueJobs] = await Promise.all([
      deps.getRecentJobLogs(job.id, 50),
      deps.getJobsForProvisioning(job.id),
    ]);

    const activeQueueJob =
      queueJobs.find((item) =>
        ["pending", "claimed", "processing"].includes(item.status),
      ) || queueJobs[0] || null;

    return NextResponse.json({
      website,
      job,
      logs,
      queue: activeQueueJob,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "provisioning.website" });
  }
}

export async function GET(request: Request, context: RouteContext) {
  return handleProvisioningWebsiteGet(request, context);
}
