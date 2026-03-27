export function isPreviewMode(): boolean {
  if (process.env.PREVIEW_MODE?.trim().toLowerCase() === "true") {
    return true;
  }

  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnv === "preview") {
    return true;
  }

  // Detect v0 sandbox environment
  if (process.env.VERCEL_URL?.includes("vusercontent.net")) {
    return true;
  }

  // Check if MySQL is not configured (common in sandbox/preview environments)
  const hasMySqlConfig = Boolean(
    process.env.MYSQL_USER &&
    process.env.MYSQL_PASSWORD &&
    process.env.MYSQL_DATABASE
  );
  if (!hasMySqlConfig && process.env.NODE_ENV !== "production") {
    return true;
  }

  return process.env.NODE_ENV === "development";
}
