import { z } from "zod";
import {
  addSupportTicketMessage,
  getSupportTicketById,
  listSupportTicketMessages,
  updateSupportTicket,
} from "@/lib/mysql/support";
import { createUserNotification } from "@/lib/mysql/platform";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import {
  sanitizeSupportTicketMessageForAdmin,
  sanitizeSupportTicketSummaryForAdmin,
} from "@/lib/security/admin-response";
import {
  assertTrustedOrigin,
  parseJsonBody,
} from "@/lib/security/request";

const ticketIdSchema = z.string().uuid("invalid_ticket_id");

const updateTicketSchema = z
  .object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    category: z.enum(["technical", "billing", "domain", "other"]).optional(),
    assignedAdminId: z.string().uuid().nullable().optional(),
    reply: z.string().trim().min(1).max(5000).optional(),
  })
  .strict();

async function parseTicketId(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return ticketIdSchema.parse(params.id);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-support-ticket-read",
      limit: 60,
    });

    const ticketId = await parseTicketId(context);
    const ticket = await getSupportTicketById(ticketId);

    if (!ticket) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    const messages = await listSupportTicketMessages(ticketId);
    return adminJson({
      ticket: sanitizeSupportTicketSummaryForAdmin(ticket),
      messages: messages.map(sanitizeSupportTicketMessageForAdmin),
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.support_tickets.read" });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-support-ticket-write",
      limit: 30,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });
    assertTrustedOrigin(request);

    const ticketId = await parseTicketId(context);
    const currentTicket = await getSupportTicketById(ticketId);
    if (!currentTicket) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    const body = await parseJsonBody(request, updateTicketSchema, {
      maxBytes: 32 * 1024,
    });

    const hasUpdates =
      body.status !== undefined ||
      body.priority !== undefined ||
      body.category !== undefined ||
      Object.prototype.hasOwnProperty.call(body, "assignedAdminId");
    const hasReply = typeof body.reply === "string" && body.reply.length > 0;

    if (!hasUpdates && !hasReply) {
      return adminJson({ error: "no_updates" }, { status: 400 });
    }

    const updatedTicket = await updateSupportTicket(ticketId, {
      status: body.status,
      priority: body.priority,
      category: body.category,
      assignedAdminId:
        Object.prototype.hasOwnProperty.call(body, "assignedAdminId")
          ? body.assignedAdminId ?? null
          : undefined,
    });
    if (!updatedTicket) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    if (body.status && body.status !== currentTicket.status) {
      await createUserNotification(currentTicket.userId, {
        title: "Support ticket status updated",
        message: `${currentTicket.ticketNumber} is now ${body.status.replace("_", " ")}.`,
      });
    }

    if (hasReply) {
      // For system admins (fallback) or preview mode admins, use NULL sender
      // since these users don't have real user records in the database
      const senderUserId = (
        adminUser.source === "local_admin_fallback" || 
        adminUser.source === "preview_mock"
      ) ? null : adminUser.id;
      
      await addSupportTicketMessage({
        ticketId,
        senderUserId: senderUserId || null,
        senderRole: "admin",
        message: body.reply!,
      });
    }

    const [ticket, messages] = await Promise.all([
      getSupportTicketById(ticketId),
      listSupportTicketMessages(ticketId),
    ]);

    return adminJson({
      ok: true,
      ticket: ticket ? sanitizeSupportTicketSummaryForAdmin(ticket) : null,
      messages: messages.map(sanitizeSupportTicketMessageForAdmin),
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.support_tickets.update" });
  }
}
