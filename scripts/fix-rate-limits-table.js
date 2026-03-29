import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "72.60.90.147",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USERNAME || "univert_v0_temp",
  password: process.env.DB_PASSWORD || "d6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b",
  database: process.env.DB_DATABASE || "ovmon_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function fixRateLimitsTable() {
  try {
    console.log("[v0] Checking auth_rate_limits table structure...");
    
    // Get current table structure
    const [columns] = await pool.query(
      "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'auth_rate_limits' AND TABLE_SCHEMA = ?"
      , [process.env.DB_DATABASE || "ovmon_db"]
    );

    console.log("[v0] Current columns:", columns);

    // Check if table has old 'id' column
    const hasIdColumn = columns.some(c => c.COLUMN_NAME === "id");
    const hasKeyHashColumn = columns.some(c => c.COLUMN_NAME === "key_hash");

    if (hasIdColumn && !hasKeyHashColumn) {
      console.log("[v0] Dropping old auth_rate_limits table with incorrect schema...");
      await pool.query("DROP TABLE IF EXISTS auth_rate_limits");
      
      console.log("[v0] Creating new auth_rate_limits table with correct schema...");
      await pool.query(`
        CREATE TABLE auth_rate_limits (
          key_hash CHAR(64) NOT NULL PRIMARY KEY,
          scope VARCHAR(64) NOT NULL,
          attempts INT NOT NULL DEFAULT 0,
          window_started_at DATETIME NOT NULL,
          blocked_until DATETIME,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          INDEX idx_auth_rate_limits_scope (scope),
          INDEX idx_auth_rate_limits_blocked_until (blocked_until)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log("[v0] ✓ auth_rate_limits table fixed successfully");
    } else if (hasKeyHashColumn) {
      console.log("[v0] ✓ auth_rate_limits table already has correct schema");
    } else {
      console.log("[v0] ⚠ Unexpected table structure - dropping and recreating...");
      await pool.query("DROP TABLE IF EXISTS auth_rate_limits");
      
      await pool.query(`
        CREATE TABLE auth_rate_limits (
          key_hash CHAR(64) NOT NULL PRIMARY KEY,
          scope VARCHAR(64) NOT NULL,
          attempts INT NOT NULL DEFAULT 0,
          window_started_at DATETIME NOT NULL,
          blocked_until DATETIME,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          INDEX idx_auth_rate_limits_scope (scope),
          INDEX idx_auth_rate_limits_blocked_until (blocked_until)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log("[v0] ✓ auth_rate_limits table recreated with correct schema");
    }

    await pool.end();
    console.log("[v0] Done!");
  } catch (error) {
    console.error("[v0] Error:", error);
    await pool.end();
    process.exit(1);
  }
}

fixRateLimitsTable();
