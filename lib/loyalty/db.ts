import { getMySQLPool } from '@/lib/mysql/pool';

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  total_points: number;
  available_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetime_points: number;
  created_at: string;
  updated_at: string;
}

export async function getUserPoints(userId: string): Promise<LoyaltyPoints | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM loyalty_points WHERE user_id = ?`,
    [userId]
  );
  if (rows.length === 0) return null;
  return formatPoints(rows[0]);
}

export async function addPoints(userId: string, points: number, reason: string, subscriptionId?: string): Promise<void> {
  const pool = getMySQLPool();
  
  // Update loyalty_points
  const [userPoints] = await pool.query<any[]>(
    `SELECT * FROM loyalty_points WHERE user_id = ?`,
    [userId]
  );
  
  if (userPoints.length === 0) {
    await pool.query(
      `INSERT INTO loyalty_points (user_id, total_points, available_points, lifetime_points)
       VALUES (?, ?, ?, ?)`,
      [userId, points, points, points]
    );
  } else {
    await pool.query(
      `UPDATE loyalty_points 
       SET total_points = total_points + ?, available_points = available_points + ?, lifetime_points = lifetime_points + ?
       WHERE user_id = ?`,
      [points, points, points, userId]
    );
  }
  
  // Log transaction
  await pool.query(
    `INSERT INTO loyalty_transactions (user_id, type, points, reason, related_subscription_id)
     VALUES (?, 'earned', ?, ?, ?)`,
    [userId, points, reason, subscriptionId || null]
  );
}

export async function redeemPoints(userId: string, points: number, reason: string): Promise<void> {
  const pool = getMySQLPool();
  
  await pool.query(
    `UPDATE loyalty_points SET available_points = available_points - ? WHERE user_id = ?`,
    [points, userId]
  );
  
  await pool.query(
    `INSERT INTO loyalty_transactions (user_id, type, points, reason)
     VALUES (?, 'redeemed', ?, ?)`,
    [userId, points, reason]
  );
}

function formatPoints(row: any): LoyaltyPoints {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    total_points: row.total_points,
    available_points: row.available_points,
    tier: row.tier,
    lifetime_points: row.lifetime_points,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}
