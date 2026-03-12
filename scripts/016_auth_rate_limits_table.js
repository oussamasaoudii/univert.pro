import mysql from "mysql2/promise";

const config = {
  host: process.env.MYSQL_HOST || "gateway01.eu-central-1.prod.aws.tidbcloud.com",
  port: parseInt(process.env.MYSQL_PORT || "4000", 10),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: "ovmon",
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
};

async function main() {
  console.log("Creating auth_rate_limits table in ovmon database...");
  
  if (!config.password) {
    console.error("ERROR: MYSQL_PASSWORD environment variable is not set");
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log("Connected successfully!");

    // Create auth_rate_limits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS auth_rate_limits (
        id VARCHAR(36) PRIMARY KEY,
        scope VARCHAR(100) NOT NULL,
        identifier VARCHAR(255) NOT NULL,
        count INT DEFAULT 0,
        window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        blocked_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_scope_identifier (scope, identifier),
        INDEX idx_scope (scope),
        INDEX idx_blocked (blocked_until)
      )
    `);
    console.log("Created auth_rate_limits table");

    // Verify table was created
    const [tables] = await connection.query("SHOW TABLES LIKE 'auth_rate_limits'");
    console.log("Table exists:", tables.length > 0);

    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
