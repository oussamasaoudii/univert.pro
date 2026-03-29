import mysql from 'mysql2/promise';
import crypto from 'crypto';

const pool = mysql.createPool({
  host: '72.60.90.147',
  port: 3306,
  user: 'univert_v0_temp',
  password: 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b',
  database: 'ovmon_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function toMySqlDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function testRateLimit() {
  try {
    console.log('[v0] Testing rate limit insert...');
    
    const keyHash = crypto.createHash('sha256').update('test-key').digest('hex');
    const now = new Date();
    const now_timestamp = toMySqlDateTime(now);
    const windowStartedAt = toMySqlDateTime(now);
    
    await pool.query(
      `
        INSERT INTO auth_rate_limits (
          key_hash,
          scope,
          attempts,
          window_started_at,
          blocked_until,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          attempts = attempts + 1,
          updated_at = NOW()
      `,
      [
        keyHash,
        'test',
        1,
        windowStartedAt,
        null,
        now_timestamp,
        now_timestamp,
      ],
    );
    
    console.log('[v0] Rate limit insert successful!');
    
    // Verify the insert
    const [rows] = await pool.query(
      'SELECT * FROM auth_rate_limits WHERE key_hash = ?',
      [keyHash]
    );
    
    console.log('[v0] Verification:', rows[0]);
    
  } catch (error) {
    console.error('[v0] Error:', error.message);
  } finally {
    await pool.end();
  }
}

testRateLimit();
