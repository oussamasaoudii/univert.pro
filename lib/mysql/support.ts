import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import {
  createAdminNotification,
  createUserNotification,
} from "@/lib/mysql/platform";
import { ensureCoreSchema } from "@/lib/mysql/schema";

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";
export type SupportTicketCategory = "technical" | "billing" | "domain" | "other";

export type SupportTicketRecord = {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedAdminId: string | null;
  assignedAdminEmail: string | null;
  responsesCount: number;
  lastReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketMessageRecord = {
  id: string;
  ticketId: string;
  senderUserId: string | null;
  senderRole: "user" | "admin" | "system";
  message: string;
  createdAt: string;
};

type SupportTicketRow = {
  id: string;
  ticket_number: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assigned_admin_id: string | null;
  assigned_admin_email: string | null;
  responses_count: number;
  last_reply_at: string | null;
  created_at: string;
  updated_at: string;
};

type SupportTicketMessageRow = {
  id: string;
  ticket_id: string;
  sender_user_id: string | null;
  sender_role: "user" | "admin" | "system";
  message: string;
  created_at: string;
};

let supportSchemaPromise: Promise<void> | null = null;

function mapTicket(row: SupportTicketRow): SupportTicketRecord {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    subject: row.subject,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    assignedAdminId: row.assigned_admin_id,
    assignedAdminEmail: row.assigned_admin_email,
    responsesCount: Number(row.responses_count || 0),
    lastReplyAt: row.last_reply_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: SupportTicketMessageRow): SupportTicketMessageRecord {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    senderUserId: row.sender_user_id,
    senderRole: row.sender_role,
    message: row.message,
    createdAt: row.created_at,
  };
}

function createTicketNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TKT-${stamp}-${rand}`;
}

async function ensureSupportSchema() {
  if (!supportSchemaPromise) {
    supportSchemaPromise = initializeSupportSchema();
  }
  await supportSchemaPromise;
}

async function initializeSupportSchema() {
  await ensureCoreSchema();
  const pool = getMySQLPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id CHAR(36) PRIMARY KEY,
      ticket_number VARCHAR(64) NOT NULL UNIQUE,
      user_id CHAR(36) NOT NULL,
      subject VARCHAR(191) NOT NULL,
      description TEXT NOT NULL,
      category ENUM('technical', 'billing', 'domain', 'other') NOT NULL DEFAULT 'technical',
      priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
      status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
      assigned_admin_id CHAR(36) NULL,
      responses_count INT NOT NULL DEFAULT 0,
      last_reply_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_support_tickets_user (user_id),
      INDEX idx_support_tickets_status (status),
      INDEX idx_support_tickets_priority (priority),
      CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_support_tickets_admin FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_ticket_messages (
      id CHAR(36) PRIMARY KEY,
      ticket_id CHAR(36) NOT NULL,
      sender_user_id CHAR(36) NULL,
      sender_role ENUM('user', 'admin', 'system') NOT NULL DEFAULT 'user',
      message TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ticket_messages_ticket (ticket_id),
      CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
      CONSTRAINT fk_ticket_messages_user FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function listSupportTicketsForAdmin(options?: {
  search?: string;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  limit?: number;
}): Promise<SupportTicketRecord[]> {
  await ensureSupportSchema();
  const pool = getMySQLPool();

  const where: string[] = ["1=1"];
  const values: Array<string | number> = [];

  const search = options?.search?.trim().toLowerCase();
  if (search) {
    const like = `%${search}%`;
    where.push(
      "(LOWER(t.ticket_number) LIKE ? OR LOWER(t.subject) LIKE ? OR LOWER(COALESCE(u.email, '')) LIKE ? OR LOWER(COALESCE(u.full_name, '')) LIKE ?)",
    );
    values.push(like, like, like, like);
  }

  if (options?.status) {
    where.push("t.status = ?");
    values.push(options.status);
  }

  if (options?.priority) {
    where.push("t.priority = ?");
    values.push(options.priority);
  }

  const limit = options?.limit && options.limit > 0 ? options.limit : 200;
  values.push(limit);

  const [rows] = await pool.query<SupportTicketRow[]>(
    `
      SELECT
        t.id,
        t.ticket_number,
        t.user_id,
        u.email AS user_email,
        u.full_name AS user_name,
        t.subject,
        t.description,
        t.category,
        t.priority,
        t.status,
        t.assigned_admin_id,
        a.email AS assigned_admin_email,
        t.responses_count,
        t.last_reply_at,
        t.created_at,
        t.updated_at
      FROM support_tickets t
      INNER JOIN users u ON u.id = t.user_id
      LEFT JOIN users a ON a.id = t.assigned_admin_id
      WHERE ${where.join(" AND ")}
      ORDER BY
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        t.created_at DESC
      LIMIT ?
    `,
    values,
  );

  return rows.map(mapTicket);
}

export async function listSupportTicketsByUser(
  userId: string,
  limit: number = 100,
): Promise<SupportTicketRecord[]> {
  await ensureSupportSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<SupportTicketRow[]>(
    `
      SELECT
        t.id,
        t.ticket_number,
        t.user_id,
        u.email AS user_email,
        u.full_name AS user_name,
        t.subject,
        t.description,
        t.category,
        t.priority,
        t.status,
        t.assigned_admin_id,
        a.email AS assigned_admin_email,
        t.responses_count,
        t.last_reply_at,
        t.created_at,
        t.updated_at
      FROM support_tickets t
      INNER JOIN users u ON u.id = t.user_id
      LEFT JOIN users a ON a.id = t.assigned_admin_id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `,
    [userId, limit],
  );

  return rows.map(mapTicket);
}

export async function getSupportTicketById(
  ticketId: string,
): Promise<SupportTicketRecord | null> {
  await ensureSupportSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<SupportTicketRow[]>(
    `
      SELECT
        t.id,
        t.ticket_number,
        t.user_id,
        u.email AS user_email,
        u.full_name AS user_name,
        t.subject,
        t.description,
        t.category,
        t.priority,
        t.status,
        t.assigned_admin_id,
        a.email AS assigned_admin_email,
        t.responses_count,
        t.last_reply_at,
        t.created_at,
        t.updated_at
      FROM support_tickets t
      INNER JOIN users u ON u.id = t.user_id
      LEFT JOIN users a ON a.id = t.assigned_admin_id
      WHERE t.id = ?
      LIMIT 1
    `,
    [ticketId],
  );

  return rows[0] ? mapTicket(rows[0]) : null;
}

export async function createSupportTicket(input: {
  userId: string;
  subject: string;
  description: string;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
}): Promise<SupportTicketRecord> {
  await ensureSupportSchema();
  const pool = getMySQLPool();
  const ticketId = randomUUID();
  const ticketNumber = createTicketNumber();

  await pool.query(
    `
      INSERT INTO support_tickets (
        id, ticket_number, user_id, subject, description, category, priority, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
    `,
    [
      ticketId,
      ticketNumber,
      input.userId,
      input.subject.trim(),
      input.description.trim(),
      input.category || "technical",
      input.priority || "medium",
    ],
  );

  await pool.query(
    `
      INSERT INTO support_ticket_messages (
        id, ticket_id, sender_user_id, sender_role, message
      )
      VALUES (?, ?, ?, 'user', ?)
    `,
    [randomUUID(), ticketId, input.userId, input.description.trim()],
  );

  const ticket = await getSupportTicketById(ticketId);
  if (!ticket) {
    throw new Error("Ticket creation failed");
  }

  await createAdminNotification({
    title: "New support ticket",
    message: `${ticket.ticketNumber} was opened by ${ticket.userEmail || "a user"}.`,
    category: "support.ticket_created",
  });

  return ticket;
}

export async function updateSupportTicket(
  ticketId: string,
  updates: {
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    category?: SupportTicketCategory;
    assignedAdminId?: string | null;
  },
): Promise<SupportTicketRecord | null> {
  await ensureSupportSchema();
  const pool = getMySQLPool();

  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (updates.status) {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (updates.priority) {
    fields.push("priority = ?");
    values.push(updates.priority);
  }
  if (updates.category) {
    fields.push("category = ?");
    values.push(updates.category);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "assignedAdminId")) {
    fields.push("assigned_admin_id = ?");
    values.push(updates.assignedAdminId || null);
  }

  if (fields.length > 0) {
    values.push(ticketId);
    await pool.query(
      `
        UPDATE support_tickets
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
      values,
    );
  }

  return getSupportTicketById(ticketId);
}

export async function listSupportTicketMessages(
  ticketId: string,
  limit: number = 100,
): Promise<SupportTicketMessageRecord[]> {
  await ensureSupportSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<SupportTicketMessageRow[]>(
    `
      SELECT id, ticket_id, sender_user_id, sender_role, message, created_at
      FROM support_ticket_messages
      WHERE ticket_id = ?
      ORDER BY created_at ASC
      LIMIT ?
    `,
    [ticketId, limit],
  );

  return rows.map(mapMessage);
}

export async function addSupportTicketMessage(input: {
  ticketId: string;
  senderUserId?: string | null;
  senderRole: "user" | "admin" | "system";
  message: string;
}): Promise<void> {
  await ensureSupportSchema();
  const pool = getMySQLPool();

  await pool.query(
    `
      INSERT INTO support_ticket_messages (
        id, ticket_id, sender_user_id, sender_role, message
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      input.ticketId,
      input.senderUserId || null,
      input.senderRole,
      input.message.trim(),
    ],
  );

  await pool.query(
    `
      UPDATE support_tickets
      SET
        responses_count = responses_count + 1,
        last_reply_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
    `,
    [input.ticketId],
  );

  const ticket = await getSupportTicketById(input.ticketId);
  if (!ticket) {
    return;
  }

  if (input.senderRole === "user") {
    await createAdminNotification({
      title: "Support ticket reply",
      message: `${ticket.ticketNumber} received a new customer reply.`,
      category: "support.ticket_reply",
    });
    return;
  }

  if (input.senderRole === "admin" || input.senderRole === "system") {
    await createUserNotification(ticket.userId, {
      title: "Support replied to your ticket",
      message: `There is a new reply on ticket ${ticket.ticketNumber}.`,
    });
  }
}

export async function getSupportTicketStats(): Promise<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  highPriorityOpen: number;
}> {
  await ensureSupportSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<
    Array<{
      total: string | number;
      open_tickets: string | number;
      in_progress_tickets: string | number;
      resolved_tickets: string | number;
      closed_tickets: string | number;
      high_priority_open: string | number;
    }>
  >(
    `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_tickets,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_tickets,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_tickets,
        SUM(CASE WHEN priority IN ('high', 'urgent') AND status IN ('open', 'in_progress') THEN 1 ELSE 0 END) AS high_priority_open
      FROM support_tickets
    `,
  );

  const row = rows[0];
  return {
    total: Number(row?.total || 0),
    open: Number(row?.open_tickets || 0),
    inProgress: Number(row?.in_progress_tickets || 0),
    resolved: Number(row?.resolved_tickets || 0),
    closed: Number(row?.closed_tickets || 0),
    highPriorityOpen: Number(row?.high_priority_open || 0),
  };
}
