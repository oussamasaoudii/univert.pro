import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

/**
 * Default database configuration (fallback when environment variables are not set)
 */
const DEFAULT_DB_CONFIG = {
  host: "72.60.90.147",
  port: 3306,
  database: "ovmon_db",
  username: "univert_v0_temp",
  password: "d6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b",
};

/**
 * Get database configuration with fallback to defaults
 */
function getDBConfig() {
  return {
    host: process.env.DB_HOST || DEFAULT_DB_CONFIG.host,
    port: parseInt(process.env.DB_PORT || String(DEFAULT_DB_CONFIG.port), 10),
    database: process.env.DB_DATABASE || DEFAULT_DB_CONFIG.database,
    username: process.env.DB_USERNAME || DEFAULT_DB_CONFIG.username,
    password: process.env.DB_PASSWORD || DEFAULT_DB_CONFIG.password,
  };
}

/**
 * Check if MySQL environment variables are configured (always true with defaults)
 */
export function isMySQLConfigured(): boolean {
  // Always return true since we have default configuration
  return true;
}

/**
 * Sanitize the database host by removing any whitespace
 */
function sanitizeHost(host: string): string {
  return host.replace(/\s+/g, "");
}

/**
 * Detect if this is a TiDB Cloud connection (requires SSL)
 */
function isTiDBCloud(): boolean {
  const config = getDBConfig();
  const host = sanitizeHost(config.host);
  return host.includes("tidbcloud.com") || host.includes("tidb.cloud");
}

/**
 * Close and reset the MySQL pool to force reconnection and refresh metadata
 */
export async function resetMySQLPool(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
    } catch (error) {
      console.error("[MySQL] Error closing pool:", error);
    }
    pool = null;
  }
}
export function getMySQLPool(): mysql.Pool | null {
  if (pool) return pool;

  const config = getDBConfig();
  const isTiDB = isTiDBCloud();
  // Sanitize host to remove any whitespace that might have been accidentally added
  const host = sanitizeHost(config.host);
  // For TiDB Cloud, always use 'ovmon_db' database (ignore 'sys' from env var)
  const database = isTiDB && config.database === 'sys' 
    ? 'ovmon_db' 
    : config.database;

  pool = mysql.createPool({
    host,
    port: config.port,
    user: config.username,
    password: config.password,
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
    console.log(`[MySQL] Connected to ${host}:${config.port}/${database}`);
  }

  return pool;
}

