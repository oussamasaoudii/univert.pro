import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

/**
 * Check if MySQL environment variables are configured
 */
export function isMySQLConfigured(): boolean {
  return Boolean(
    process.env.MYSQL_USER &&
    process.env.MYSQL_PASSWORD &&
    process.env.MYSQL_DATABASE
  );
}

/**
 * Detect if this is a TiDB Cloud connection (requires SSL)
 */
function isTiDBCloud(): boolean {
  const host = process.env.MYSQL_HOST || "";
  return host.includes("tidbcloud.com") || host.includes("tidb.cloud");
}

/**
 * Get the MySQL pool. Returns null if environment variables are not configured.
 * Supports TiDB Cloud with automatic SSL configuration.
 */
export function getMySQLPool(): mysql.Pool | null {
  if (pool) return pool;

  // Return null if MySQL is not configured
  if (!isMySQLConfigured()) {
    console.warn("[MySQL] Database not configured. Missing MYSQL_USER, MYSQL_PASSWORD, or MYSQL_DATABASE environment variables.");
    return null;
  }

  const isTiDB = isTiDBCloud();
  const defaultPort = isTiDB ? "4000" : "3306";

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT || defaultPort, 10),
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "Z",
    // TiDB Cloud requires SSL
    ...(isTiDB && {
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    }),
  });

  if (isTiDB) {
    console.log("[MySQL] Connected to TiDB Cloud with SSL enabled");
  }

  return pool;
}

