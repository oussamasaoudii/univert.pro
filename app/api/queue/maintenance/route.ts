import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import { runQueueMaintenance, getQueueStatus } from "@/lib/queue/queue-manager";
import { queueSecurityRequestAuditLog } from "@/lib/security/audit";
import {
  getRequestIp,
  hasValidInternalBearer,
  enforceRouteRateLimit,
  toApiErrorResponse,
} from "@/lib/security/request";

export async function POST(request: Request) {
  if (!hasValidInternalBearer(request)) {
    await Promise.resolve(
      queueSecurityRequestAuditLog(request, {
        action: "security.internal_api_unauthorized",
        resourceId: "/api/queue/maintenance",
        changes: {
          access: "write",
        },
      }),
    );
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await enforceRouteRateLimit({
      scope: "internal-queue-maintenance",
      key: getRequestIp(request),
      limit: 20,
      windowMs: 5 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const maintenanceResult = await runQueueMaintenance();
    const queueStatus = await getQueueStatus();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      maintenance: maintenanceResult,
      queue: queueStatus,
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "queue.maintenance.write" });
  }
}

export async function GET(request: Request) {
  if (!hasValidInternalBearer(request)) {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      await Promise.resolve(
        queueSecurityRequestAuditLog(request, {
          action: "security.internal_api_unauthorized",
          resourceId: "/api/queue/maintenance",
          changes: {
            access: "read",
          },
        }),
      );
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const queueStatus = await getQueueStatus();
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...queueStatus,
    });
  } catch (error) {
    const response = toApiErrorResponse(error, { action: "queue.maintenance.read" });
    return NextResponse.json(
      {
        error: "internal_error",
        healthy: false,
      },
      { status: response.status },
    );
  }
}
