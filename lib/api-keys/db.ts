import { getMySQLPool } from '@/lib/mysql/pool';
import crypto from 'crypto';

export interface APIKey {
  id: string;
  user_id: string;
  name: string | null;
  key_prefix: string;
  scopes: string[];
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export async function createAPIKey(
  userId: string,
  name: string | null = null,
  scopes: string[] = [],
  expiresAt: Date | null = null
): Promise<{ key: string; apiKey: APIKey }> {
  const pool = getMySQLPool();
  
  // Generate key
  const keyString = `ovmon_${crypto.randomBytes(32).toString('hex')}`;
  const keyPrefix = keyString.substring(0, 10);
  const keyHash = crypto.createHash('sha256').update(keyString).digest('hex');
  
  const [result] = await pool.query<any>(
    `INSERT INTO api_keys (user_id, name, key_prefix, key_hash, scopes, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, name, keyPrefix, keyHash, JSON.stringify(scopes), expiresAt || null]
  );
  
  const keyId = (result as any).insertId;
  const apiKey = await getAPIKeyById(String(keyId));
  if (!apiKey) throw new Error('Failed to create API key');
  
  return { key: keyString, apiKey };
}

export async function getAPIKeyById(id: string): Promise<APIKey | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.query<any[]>(
    `SELECT id, user_id, name, key_prefix, scopes, rate_limit, last_used_at, expires_at, is_active, created_at
     FROM api_keys WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  return formatAPIKey(rows[0]);
}

export async function validateAPIKey(keyString: string): Promise<APIKey | null> {
  const pool = getMySQLPool();
  const keyHash = crypto.createHash('sha256').update(keyString).digest('hex');
  
  const [rows] = await pool.query<any[]>(
    `SELECT id, user_id, name, key_prefix, scopes, rate_limit, last_used_at, expires_at, is_active, created_at
     FROM api_keys WHERE key_hash = ? AND is_active = TRUE`,
    [keyHash]
  );
  
  if (rows.length === 0) return null;
  
  const apiKey = formatAPIKey(rows[0]);
  
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return null;
  }
  
  // Update last_used_at
  await pool.query(
    `UPDATE api_keys SET last_used_at = NOW() WHERE id = ?`,
    [apiKey.id]
  );
  
  return apiKey;
}

function formatAPIKey(row: any): APIKey {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    name: row.name,
    key_prefix: row.key_prefix,
    scopes: row.scopes ? JSON.parse(row.scopes) : [],
    rate_limit: row.rate_limit,
    last_used_at: row.last_used_at?.toISOString?.() || row.last_used_at,
    expires_at: row.expires_at?.toISOString?.() || row.expires_at,
    is_active: Boolean(row.is_active),
    created_at: row.created_at?.toISOString?.() || row.created_at,
  };
}
