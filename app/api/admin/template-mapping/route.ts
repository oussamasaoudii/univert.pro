import { getTemplateMappingSnapshot } from "@/lib/mysql/operations";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-template-mapping-read",
      limit: 40,
    });

    const snapshot = await getTemplateMappingSnapshot();
    return adminJson(snapshot);
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.template_mapping.read" });
  }
}
