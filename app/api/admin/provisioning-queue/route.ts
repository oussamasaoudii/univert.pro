import { getRecentJobLogs } from "@/lib/db/provisioning";
import { getProvisioningQueueSnapshot } from "@/lib/mysql/operations";
import {
  sanitizeQueueJobForAdmin,
} from "@/lib/security/admin-response";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-provisioning-queue-read",
      limit: 45,
    });

    const snapshot = await getProvisioningQueueSnapshot();
    const jobs = await Promise.all(
      snapshot.jobs.map(async (job) => {
        const logs = await getRecentJobLogs(job.id, 5);
        return sanitizeQueueJobForAdmin({
          ...job,
          latestLog: logs[logs.length - 1]?.message || null,
          latestLogLevel: logs[logs.length - 1]?.level || null,
        });
      }),
    );

    return adminJson({
      jobs,
      running: jobs.filter((item) => item.status === "running"),
      pending: jobs.filter((item) => item.status === "pending"),
      failed: jobs.filter((item) => item.status === "failed"),
      stats: snapshot.stats,
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.provisioning_queue.read" });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-provisioning-queue-read",
      limit: 20,
    });

    return adminJson(
      { error: "queue_is_read_only_from_ui" },
      { status: 400 },
    );
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.provisioning_queue.patch" });
  }
}
