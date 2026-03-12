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
 * Get the MySQL pool. Returns null if environment variables are not configured.
 */
export function getMySQLPool(): mysql.Pool | null {
  if (pool) return pool;

  // Return null if MySQL is not configured
  if (!isMySQLConfigured()) {
    console.warn("[MySQL] Database not configured. Missing MYSQL_USER, MYSQL_PASSWORD, or MYSQL_DATABASE environment variables.");
    return null;
  }

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "Z",
  });

  return pool;
}

