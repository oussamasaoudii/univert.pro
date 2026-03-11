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

export function getTrustedOrigins(requestUrl: string): Set<string> {
  const trustedOrigins = new Set<string>();

  addOrigin(trustedOrigins, process.env.NEXT_PUBLIC_APP_URL);
  addOriginList(trustedOrigins, process.env.ALLOWED_REQUEST_ORIGINS);

  if (isPreviewLikeRuntime()) {
    addOrigin(trustedOrigins, requestUrl);
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
  const candidateOrigin = normalizeOrigin(origin) || normalizeOrigin(referer);
  if (!candidateOrigin) {
    return false;
  }

  return getTrustedOrigins(requestUrl).has(candidateOrigin);
}
