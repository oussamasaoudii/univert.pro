import { appendAapanelSignature } from "@/lib/aapanel/signing";
import type {
  AapanelApiResult,
  AapanelClientConfig,
  AapanelRequestOptions,
  AapanelSitePayload,
  AapanelSiteRecord,
  AapanelSiteCreationResult,
  AapanelDatabaseCreationResult,
  AapanelSslCertificateResult,
  AapanelSslInfoResult,
} from "@/lib/aapanel/types";
import { getAapanelConfig } from "@/lib/aapanel/config";
import {
  buildAapanelCreateDatabasePayload,
  buildAapanelCreateSitePayload,
} from "@/lib/aapanel/request-builders";

type UnknownRecord = Record<string, unknown>;

function toSearchParams(
  data: Record<string, string | number | boolean | null | undefined> = {},
) {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    params.set(key, String(value));
  });
  return params;
}

function asMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "aaPanel request failed";
  }

  const record = payload as UnknownRecord;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }
  if (record.message && typeof record.message === "object") {
    const messageRecord = record.message as UnknownRecord;
    if (typeof messageRecord.result === "string" && messageRecord.result.trim()) {
      return messageRecord.result;
    }
    if (typeof messageRecord.msg === "string" && messageRecord.msg.trim()) {
      return messageRecord.msg;
    }
  }
  if (typeof record.msg === "string" && record.msg.trim()) {
    return record.msg;
  }
  if (typeof record.result === "string" && record.result.trim()) {
    return record.result;
  }
  if (record.siteStatus === true || record.databaseStatus === true || record.status === true) {
    return "success";
  }
  if (
    typeof record.status === "number" &&
    record.status === 0 &&
    record.message &&
    typeof record.message === "object"
  ) {
    return "success";
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error;
  }
  return "aaPanel request failed";
}

function isSuccessPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const record = payload as UnknownRecord;
  if (record.siteStatus === true || record.databaseStatus === true || record.ftpStatus === true) {
    return true;
  }
  if (record.status === true || record.success === true) {
    return true;
  }
  if (typeof record.status === "number") {
    if (record.status === 1) {
      return true;
    }
    if (
      record.status === 0 &&
      ((record.message && typeof record.message === "object") || "data" in record)
    ) {
      return true;
    }
    return false;
  }
  if (typeof record.msg === "string") {
    const normalized = record.msg.trim().toLowerCase();
    return normalized === "success" || normalized.includes("success");
  }
  return false;
}

function extractData<T>(payload: unknown): T | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as UnknownRecord;
  if ("data" in record) {
    return record.data as T;
  }
  if (
    typeof record.status === "number" &&
    record.status === 0 &&
    "message" in record &&
    record.message &&
    typeof record.message === "object"
  ) {
    return record.message as T;
  }
  return payload as T;
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as UnknownRecord;
}

function asSiteRecord(row: unknown): AapanelSiteRecord | null {
  const record = asRecord(row);
  if (!record) {
    return null;
  }

  const id = Number(record.id ?? record.ID ?? 0);
  const name =
    typeof record.name === "string"
      ? record.name
      : typeof record.domain === "string"
        ? record.domain
        : typeof record.site_name === "string"
          ? record.site_name
          : "";

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    path:
      typeof record.path === "string"
        ? record.path
        : typeof record.root_path === "string"
          ? record.root_path
          : "",
    ps: typeof record.ps === "string" ? record.ps : null,
    addtime: typeof record.addtime === "string" ? record.addtime : undefined,
    status:
      typeof record.status === "string" ||
      typeof record.status === "number" ||
      typeof record.status === "boolean"
        ? record.status
        : undefined,
    raw: row,
  };
}

export class AapanelClient {
  private readonly config: AapanelClientConfig;

  constructor(config?: Partial<AapanelClientConfig>) {
    const env = getAapanelConfig();
    this.config = {
      panelOrigin: config?.panelOrigin || env.baseUrl,
      apiKey: config?.apiKey || env.apiKey,
      timeoutMs: config?.timeoutMs || env.requestTimeoutMs,
    };
  }

  async request<T>(options: AapanelRequestOptions): Promise<AapanelApiResult<T>> {
    const requestTargets = this.buildTargets(options.resource, options.action);
    let lastError: Error | null = null;

    for (const target of requestTargets) {
      try {
        const payload = await this.executeRequest<T>(target, options);
        return payload;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError || new Error("aaPanel request failed");
  }

  async createSite(payload: AapanelSitePayload) {
    const result = await this.request<UnknownRecord>({
      resource: "site",
      action: "AddSite",
      method: "POST",
      data: buildAapanelCreateSitePayload(payload),
    });

    const createdSite = await this.getSiteByName(payload.domain);

    return {
      siteId: createdSite?.id,
      siteName: payload.domain,
      rootPath: payload.rootPath,
      raw: result.raw,
    } satisfies AapanelSiteCreationResult;
  }

  async setSitePath(siteId: number, rootPath: string) {
    return this.request({
      resource: "site",
      action: "SetPath",
      method: "POST",
      data: {
        id: siteId,
        path: rootPath,
      },
    });
  }

  async addDomain(siteId: number, primaryDomain: string, domain: string) {
    return this.request({
      resource: "site",
      action: "AddDomain",
      method: "POST",
      data: {
        id: siteId,
        webname: primaryDomain,
        domain,
      },
    });
  }

  async removeDomain(siteId: number, primaryDomain: string, domain: string, port: number = 80) {
    return this.request({
      resource: "site",
      action: "DelDomain",
      method: "POST",
      data: {
        id: siteId,
        webname: primaryDomain,
        domain,
        port,
      },
    });
  }

  async createDatabase(input: {
    databaseName: string;
    username: string;
    password: string;
  }) {
    const env = getAapanelConfig();
    const result = await this.request<UnknownRecord>({
      resource: "database",
      action: "AddDatabase",
      method: "POST",
      data: buildAapanelCreateDatabasePayload({
        databaseName: input.databaseName,
        username: input.username,
        password: input.password,
        host: env.defaultDatabaseHost,
      }),
    });

    return {
      databaseName: input.databaseName,
      username: input.username,
      password: input.password,
      host: env.defaultDatabaseHost,
      port: env.defaultDatabasePort,
      raw: result.raw,
    } satisfies AapanelDatabaseCreationResult;
  }

  async createLetsEncryptCertificate(input: {
    siteName: string;
    domains: string[];
    email?: string | null;
    dnsapi?: string;
    dnssleep?: number;
  }) {
    const result = await this.request<UnknownRecord>({
      resource: "site",
      action: "CreateLet",
      method: "POST",
      data: {
        siteName: input.siteName,
        domains: JSON.stringify(input.domains),
        email: input.email || undefined,
        dnsapi: input.dnsapi,
        dnssleep: input.dnssleep,
      },
    });

    return {
      siteName: input.siteName,
      domains: input.domains,
      raw: result.raw,
    } satisfies AapanelSslCertificateResult;
  }

  async enableHttpToHttps(siteName: string) {
    return this.request({
      resource: "site",
      action: "HttpToHttps",
      method: "POST",
      data: {
        siteName,
      },
    });
  }

  async getSsl(siteName: string) {
    const result = await this.request<UnknownRecord>({
      resource: "site",
      action: "GetSSL",
      method: "POST",
      data: {
        siteName,
      },
    });

    return {
      siteName,
      raw: result.raw,
    } satisfies AapanelSslInfoResult;
  }

  async deleteSite(siteId: number, siteName: string, removePath: boolean = true) {
    return this.request({
      resource: "site",
      action: "DeleteSite",
      method: "POST",
      data: {
        id: siteId,
        webname: siteName,
        path: removePath ? 1 : 0,
      },
    });
  }

  async getSystemTotal() {
    return this.request<UnknownRecord>({
      resource: "system",
      action: "GetSystemTotal",
      method: "POST",
    });
  }

  async listSites(input?: { search?: string; limit?: number }) {
    const result = await this.request<unknown>({
      resource: "data",
      action: "getData",
      method: "POST",
      data: {
        table: "sites",
        limit: input?.limit ?? 100,
        p: 1,
        search: input?.search || "",
        order: "id desc",
        type: -1,
      },
    });

    const data = extractData<unknown>(result.raw);
    const rows = Array.isArray(data)
      ? data
      : Array.isArray((data as UnknownRecord | null)?.data)
        ? ((data as UnknownRecord).data as unknown[])
        : Array.isArray((data as UnknownRecord | null)?.list)
          ? ((data as UnknownRecord).list as unknown[])
          : [];

    return rows.map(asSiteRecord).filter(Boolean) as AapanelSiteRecord[];
  }

  async getSiteByName(domain: string) {
    const candidates = await this.listSites({
      search: domain,
      limit: 20,
    });

    const normalizedDomain = domain.trim().toLowerCase();
    return (
      candidates.find((site) => site.name.trim().toLowerCase() === normalizedDomain) ||
      candidates.find((site) => site.name.trim().toLowerCase().includes(normalizedDomain)) ||
      null
    );
  }

  private async executeRequest<T>(
    target: string,
    options: AapanelRequestOptions,
  ): Promise<AapanelApiResult<T>> {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || this.config.timeoutMs;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = new URL(target, this.config.panelOrigin);
      const params = toSearchParams({ action: options.action });
      appendAapanelSignature(params, { apiKey: this.config.apiKey });
      url.search = params.toString();

      const bodyParams = toSearchParams(options.data);
      bodyParams.set("action", options.action);

      const response = await fetch(url.toString(), {
        method: options.method || "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/plain, */*",
          "User-Agent": "Ovmon-aaPanel-Provider/1.0",
        },
        body: options.method === "GET" ? undefined : bodyParams.toString(),
        signal: controller.signal,
      });

      const text = await response.text();
      const payload = text ? safeJsonParse(text) : {};

      if (!response.ok) {
        throw new Error(
          `aaPanel HTTP ${response.status} for ${options.action}: ${asMessage(payload)}`,
        );
      }

      if (!isSuccessPayload(payload)) {
        throw new Error(`aaPanel ${options.action} failed: ${asMessage(payload)}`);
      }

      return {
        success: true,
        data: extractData<T>(payload),
        message: asMessage(payload),
        raw: payload,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildTargets(resource: string, action: string) {
    const query = `action=${encodeURIComponent(action)}`;
    return [
      `/${resource}?${query}`,
      `/v2/${resource}?${query}`,
    ];
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return { msg: value };
  }
}
