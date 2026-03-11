import { NextResponse } from "next/server";
import { assessWebsiteHealth } from "@/lib/monitoring/health-check-engines";
import { listWebsitesForAdmin } from "@/lib/mysql/platform";
import type { WebsiteRow } from "@/lib/db/types";
import { queueSecurityRequestAuditLog } from "@/lib/security/audit";
import {
  getRequestIp,
  hasValidInternalBearer,
  enforceRouteRateLimit,
  toApiErrorResponse,
} from "@/lib/security/request";
import { logger } from "@/lib/utils/errors";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

type MonitoringWorkerRouteDeps = {
  assessWebsiteHealth: typeof assessWebsiteHealth;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  hasValidInternalBearer: typeof hasValidInternalBearer;
  listWebsitesForAdmin: typeof listWebsitesForAdmin;
  securityAuditLog: typeof queueSecurityRequestAuditLog;
};

const monitoringWorkerRouteDeps: MonitoringWorkerRouteDeps = {
  assessWebsiteHealth,
  enforceRouteRateLimit,
  hasValidInternalBearer,
  listWebsitesForAdmin,
  securityAuditLog: queueSecurityRequestAuditLog,
};

export async function handleMonitoringWorkerPost(
  request: Request,
  deps: MonitoringWorkerRouteDeps = monitoringWorkerRouteDeps,
) {
  if (!deps.hasValidInternalBearer(request)) {
    await Promise.resolve(
      deps.securityAuditLog(request, {
        action: "security.internal_api_unauthorized",
        resourceId: "/api/monitoring/worker",
        changes: {
          access: "write",
        },
      }),
    );
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await deps.enforceRouteRateLimit({
      scope: "internal-monitoring-worker",
      key: getRequestIp(request),
      limit: 12,
      windowMs: 5 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const websiteRecords = await deps.listWebsitesForAdmin();
    const websites = websiteRecords
      .filter((website) => website.status === "ready" || website.status === "provisioning")
      .map<WebsiteRow>((website) => ({
        id: website.id,
        user_id: website.userId,
        template_id: website.templateId || "",
        name: website.projectName,
        project_name: website.projectName,
        status: website.status,
        subdomain: website.subdomain,
        custom_domain: website.customDomain,
        live_url: website.liveUrl || "",
        admin_url: website.dashboardUrl,
        stack: website.templateStack,
        provisioning_job_id: website.provisioningJobId,
        provisioning_error: website.provisioningError || undefined,
        created_at: website.createdAt,
        updated_at: website.updatedAt,
      }));

    if (websites.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No websites to check",
        checked: 0,
      });
    }

    const batchSize = 5;
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let index = 0; index < websites.length; index += batchSize) {
      const batch = websites.slice(index, index + batchSize);
      await Promise.all(
        batch.map(async (website) => {
          try {
            await deps.assessWebsiteHealth(website, website.user_id);
            results.success++;
          } catch (error) {
            results.failed++;
            const message = error instanceof Error ? error.message : "Unknown error";
            results.errors.push(`${website.id}: ${message}`);
            logger.error("[monitoring-worker] website check failed", error, {
              websiteId: website.id,
            });
          }
        }),
      );
    }

    return NextResponse.json({
      success: true,
      message: "Health checks completed",
      checked: websites.length,
      results,
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "monitoring.worker" });
  }
}

export async function POST(request: Request) {
  return handleMonitoringWorkerPost(request);
}
