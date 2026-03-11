export function getPlatformRootDomain() {
  const candidates = [
    process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN,
    process.env.NEXT_PUBLIC_APP_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate || !candidate.trim()) {
      continue;
    }

    try {
      const hostname = new URL(candidate).hostname.replace(/^www\./, "");
      if (hostname) {
        return hostname;
      }
    } catch {
      const normalized = candidate.trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
      if (normalized) {
        return normalized.split("/")[0] || normalized;
      }
    }
  }

  return "univert.pro";
}

export function getDisplayDomain(input: {
  subdomain?: string | null;
  customDomain?: string | null;
  liveUrl?: string | null;
}) {
  if (input.customDomain?.trim()) {
    return input.customDomain.trim();
  }

  if (input.liveUrl?.trim()) {
    try {
      return new URL(input.liveUrl).hostname;
    } catch {
      return input.liveUrl.trim().replace(/^https?:\/\//, "").split("/")[0] || input.liveUrl.trim();
    }
  }

  if (input.subdomain?.trim()) {
    return `${input.subdomain.trim()}.${getPlatformRootDomain()}`;
  }

  return "-";
}
