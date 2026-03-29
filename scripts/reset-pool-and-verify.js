import mysql from "mysql2/promise";

const config = {
  host: process.env.DB_HOST || "72.60.90.147",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USERNAME || "univert_v0_temp",
  password: process.env.DB_PASSWORD || "d6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b",
  database: process.env.DB_DATABASE || "ovmon_db",
};

async function main() {
  let conn;
  try {
    console.log("[v0] Connecting to database to verify auth_rate_limits table...");
    conn = await mysql.createConnection(config);

    // Check the table structure
    const [rows] = await conn.query(
      "DESCRIBE auth_rate_limits"
    );
    
    console.log("[v0] Current auth_rate_limits columns:");
    rows.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type}${row.Null === 'NO' ? ' NOT NULL' : ''}`);
    });

    // Try a test insert to verify it works
    const testKey = "test_" + Date.now();
    await conn.query(
      "INSERT INTO auth_rate_limits (key_hash, scope, attempts, window_started_at) VALUES (?, ?, ?, NOW())",
      [testKey, "test", 1]
    );
    console.log("[v0] ✓ Test insert successful - table is working correctly");

    // Clean up test data
    await conn.query("DELETE FROM auth_rate_limits WHERE key_hash LIKE 'test_%'");

  } catch (error) {
    console.error("[v0] Error:", error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();
