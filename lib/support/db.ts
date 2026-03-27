import { getMySQLPool } from '@/lib/mysql/pool';

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  assigned_to: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export async function createTicket(
  userId: string,
  title: string,
  description: string,
  category: string | null = null,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): Promise<SupportTicket> {
  const pool = getMySQLPool();
  const [result] = await pool.query<any>(
    `INSERT INTO support_tickets (user_id, title, description, category, priority)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, title, description, category, priority]
  );
  
  const ticketId = (result as any).insertId;
  const ticket = await getTicketById(String(ticketId));
  if (!ticket) throw new Error('Failed to create ticket');
  return ticket;
}

export async function getTicketById(id: string): Promise<SupportTicket | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM support_tickets WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  return formatTicket(rows[0]);
}

export async function getUserTickets(userId: string, status?: string): Promise<SupportTicket[]> {
  const pool = getMySQLPool();
  let query = `SELECT * FROM support_tickets WHERE user_id = ?`;
  const params: any[] = [userId];
  
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY created_at DESC`;
  const [rows] = await pool.query<any[]>(query, params);
  return rows.map(formatTicket);
}

export async function updateTicketStatus(id: string, status: string): Promise<void> {
  const pool = getMySQLPool();
  const resolved_at = status === 'resolved' ? new Date() : null;
  await pool.query(
    `UPDATE support_tickets SET status = ?, resolved_at = ? WHERE id = ?`,
    [status, resolved_at, id]
  );
}

function formatTicket(row: any): SupportTicket {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    category: row.category,
    assigned_to: row.assigned_to ? String(row.assigned_to) : null,
    tags: row.tags ? JSON.parse(row.tags) : [],
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
    resolved_at: row.resolved_at?.toISOString?.() || row.resolved_at,
  };
}
