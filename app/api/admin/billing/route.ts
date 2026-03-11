import { z } from "zod";
import {
  getInvoiceCounters,
  getMonthlyRevenueTrend,
  listInvoicesForAdmin,
} from "@/lib/mysql/billing";
import {
  adminJson,
  parseSearchParams,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";

const billingQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-billing-read",
      limit: 40,
    });

    const query = parseSearchParams(request, billingQuerySchema);
    const limit = query.limit ?? 50;

    const [invoices, counters, revenueTrend] = await Promise.all([
      listInvoicesForAdmin({ search: query.search, limit }),
      getInvoiceCounters(),
      getMonthlyRevenueTrend(6),
    ]);

    return adminJson({
      invoices,
      counters,
      revenueTrend,
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.billing.read" });
  }
}
