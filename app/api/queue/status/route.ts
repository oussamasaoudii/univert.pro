import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import {
  getDeadLetterJobs,
  getQueueStats,
  getRecentJobs,
  getWorkerHeartbeats,
} from "@/lib/queue/data-access";
import { queueSecurityRequestAuditLog } from "@/lib/security/audit";
import {
  enforceRouteRateLimit,
  getRequestIp,
  hasValidInternalBearer,
  toApiErrorResponse,
} from "@/lib/security/request";

export async function GET(request: Request) {
  try {
    if (hasValidInternalBearer(request)) {
      await enforceRouteRateLimit({
        scope: "internal-queue-status",
        key: getRequestIp(request),
        limit: 60,
        windowMs: 10 * 60 * 1000,
        blockDurationMs: 10 * 60 * 1000,
      });
    } else {
      const adminUser = await getAdminRequestUser();
      if (!adminUser) {
        await Promise.resolve(
          queueSecurityRequestAuditLog(request, {
            action: "security.internal_api_unauthorized",
            resourceId: "/api/queue/status",
            changes: {
              access: "read",
            },
          }),
        );
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }

      await enforceRouteRateLimit({
        scope: "admin-queue-status",
        key: `${adminUser.id}:${getRequestIp(request)}`,
        limit: 120,
        windowMs: 10 * 60 * 1000,
        blockDurationMs: 10 * 60 * 1000,
      });
    }

    const [stats, deadLetterJobs, recentJobs, workers] = await Promise.all([
      getQueueStats(),
      getDeadLetterJobs(10, true),
      getRecentJobs(50),
      getWorkerHeartbeats(10),
    ]);

    const processingJobs = recentJobs.filter((job) => job.status === 'processing');

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      stats,
      activeWorkers: workers.filter((worker) => worker.status === 'active').length,
      processingJobs,
      recentDeadLetters: deadLetterJobs,
      workers,
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "queue.status" });
  }
}
