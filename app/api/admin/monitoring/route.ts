import { getMonitoringSnapshot } from "@/lib/mysql/operations";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-monitoring-read",
      limit: 40,
    });

    const snapshot = await getMonitoringSnapshot();
    return adminJson(snapshot);
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.monitoring.read" });
  }
}
