import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

/**
 * Check if MySQL environment variables are configured
 */
export function isMySQLConfigured(): boolean {
  return Boolean(
    process.env.DB_HOST &&
    process.env.DB_PORT &&
    process.env.DB_DATABASE &&
    process.env.DB_USERNAME &&
    process.env.DB_PASSWORD
  );
}

/**
 * Sanitize the database host by removing any whitespace
 */
function sanitizeHost(host: string | undefined): string {
  return (host || "127.0.0.1").replace(/\s+/g, "");
}

/**
 * Detect if this is a TiDB Cloud connection (requires SSL)
 */
function isTiDBCloud(): boolean {
  const host = sanitizeHost(process.env.DB_HOST);
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
    console.warn("[MySQL] Database not configured. Missing DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, or DB_PASSWORD environment variables.");
    return null;
  }

  const isTiDB = isTiDBCloud();
  const defaultPort = isTiDB ? "4000" : "3306";
  // Sanitize host to remove any whitespace that might have been accidentally added
  const host = sanitizeHost(process.env.DB_HOST);
  // For TiDB Cloud, always use 'ovmon_db' database (ignore 'sys' from env var)
  const database = isTiDB && process.env.DB_DATABASE === 'sys' 
    ? 'ovmon_db' 
    : process.env.DB_DATABASE!;

  pool = mysql.createPool({
    host,
    port: parseInt(process.env.DB_PORT || defaultPort, 10),
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database,
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
  } else {
    console.log(`[MySQL] Connected to ${host}:${process.env.DB_PORT}/${database}`);
  }

  return pool;
}

