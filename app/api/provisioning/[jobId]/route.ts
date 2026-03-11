// Provisioning Job Status API
// Real-time status for provisioning jobs

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { getProvisioningJob, getRecentJobLogs } from "@/lib/db/provisioning";
import { getJobsForProvisioning } from "@/lib/queue/data-access";
import { getWebsiteById } from "@/lib/mysql/platform";
import {
  queueCrossTenantAccessAuditLog,
  toSecurityActorType,
  type CrossTenantAuditLogger,
} from "@/lib/security/audit";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";
import { ValidationError } from "@/lib/utils/errors";

type ProvisioningStatusRouteDeps = {
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAuthenticatedRequestUser: typeof getAuthenticatedRequestUser;
  getProvisioningJob: typeof getProvisioningJob;
  getRecentJobLogs: typeof getRecentJobLogs;
  getJobsForProvisioning: typeof getJobsForProvisioning;
  getWebsiteById: typeof getWebsiteById;
  securityAuditLog: CrossTenantAuditLogger;
};

const provisioningStatusRouteDeps: ProvisioningStatusRouteDeps = {
  enforceRouteRateLimit,
  getAuthenticatedRequestUser,
  getProvisioningJob,
  getRecentJobLogs,
  getJobsForProvisioning,
  getWebsiteById,
  securityAuditLog: queueCrossTenantAccessAuditLog,
};

/**
 * GET /api/provisioning/[jobId]
 * Get current status of a provisioning job
 */
export async function handleProvisioningStatusGet(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
  deps: ProvisioningStatusRouteDeps = provisioningStatusRouteDeps,
) {
  try {
    const { jobId } = await params;
    const jobIdResult = z.string().uuid().safeParse(jobId);
    if (!jobIdResult.success) {
      throw new ValidationError("invalid_job_id");
    }

    const user = await deps.getAuthenticatedRequestUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "provisioning-status-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const job = await deps.getProvisioningJob(jobIdResult.data);

    if (!job) {
      return NextResponse.json({ error: "job_not_found" }, { status: 404 });
    }

    let website = null;
    if (user.role === "admin") {
      website = await deps.getWebsiteById(job.website_id);
    } else {
      website = await deps.getWebsiteById(job.website_id, user.id);
      if (!website) {
        const existingWebsite = await deps.getWebsiteById(job.website_id);
        if (existingWebsite) {
          await Promise.resolve(
            deps.securityAuditLog(request, {
              actorId: user.id,
              actorType: toSecurityActorType(user.role),
              resourceType: "provisioning_job",
              targetId: jobIdResult.data,
              routeId: "/api/provisioning/[jobId]",
              statusCode: 403,
              relatedResourceType: "website",
              relatedResourceId: job.website_id,
            }),
          );
        }
      }
    }

    if (!website) {
      return NextResponse.json({ error: "unauthorized" }, { status: 403 });
    }

    const logs = await deps.getRecentJobLogs(jobIdResult.data, 20);

    const queueJobs = await deps.getJobsForProvisioning(jobIdResult.data);
    const activeQueueJob = queueJobs.find(
      (j) => j.status === "processing" || j.status === "claimed" || j.status === "pending"
    );

    return NextResponse.json({
      job,
      website,
      logs,
      queue: activeQueueJob
        ? {
            id: activeQueueJob.id,
            status: activeQueueJob.status,
            attemptCount: activeQueueJob.attempt_count,
            maxAttempts: activeQueueJob.max_attempts,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "provisioning.status" });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  return handleProvisioningStatusGet(request, context);
}
