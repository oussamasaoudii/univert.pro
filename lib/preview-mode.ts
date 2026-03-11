export function isPreviewMode(): boolean {
  if (process.env.PREVIEW_MODE?.trim().toLowerCase() === "true") {
    return true;
  }

  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnv === "preview") {
    return true;
  }

  return process.env.NODE_ENV === "development";
}
