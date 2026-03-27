import { getMySQLPool } from '@/lib/mysql/pool';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, any> | null;
  read: boolean;
  channel: 'in_app' | 'email' | 'push' | 'sms';
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  subscription_notifications: boolean;
  security_notifications: boolean;
  billing_notifications: boolean;
  marketing_notifications: boolean;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string | null = null,
  data: Record<string, any> | null = null,
  channel: 'in_app' | 'email' | 'push' | 'sms' = 'in_app'
): Promise<Notification> {
  const pool = getMySQLPool();
  const [result] = await pool.query<any>(
    `INSERT INTO notifications (user_id, type, title, message, data, channel)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, title, message, JSON.stringify(data || {}), channel]
  );
  
  const notifId = (result as any).insertId;
  const notification = await getNotificationById(String(notifId));
  if (!notification) throw new Error('Failed to create notification');
  return notification;
}

export async function getNotificationById(id: string): Promise<Notification | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM notifications WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  return formatNotification(rows[0]);
}

export async function getUserNotifications(userId: string, limit = 50, offset = 0): Promise<Notification[]> {
  const pool = getMySQLPool();
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows.map(formatNotification);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const pool = getMySQLPool();
  await pool.query(
    `UPDATE notifications SET read = TRUE, read_at = NOW() WHERE id = ?`,
    [id]
  );
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const pool = getMySQLPool();
  await pool.query(
    `UPDATE notifications SET read = TRUE, read_at = NOW() WHERE user_id = ? AND read = FALSE`,
    [userId]
  );
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM notification_preferences WHERE user_id = ?`,
    [userId]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

export async function createNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const pool = getMySQLPool();
  await pool.query(
    `INSERT INTO notification_preferences (user_id) VALUES (?)`,
    [userId]
  );
  const prefs = await getNotificationPreferences(userId);
  if (!prefs) throw new Error('Failed to create preferences');
  return prefs;
}

export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<void> {
  const pool = getMySQLPool();
  const setClause = Object.keys(updates)
    .filter(k => k !== 'id' && k !== 'user_id')
    .map(k => `${k} = ?`)
    .join(', ');
  
  if (!setClause) return;
  
  const values = Object.entries(updates)
    .filter(([k]) => k !== 'id' && k !== 'user_id')
    .map(([, v]) => v);
  
  await pool.query(
    `UPDATE notification_preferences SET ${setClause} WHERE user_id = ?`,
    [...values, userId]
  );
}

function formatNotification(row: any): Notification {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    type: row.type,
    title: row.title,
    message: row.message,
    data: row.data ? JSON.parse(row.data) : null,
    read: Boolean(row.read),
    channel: row.channel,
    sent_at: row.sent_at,
    read_at: row.read_at,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}
