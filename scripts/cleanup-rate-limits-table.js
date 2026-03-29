import mysql from 'mysql2/promise';

const config = {
  host: '72.60.90.147',
  port: 3306,
  user: 'univert_v0_temp',
  password: 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b',
  database: 'ovmon_db'
};

async function cleanupRateLimitsTable() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('[v0] Dropping old auth_rate_limits table...');
    await connection.query('DROP TABLE IF EXISTS auth_rate_limits');
    
    console.log('[v0] Creating new auth_rate_limits table with correct schema...');
    await connection.query(`
      CREATE TABLE auth_rate_limits (
        key_hash CHAR(64) NOT NULL PRIMARY KEY,
        scope VARCHAR(64) NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        window_started_at DATETIME NOT NULL,
        blocked_until DATETIME NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_auth_rate_limits_scope (scope),
        INDEX idx_auth_rate_limits_blocked_until (blocked_until)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('[v0] ✓ auth_rate_limits table recreated successfully');
  } catch (error) {
    console.error('[v0] Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

cleanupRateLimitsTable().catch(err => {
  console.error('[v0] Failed:', err);
  process.exit(1);
});
