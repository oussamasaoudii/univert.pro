import path from "node:path";
import type {
  AapanelEnvConfig,
  DeploymentProfile,
  DeploymentProfileId,
} from "@/lib/aapanel/types";

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw || !raw.trim()) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }
  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (!raw || !raw.trim()) {
    return fallback;
  }
  return raw === "true";
}

let cachedConfig: AapanelEnvConfig | null = null;

export function getAapanelConfig(): AapanelEnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const baseUrl = readRequired("AAPANEL_BASE_URL");
  const url = new URL(baseUrl);
  const port = readNumber("AAPANEL_PORT", Number(url.port || 7800));
  const panelOrigin = `${url.protocol}//${url.hostname}${port ? `:${port}` : ""}`;
  const protocol =
    (process.env.DEFAULT_PROTOCOL?.trim().toLowerCase() as "http" | "https" | undefined) ||
    "https";

  cachedConfig = {
    baseUrl: panelOrigin,
    port,
    apiKey: readRequired("AAPANEL_API_KEY"),
    requestTimeoutMs: readNumber("AAPANEL_REQUEST_TIMEOUT", 30_000),
    defaultSitePath: process.env.AAPANEL_DEFAULT_SITE_PATH?.trim() || "/www/wwwroot",
    defaultPhpVersion: process.env.AAPANEL_DEFAULT_PHP_VERSION?.trim() || "82",
    defaultDatabaseHost:
      process.env.AAPANEL_DEFAULT_DATABASE_HOST?.trim() || "127.0.0.1",
    defaultDatabasePort: readNumber("AAPANEL_DEFAULT_DATABASE_PORT", 3306),
    platformRootDomain: readRequired("PLATFORM_ROOT_DOMAIN"),
    platformSubdomainSuffix:
      process.env.PLATFORM_SUBDOMAIN_SUFFIX?.trim() || readRequired("PLATFORM_ROOT_DOMAIN"),
    defaultProtocol: protocol,
    templatesBasePath: readRequired("TEMPLATES_BASE_PATH"),
    deploymentsBasePath:
      process.env.DEPLOYMENTS_BASE_PATH?.trim() ||
      process.env.AAPANEL_DEFAULT_SITE_PATH?.trim() ||
      "/www/wwwroot",
    databasePrefix: process.env.DEPLOYMENT_DB_PREFIX?.trim() || "ovm_",
    databaseUserPrefix:
      process.env.DEPLOYMENT_DB_USER_PREFIX?.trim() || "ovmu_",
    logEnabled: readBoolean("ENABLE_PROVISIONING_LOGS", true),
    customDomainTargetHost:
      process.env.CUSTOM_DOMAIN_TARGET_HOST?.trim() ||
      `origin.${process.env.PLATFORM_ROOT_DOMAIN?.trim() || readRequired("PLATFORM_ROOT_DOMAIN")}`,
  };

  return cachedConfig;
}

export function resolveTemplateSourcePath(input: {
  templateSlug: string;
  stack: "Laravel" | "Next.js" | "WordPress";
  explicitSourcePath?: string | null;
}) {
  if (input.explicitSourcePath?.trim()) {
    return input.explicitSourcePath.trim();
  }

  const config = getAapanelConfig();
  const stackFolder = normalizeStackFolder(input.stack);
  return path.join(config.templatesBasePath, stackFolder, input.templateSlug);
}

export function resolveDeploymentProfile(input: {
  stack: "Laravel" | "Next.js" | "WordPress";
  explicitProfile?: string | null;
}): DeploymentProfile {
  const profileId = normalizeProfileId(input.stack, input.explicitProfile);

  const profiles: Record<DeploymentProfileId, DeploymentProfile> = {
    laravel: {
      id: "laravel",
      stack: "laravel",
      requiresDatabase: true,
      webRootStrategy: "public",
    },
    wordpress: {
      id: "wordpress",
      stack: "wordpress",
      requiresDatabase: true,
      webRootStrategy: "root",
    },
    "nextjs-static": {
      id: "nextjs-static",
      stack: "nextjs",
      requiresDatabase: false,
      webRootStrategy: "root",
    },
    "nextjs-standalone": {
      id: "nextjs-standalone",
      stack: "nextjs",
      requiresDatabase: false,
      webRootStrategy: "root",
    },
  };

  return profiles[profileId];
}

function normalizeStackFolder(stack: "Laravel" | "Next.js" | "WordPress") {
  if (stack === "Laravel") return "laravel";
  if (stack === "WordPress") return "wordpress";
  return "nextjs";
}

function normalizeProfileId(
  stack: "Laravel" | "Next.js" | "WordPress",
  explicitProfile?: string | null,
): DeploymentProfileId {
  if (explicitProfile) {
    const normalized = explicitProfile.trim().toLowerCase();
    if (
      normalized === "laravel" ||
      normalized === "wordpress" ||
      normalized === "nextjs-static" ||
      normalized === "nextjs-standalone"
    ) {
      return normalized;
    }
  }

  if (stack === "Laravel") return "laravel";
  if (stack === "WordPress") return "wordpress";
  return "nextjs-static";
}
