import { z } from "zod";
import {
  getSupportTicketStats,
  listSupportTicketsForAdmin,
} from "@/lib/mysql/support";
import {
  adminJson,
  parseSearchParams,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import { sanitizeSupportTicketSummaryForAdmin } from "@/lib/security/admin-response";

const ticketQuerySchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    status: z
      .enum(["open", "in_progress", "resolved", "closed"])
      .optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-support-tickets-read",
      limit: 60,
    });

    const query = parseSearchParams(request, ticketQuerySchema);
    const [tickets, stats] = await Promise.all([
      listSupportTicketsForAdmin({
        search: query.search,
        status: query.status,
        priority: query.priority,
        limit: query.limit ?? 100,
      }),
      getSupportTicketStats(),
    ]);

    return adminJson({
      tickets: tickets.map(sanitizeSupportTicketSummaryForAdmin),
      stats,
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.support_tickets.list" });
  }
}
