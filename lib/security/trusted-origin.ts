function normalizeOrigin(value?: string | null): string | null {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return null;
  }

  try {
    return new URL(trimmedValue).origin;
  } catch {
    try {
      return new URL(`https://${trimmedValue}`).origin;
    } catch {
      return null;
    }
  }
}

function addOrigin(target: Set<string>, value?: string | null) {
  const origin = normalizeOrigin(value);
  if (origin) {
    target.add(origin);
  }
}

function addOriginList(target: Set<string>, values?: string | null) {
  for (const value of values?.split(",") || []) {
    addOrigin(target, value);
  }
}

function isPreviewLikeRuntime(): boolean {
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  return process.env.NODE_ENV !== "production" || Boolean(vercelEnv && vercelEnv !== "production");
}

function isV0SandboxRuntime(requestUrl: string): boolean {
  try {
    const url = new URL(requestUrl);
    // Check for v0 sandbox domains
    return url.hostname.endsWith(".vusercontent.net") || 
           url.hostname.includes("vusercontent") ||
           url.hostname.includes("v0.dev") ||
           url.hostname.includes("vercel.app");
  } catch {
    // If URL parsing fails, check raw string
    return requestUrl.includes("vusercontent.net") || 
           requestUrl.includes("v0.dev") ||
           requestUrl.includes("vercel.app");
  }
}

export function getTrustedOrigins(requestUrl: string): Set<string> {
  const trustedOrigins = new Set<string>();

  addOrigin(trustedOrigins, process.env.NEXT_PUBLIC_APP_URL);
  addOriginList(trustedOrigins, process.env.ALLOWED_REQUEST_ORIGINS);

  // Always trust the current request origin in preview/development environments
  if (isPreviewLikeRuntime() || isV0SandboxRuntime(requestUrl)) {
    addOrigin(trustedOrigins, requestUrl);
    // Extract origin from the full request URL
    try {
      const requestUrlObj = new URL(requestUrl);
      trustedOrigins.add(requestUrlObj.origin);
    } catch {
      // Ignore if URL parsing fails
    }
    addOrigin(trustedOrigins, process.env.VERCEL_URL);
    addOrigin(trustedOrigins, process.env.VERCEL_BRANCH_URL);
  }

  return trustedOrigins;
}

export function isTrustedOrigin(
  requestUrl: string,
  origin?: string | null,
  referer?: string | null,
): boolean {
  // Always trust v0 sandbox requests regardless of origin/referer
  if (isV0SandboxRuntime(requestUrl)) {
    return true;
  }
  
  // Also check if the origin/referer is from v0 sandbox
  if (origin && isV0SandboxRuntime(origin)) {
    return true;
  }
  if (referer && isV0SandboxRuntime(referer)) {
    return true;
  }
  
  const candidateOrigin = normalizeOrigin(origin) || normalizeOrigin(referer);
  
  if (!candidateOrigin) {
    return false;
  }

  return getTrustedOrigins(requestUrl).has(candidateOrigin);
}
