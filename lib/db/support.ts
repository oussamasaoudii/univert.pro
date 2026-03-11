import {
  createSupportTicket,
  getSupportTicketById,
  listSupportTicketsByUser,
  listSupportTicketsForAdmin,
  updateSupportTicket,
} from "@/lib/mysql/support";
import type { SupportTicketRow } from "./types";

function mapStatus(
  status: "open" | "in_progress" | "resolved" | "closed",
): SupportTicketRow["status"] {
  if (status === "resolved") {
    return "closed";
  }
  return status;
}

function mapTicket(row: Awaited<ReturnType<typeof getSupportTicketById>>): SupportTicketRow | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.userId,
    subject: row.subject,
    description: row.description,
    status: mapStatus(row.status),
    priority: row.priority,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function getUserTickets(userId: string): Promise<SupportTicketRow[]> {
  const tickets = await listSupportTicketsByUser(userId, 100);
  return tickets.map((ticket) => mapTicket(ticket)).filter(Boolean) as SupportTicketRow[];
}

export async function getTicketById(ticketId: string): Promise<SupportTicketRow | null> {
  return mapTicket(await getSupportTicketById(ticketId));
}

export async function createTicket(
  userId: string,
  input: {
    subject: string;
    description: string;
    priority?: SupportTicketRow["priority"];
  },
): Promise<SupportTicketRow | null> {
  try {
    const ticket = await createSupportTicket({
      userId,
      subject: input.subject,
      description: input.description,
      priority: input.priority,
    });

    return mapTicket(ticket);
  } catch (error) {
    console.error("[db] Error creating ticket:", error);
    return null;
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicketRow["status"],
): Promise<SupportTicketRow | null> {
  try {
    const nextStatus = status === "closed" ? "resolved" : status;
    const ticket = await updateSupportTicket(ticketId, { status: nextStatus as any });
    return mapTicket(ticket);
  } catch (error) {
    console.error("[db] Error updating ticket:", error);
    return null;
  }
}

export async function getAllTickets(): Promise<SupportTicketRow[]> {
  const tickets = await listSupportTicketsForAdmin({ limit: 200 });
  return tickets.map((ticket) => mapTicket(ticket)).filter(Boolean) as SupportTicketRow[];
}

export async function getOpenTickets(): Promise<SupportTicketRow[]> {
  const tickets = await listSupportTicketsForAdmin({ status: "open", limit: 200 });
  return tickets.map((ticket) => mapTicket(ticket)).filter(Boolean) as SupportTicketRow[];
}
