import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import {
  addSupportTicketMessage,
  getSupportTicketById,
  listSupportTicketMessages,
} from "@/lib/mysql/support";
import {
  queueCrossTenantAccessAuditLog,
  toSecurityActorType,
  type CrossTenantAuditLogger,
} from "@/lib/security/audit";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

const ticketReplySchema = z
  .object({
    message: z.string().trim().min(1).max(5000),
  })
  .strict();

type DashboardSupportTicketRouteDeps = {
  addSupportTicketMessage: typeof addSupportTicketMessage;
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAuthenticatedRequestUser: typeof getAuthenticatedRequestUser;
  getSupportTicketById: typeof getSupportTicketById;
  listSupportTicketMessages: typeof listSupportTicketMessages;
  parseJsonBody: typeof parseJsonBody;
  securityAuditLog: CrossTenantAuditLogger;
};

const dashboardSupportTicketRouteDeps: DashboardSupportTicketRouteDeps = {
  addSupportTicketMessage,
  enforceRouteRateLimit,
  getAuthenticatedRequestUser,
  getSupportTicketById,
  listSupportTicketMessages,
  parseJsonBody,
  securityAuditLog: queueCrossTenantAccessAuditLog,
};

async function auditCrossTenantSupportTicketAccess(
  request: Request,
  deps: DashboardSupportTicketRouteDeps,
  input: {
    actorId: string;
    actorRole: string;
    ticketId: string;
    ticketUserId: string;
    statusCode: 404;
  },
) {
  await Promise.resolve(
    deps.securityAuditLog(request, {
      actorId: input.actorId,
      actorType: toSecurityActorType(input.actorRole),
      resourceType: "support_ticket",
      targetId: input.ticketId,
      routeId: "/api/dashboard/support/tickets/[id]",
      statusCode: input.statusCode,
      relatedResourceType: "user",
      relatedResourceId: input.ticketUserId,
    }),
  );
}

export async function handleDashboardSupportTicketGet(
  request: Request,
  context: { params: Promise<{ id: string }> },
  deps: DashboardSupportTicketRouteDeps = dashboardSupportTicketRouteDeps,
) {
  try {
    const user = await deps.getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "support-ticket-detail-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const params = await context.params;
    const ticket = await deps.getSupportTicketById(params.id);

    if (!ticket || ticket.userId !== user.id) {
      if (ticket && ticket.userId !== user.id) {
        await auditCrossTenantSupportTicketAccess(request, deps, {
          actorId: user.id,
          actorRole: user.role,
          ticketId: params.id,
          ticketUserId: ticket.userId,
          statusCode: 404,
        });
      }
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const messages = await deps.listSupportTicketMessages(ticket.id);
    return NextResponse.json({ ticket, messages });
  } catch (error) {
    return toApiErrorResponse(error, { action: "support.tickets.detail" });
  }
}

export async function handleDashboardSupportTicketPatch(
  request: Request,
  context: { params: Promise<{ id: string }> },
  deps: DashboardSupportTicketRouteDeps = dashboardSupportTicketRouteDeps,
) {
  try {
    assertTrustedOrigin(request);
    const user = await deps.getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await deps.enforceRouteRateLimit({
      scope: "support-ticket-reply",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 30,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const params = await context.params;
    const ticket = await deps.getSupportTicketById(params.id);
    if (!ticket || ticket.userId !== user.id) {
      if (ticket && ticket.userId !== user.id) {
        await auditCrossTenantSupportTicketAccess(request, deps, {
          actorId: user.id,
          actorRole: user.role,
          ticketId: params.id,
          ticketUserId: ticket.userId,
          statusCode: 404,
        });
      }
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const body = await deps.parseJsonBody(request, ticketReplySchema, {
      maxBytes: 16 * 1024,
      audit: {
        actorId: user.id,
        actorType: toSecurityActorType(user.role),
        resourceId: `/api/dashboard/support/tickets/${params.id}`,
      },
    });

    await deps.addSupportTicketMessage({
      ticketId: ticket.id,
      senderUserId: user.id,
      senderRole: "user",
      message: body.message,
    });

    const updatedTicket = await deps.getSupportTicketById(ticket.id);
    const messages = await deps.listSupportTicketMessages(ticket.id);

    return NextResponse.json({
      ok: true,
      ticket: updatedTicket,
      messages,
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "support.tickets.reply" });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleDashboardSupportTicketGet(request, context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleDashboardSupportTicketPatch(request, context);
}
