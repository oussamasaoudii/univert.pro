import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import {
  createSupportTicket,
  listSupportTicketsByUser,
  type SupportTicketCategory,
  type SupportTicketPriority,
} from "@/lib/mysql/support";
import { createUserActivity } from "@/lib/mysql/platform";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

const supportTicketSchema = z
  .object({
    subject: z.string().trim().min(3).max(191),
    description: z.string().trim().min(10).max(5000),
    category: z.enum(["technical", "billing", "domain", "other"]).default("technical"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  })
  .strict();

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "support-ticket-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const tickets = await listSupportTicketsByUser(user.id, 100);
    const stats = {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
      resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    };

    return NextResponse.json({ tickets, stats });
  } catch (error) {
    return toApiErrorResponse(error, { action: "support.tickets.read" });
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "support-ticket-create",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const body = await parseJsonBody(request, supportTicketSchema, { maxBytes: 16 * 1024 });
    const ticket = await createSupportTicket({
      userId: user.id,
      subject: body.subject,
      description: body.description,
      category: body.category as SupportTicketCategory,
      priority: body.priority as SupportTicketPriority,
    });

    await createUserActivity(user.id, {
      activityType: "ticket_opened",
      message: `Support ticket ${ticket.ticketNumber} created.`,
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, { action: "support.tickets.create" });
  }
}
