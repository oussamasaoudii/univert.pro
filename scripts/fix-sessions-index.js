import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "72.60.90.147",
  port: 3306,
  user: "univert_v0_temp",
  password: "d6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b",
  database: "ovmon_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function fixUserSessionsIndex() {
  try {
    console.log("[v0] Starting user_sessions token index fix...");
    
    // First, check for duplicate NULL/empty tokens
    const [sessions] = await pool.query(
      "SELECT token, COUNT(*) as count FROM user_sessions WHERE token IS NULL OR token = '' GROUP BY token HAVING count > 1"
    );
    
    console.log("[v0] Found duplicate entries:", sessions);
    
    // Delete all sessions with NULL or empty tokens except the first one
    await pool.query(
      `DELETE FROM user_sessions WHERE (token IS NULL OR token = '') 
       AND id NOT IN (
         SELECT id FROM (
           SELECT id FROM user_sessions WHERE token IS NULL OR token = '' LIMIT 1
         ) AS t
       )`
    );
    
    console.log("[v0] Cleaned up duplicate NULL/empty tokens");
    
    // Now try to create the unique index
    await pool.query(
      "CREATE UNIQUE INDEX `idx_sessions_token` ON `user_sessions` (`token`)"
    );
    
    console.log("[v0] ✓ Unique index created successfully!");
    
  } catch (error) {
    console.error("[v0] Error:", error instanceof Error ? error.message : String(error));
  } finally {
    await pool.end();
  }
}

fixUserSessionsIndex();
