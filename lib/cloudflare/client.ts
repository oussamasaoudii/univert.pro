type CloudflareHeaders = Record<string, string>;

type CloudflareEnvelope<T> = {
  success: boolean;
  errors?: Array<{ code?: number; message?: string }>;
  messages?: Array<{ code?: number; message?: string }>;
  result: T;
};

export type CloudflareDnsRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
};

export type CloudflareSslMode = "off" | "flexible" | "full" | "strict";

function readOptional(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readRequired(name: string) {
  const value = readOptional(name);
  if (!value) {
    throw new Error(`Missing required Cloudflare environment variable: ${name}`);
  }
  return value;
}

function readNumber(name: string, fallback: number) {
  const value = readOptional(name);
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid Cloudflare numeric environment variable: ${name}`);
  }

  return parsed;
}

function readBoolean(name: string, fallback: boolean) {
  const value = readOptional(name);
  if (!value) {
    return fallback;
  }

  return value === "true";
}

function buildHeaders(): CloudflareHeaders {
  const email = readOptional("CLOUDFLARE_EMAIL");
  const globalApiKey = readOptional("CLOUDFLARE_GLOBAL_API_KEY");

  if (email && globalApiKey) {
    return {
      "X-Auth-Email": email,
      "X-Auth-Key": globalApiKey,
      "Content-Type": "application/json",
    };
  }

  const apiToken = readRequired("CLOUDFLARE_API_TOKEN");
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
}

export function hasCloudflareDnsAccess() {
  return Boolean(
    readOptional("CLOUDFLARE_ZONE_ID") &&
      (readOptional("CLOUDFLARE_API_TOKEN") ||
        (readOptional("CLOUDFLARE_EMAIL") && readOptional("CLOUDFLARE_GLOBAL_API_KEY"))),
  );
}

export class CloudflareClient {
  private readonly baseUrl =
    readOptional("CLOUDFLARE_API_BASE_URL") || "https://api.cloudflare.com/client/v4";
  private readonly zoneId = readRequired("CLOUDFLARE_ZONE_ID");
  private readonly platformRootDomain = readRequired("PLATFORM_ROOT_DOMAIN");
  private readonly defaultProxied = readBoolean("CLOUDFLARE_PROXIED", true);
  private readonly defaultTtl = readNumber("CLOUDFLARE_DEFAULT_TTL", 1);
  private readonly headers = buildHeaders();

  async ensurePlatformWildcardARecord(ipAddress: string) {
    const name = `*.${this.platformRootDomain}`;
    return this.upsertDnsRecord({
      type: "A",
      name,
      content: ipAddress,
      proxied: this.defaultProxied,
      ttl: this.defaultTtl,
    });
  }

  async ensureHostnameARecord(input: {
    name: string;
    ipAddress: string;
    proxied?: boolean;
    ttl?: number;
  }) {
    return this.upsertDnsRecord({
      type: "A",
      name: input.name,
      content: input.ipAddress,
      proxied: input.proxied,
      ttl: input.ttl,
    });
  }

  async setSslMode(mode: CloudflareSslMode) {
    return this.patchZoneSetting("ssl", { value: mode });
  }

  async setAlwaysUseHttps(enabled: boolean) {
    return this.patchZoneSetting("always_use_https", {
      value: enabled ? "on" : "off",
    });
  }

  async getDnsRecordByName(name: string, type?: string) {
    const result = await this.request<CloudflareDnsRecord[]>(
      `/zones/${this.zoneId}/dns_records`,
      {
        searchParams: {
          name,
          ...(type ? { type } : {}),
          per_page: "100",
        },
      },
    );

    return result[0] || null;
  }

  async upsertDnsRecord(input: {
    type: "A" | "AAAA" | "CNAME" | "TXT";
    name: string;
    content: string;
    proxied?: boolean;
    ttl?: number;
  }) {
    const existing = await this.getDnsRecordByName(input.name, input.type);
    const payload = {
      type: input.type,
      name: input.name,
      content: input.content,
      proxied: input.proxied ?? this.defaultProxied,
      ttl: input.ttl ?? this.defaultTtl,
    };

    if (!existing) {
      return this.request<CloudflareDnsRecord>(`/zones/${this.zoneId}/dns_records`, {
        method: "POST",
        body: payload,
      });
    }

    if (
      existing.content === payload.content &&
      Boolean(existing.proxied) === Boolean(payload.proxied) &&
      Number(existing.ttl || 1) === Number(payload.ttl)
    ) {
      return existing;
    }

    return this.request<CloudflareDnsRecord>(
      `/zones/${this.zoneId}/dns_records/${existing.id}`,
      {
        method: "PUT",
        body: payload,
      },
    );
  }

  private async patchZoneSetting(setting: string, body: Record<string, unknown>) {
    return this.request(`/zones/${this.zoneId}/settings/${setting}`, {
      method: "PATCH",
      body,
    });
  }

  private async request<T>(
    pathname: string,
    init: {
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      body?: Record<string, unknown>;
      searchParams?: Record<string, string>;
    } = {},
  ): Promise<T> {
    const normalizedBaseUrl = this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`;
    const normalizedPathname = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    const url = new URL(normalizedPathname, normalizedBaseUrl);
    Object.entries(init.searchParams || {}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url, {
      method: init.method || "GET",
      headers: this.headers,
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as CloudflareEnvelope<T> | null;
    if (!response.ok || !payload?.success) {
      const message =
        payload?.errors?.map((entry) => entry.message).filter(Boolean).join("; ") ||
        payload?.messages?.map((entry) => entry.message).filter(Boolean).join("; ") ||
        `Cloudflare API request failed with status ${response.status}`;
      throw new Error(message);
    }

    return payload.result;
  }
}
