import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { BaseProvider } from "@/lib/provisioning/provider";
import { CloudflareClient, hasCloudflareDnsAccess } from "@/lib/cloudflare/client";
import type {
  ProvisioningConfig,
  ProvisioningContext,
  ProvisioningResult,
  JobLogEntry,
} from "@/lib/provisioning/types";
import { AapanelClient } from "@/lib/aapanel/client";
import {
  getAapanelConfig,
  resolveDeploymentProfile,
  resolveTemplateSourcePath,
} from "@/lib/aapanel/config";
import {
  ensurePlatformSubdomainWildcardSsl,
  isPlatformManagedSubdomain,
} from "@/lib/aapanel/platform-subdomain-ssl";
import type {
  AapanelDatabaseCreationResult,
  AapanelHealthResult,
  AapanelSiteRecord,
  ResolvedTemplateDeployment,
} from "@/lib/aapanel/types";

const DEPLOYMENT_MARKER_FILE = ".ovmon-deployment.json";

type ProviderState = {
  resolved?: ResolvedTemplateDeployment;
  site?: AapanelSiteRecord | null;
  database?: AapanelDatabaseCreationResult | null;
};

export class AapanelProvisioningProvider extends BaseProvider {
  name = "aaPanel";
  private readonly client: AapanelClient;
  private readonly env = getAapanelConfig();
  private readonly cloudflare = hasCloudflareDnsAccess() ? new CloudflareClient() : null;

  constructor(client?: AapanelClient) {
    super();
    this.client = client || new AapanelClient();
  }

  async provisionWebsite(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ): Promise<ProvisioningResult> {
    const state: ProviderState = {};

    try {
      const resolved = this.resolveDeployment(context, config);
      state.resolved = resolved;

      await onProgress(
        this.createLog(
          context.jobId,
          "info",
          "Validated aaPanel configuration and deployment profile",
          "validating_config",
          {
            profile: resolved.profile.id,
            sourcePath: resolved.sourcePath,
            primaryDomain: resolved.primaryDomain,
            siteBasePath: resolved.siteBasePath,
            webRootPath: resolved.webRootPath,
            fqdn: resolved.fqdn,
          },
        ),
      );

      await this.allocateServer(context, onProgress);

      if (resolved.profile.requiresDatabase) {
        state.database = await this.createDatabase(context, config, onProgress);
      } else {
        state.database = null;
        await onProgress(
          this.createLog(
            context.jobId,
            "info",
            "Deployment profile does not require a database",
            "creating_database",
            {
              profile: resolved.profile.id,
            },
          ),
        );
      }

      state.site = await this.createSiteRecord(context, resolved, onProgress);
      await this.ensurePlatformDns(context, resolved, onProgress);
      await this.ensurePlatformWildcardSsl(context, resolved, onProgress);
      await this.deployApplication(context, config, onProgress);
      await this.configureEnvironment(context, config, state.database, onProgress);
      if (!state.site) {
        throw new Error(`Unable to resolve aaPanel site record for ${resolved.fqdn}`);
      }
      await this.ensureWebRoot(context, resolved, state.site, onProgress);

      const domainToBind = context.customDomain || resolved.fqdn;
      await this.linkDomain(context, domainToBind, onProgress);

      await onProgress(
        this.createLog(
          context.jobId,
          "success",
          "aaPanel provisioning completed",
          "completed",
          {
            liveUrl: resolved.liveUrl,
            primaryDomain: resolved.primaryDomain,
            domain: domainToBind,
            siteId: state.site.id,
            siteBasePath: resolved.siteBasePath,
            webRootPath: resolved.webRootPath,
            database: state.database
              ? {
                  name: state.database.databaseName,
                  username: state.database.username,
                  host: state.database.host,
                  port: state.database.port,
                }
              : null,
          },
        ),
      );

      return {
        success: true,
        serverId: new URL(this.env.baseUrl).host,
        databaseId: state.database?.databaseName,
        deploymentUrl: resolved.liveUrl,
        details: {
          primaryDomain: resolved.primaryDomain,
          fqdn: resolved.fqdn,
          siteBasePath: resolved.siteBasePath,
          webRootPath: resolved.webRootPath,
          deploymentProfile: resolved.profile.id,
          database: state.database,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown aaPanel error";

      await onProgress(
        this.createLog(context.jobId, "error", message, "failed", {
          websiteId: context.websiteId,
          state,
        }),
      );

      return {
        success: false,
        error: message,
        details: {
          state,
        },
      };
    }
  }

  async allocateServer(
    context: ProvisioningContext,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ): Promise<{ serverId: string; ipAddress: string }> {
    const health = await this.healthCheck();
    if (!health.healthy) {
      throw new Error(health.message);
    }

    const host = new URL(this.env.baseUrl).host;
    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "aaPanel server connection is healthy",
        "allocating_server",
        { host },
      ),
    );

    return {
      serverId: host,
      ipAddress: new URL(this.env.baseUrl).hostname,
    };
  }

  async createDatabase(
    context: ProvisioningContext,
    _config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ): Promise<{
    databaseId: string;
    host: string;
    port: number;
    username: string;
    password: string;
    databaseName: string;
    raw?: unknown;
  }> {
    const databaseName = this.generateDatabaseName(context.websiteId);
    const username = this.generateDatabaseUser(context.websiteId);
    const password = this.generateDatabasePassword(context.websiteId);

    let result: AapanelDatabaseCreationResult;
    try {
      result = await this.client.createDatabase({
        databaseName,
        username,
        password,
      });
    } catch (error) {
      if (!isAlreadyExistsError(error)) {
        throw error;
      }

      result = {
        databaseName,
        username,
        password,
        host: this.env.defaultDatabaseHost,
        port: this.env.defaultDatabasePort,
      };
    }

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "Database created in aaPanel",
        "creating_database",
        {
          databaseName: result.databaseName,
          username: result.username,
          host: result.host,
          port: result.port,
        },
      ),
    );

    return {
      databaseId: result.databaseName,
      databaseName: result.databaseName,
      host: result.host,
      port: result.port,
      username: result.username,
      password: result.password,
      raw: result.raw,
    };
  }

  async deployApplication(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ): Promise<{ deploymentUrl: string; containerIds?: string[] }> {
    const resolved = this.resolveDeployment(context, config);
    await this.ensureTemplateSourceExists(resolved.sourcePath);
    await this.prepareDeploymentDirectory(resolved);
    await fs.cp(resolved.sourcePath, resolved.siteBasePath, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });
    await this.writeDeploymentMarker(context, config, resolved);

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "Template files copied to deployment directory",
        "deploying_application",
        {
          sourcePath: resolved.sourcePath,
          targetPath: resolved.siteBasePath,
          deploymentProfile: resolved.profile.id,
        },
      ),
    );

    return {
      deploymentUrl: resolved.liveUrl,
      containerIds: [resolved.fqdn],
    };
  }

  async linkDomain(
    context: ProvisioningContext,
    domain: string,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ): Promise<{ dnsRecords: Record<string, string> }> {
    const primaryDomain = `${context.subdomain}.${this.env.platformSubdomainSuffix}`;
    const site = await this.client.getSiteByName(primaryDomain);
    if (!site) {
      throw new Error(`aaPanel site lookup failed for ${primaryDomain}`);
    }

    if (domain !== primaryDomain) {
      try {
        await this.client.addDomain(site.id, primaryDomain, domain);
      } catch (error) {
        if (!isAlreadyExistsError(error)) {
          throw error;
        }
      }
    }

    const dnsRecords = {
      A: new URL(this.env.baseUrl).hostname,
    };

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "Domain bound in aaPanel",
        "configuring_domain",
        {
          siteId: site.id,
          primaryDomain,
          boundDomain: domain,
          dnsRecords,
        },
      ),
    );

    return { dnsRecords };
  }

  async activateSSL(
    context: ProvisioningContext,
    domain: string,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ): Promise<{ certificateId: string; expiresAt: string }> {
    if (!isPlatformManagedSubdomain(domain, this.env.platformRootDomain)) {
      throw new Error("Automatic SSL provisioning is only configured for platform subdomains");
    }

    const sslInfo = await ensurePlatformSubdomainWildcardSsl({
      domain,
      certificateDomain: this.env.platformRootDomain,
    });
    if (!sslInfo) {
      throw new Error(`Unable to enable wildcard SSL for ${domain}`);
    }

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "Shared wildcard SSL activated for platform subdomain",
        "configuring_domain",
        {
          domain,
          certificateDomain: sslInfo.certificateDomain,
          expiresAt: sslInfo.expiresAt,
        },
      ),
    );

    return {
      certificateId: `wildcard:${sslInfo.certificateDomain}`,
      expiresAt: sslInfo.expiresAt,
    };
  }

  async getProvisioningStatus(_jobId: string) {
    return {
      progress: 0,
      currentStep: "pending",
      status: "pending" as const,
    };
  }

  async cancelProvisioning(_jobId: string) {
    return true;
  }

  async healthCheck(): Promise<AapanelHealthResult> {
    try {
      const result = await this.client.getSystemTotal();
      return {
        healthy: true,
        message: "aaPanel connection successful",
        details: {
          response: result.raw,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "aaPanel health check failed";
      return {
        healthy: false,
        message,
      };
    }
  }

  private resolveDeployment(
    context: ProvisioningContext,
    config: ProvisioningConfig,
  ): ResolvedTemplateDeployment {
    const stackName = normalizeStackName(config.stack);
    const deploymentProfile = resolveDeploymentProfile({
      stack: stackName,
      explicitProfile: config.deploymentProfile,
    });
    const primaryDomain = `${context.subdomain}.${this.env.platformSubdomainSuffix}`;
    const fqdn = context.customDomain || primaryDomain;
    const siteBasePath =
      config.siteRootPath?.trim() || path.join(this.env.deploymentsBasePath, primaryDomain);
    const webRootPath =
      deploymentProfile.webRootStrategy === "public"
        ? path.join(siteBasePath, "public")
        : siteBasePath;
    const sourcePath = resolveTemplateSourcePath({
      templateSlug: config.templateSlug || context.templateId,
      stack: stackName,
      explicitSourcePath: config.templateSourcePath,
    });

    return {
      sourcePath,
      profile: deploymentProfile,
      primaryDomain,
      siteBasePath,
      webRootPath,
      fqdn,
      liveUrl: `${this.env.defaultProtocol}://${fqdn}`,
      protocol: this.env.defaultProtocol,
    };
  }

  private async createSiteRecord(
    context: ProvisioningContext,
    resolved: ResolvedTemplateDeployment,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ) {
    await fs.mkdir(resolved.siteBasePath, { recursive: true });
    try {
      await this.client.createSite({
        domain: resolved.primaryDomain,
        rootPath: resolved.webRootPath,
        phpVersion: resolved.profile.phpVersion || this.env.defaultPhpVersion,
        note: `Provisioned for ${context.websiteId}`,
      });
    } catch (error) {
      if (!isAlreadyExistsError(error)) {
        throw error;
      }
    }

    const site = await this.client.getSiteByName(resolved.primaryDomain);
    if (!site) {
      throw new Error(`aaPanel site lookup failed for ${resolved.primaryDomain}`);
    }

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "Website created in aaPanel",
        "allocating_server",
        {
          siteId: site.id,
          primaryDomain: resolved.primaryDomain,
          fqdn: resolved.fqdn,
          rootPath: resolved.webRootPath,
        },
      ),
    );

    return site;
  }

  private async ensurePlatformDns(
    context: ProvisioningContext,
    resolved: ResolvedTemplateDeployment,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ) {
    if (!this.cloudflare) {
      return;
    }

    if (!isPlatformManagedSubdomain(resolved.primaryDomain, this.env.platformRootDomain)) {
      return;
    }

    const wildcardRecord = await this.cloudflare.ensurePlatformWildcardARecord(
      new URL(this.env.baseUrl).hostname,
    );
    await this.cloudflare.setAlwaysUseHttps(true);

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "Cloudflare wildcard DNS is ready for platform subdomains",
        "configuring_domain",
        {
          wildcardRecord: wildcardRecord.name,
          target: wildcardRecord.content,
          proxied: wildcardRecord.proxied,
        },
      ),
    );
  }

  private async ensurePlatformWildcardSsl(
    context: ProvisioningContext,
    resolved: ResolvedTemplateDeployment,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ) {
    if (!isPlatformManagedSubdomain(resolved.primaryDomain, this.env.platformRootDomain)) {
      return;
    }

    const sslInfo = await ensurePlatformSubdomainWildcardSsl({
      domain: resolved.primaryDomain,
      certificateDomain: this.env.platformRootDomain,
    });
    if (!sslInfo) {
      return;
    }

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "aaPanel site configured to use the shared wildcard SSL certificate",
        "configuring_domain",
        {
          domain: resolved.primaryDomain,
          certificateDomain: sslInfo.certificateDomain,
          fullchainPath: sslInfo.fullchainPath,
          expiresAt: sslInfo.expiresAt,
        },
      ),
    );
  }

  private async configureEnvironment(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    database: AapanelDatabaseCreationResult | null,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ) {
    const resolved = this.resolveDeployment(context, config);
    const profile = resolved.profile.id;

    if (profile === "wordpress") {
      await this.configureWordPress(resolved.siteBasePath, resolved.liveUrl, database);
    } else if (profile === "laravel") {
      await this.configureLaravel(
        resolved.siteBasePath,
        resolved.liveUrl,
        database,
        context,
      );
    } else {
      await this.configureNextjs(resolved.siteBasePath, resolved.liveUrl, database);
    }

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "Environment/config values written",
        "setting_up_environment",
        {
          profile,
          siteBasePath: resolved.siteBasePath,
        },
      ),
    );
  }

  private async ensureWebRoot(
    context: ProvisioningContext,
    resolved: ResolvedTemplateDeployment,
    site: AapanelSiteRecord,
    onProgress: (log: JobLogEntry) => Promise<void>,
  ) {
    await fs.mkdir(resolved.webRootPath, { recursive: true });

    const normalizedCurrentPath = path.resolve(site.path || resolved.webRootPath);
    const normalizedRequestedPath = path.resolve(resolved.webRootPath);
    if (normalizedCurrentPath !== normalizedRequestedPath) {
      try {
        await this.client.setSitePath(site.id, resolved.webRootPath);
      } catch (error) {
        if (!isAlreadyExistsError(error)) {
          throw error;
        }
      }
    }

    await onProgress(
      this.createLog(
        context.jobId,
        "success",
        "Website root path assigned",
        "finalizing",
        {
          siteId: site.id,
          primaryDomain: resolved.primaryDomain,
          fqdn: resolved.fqdn,
          webRootPath: resolved.webRootPath,
        },
      ),
    );
  }

  private async ensureTemplateSourceExists(sourcePath: string) {
    const stat = await fs.stat(sourcePath).catch(() => null);
    if (!stat || !stat.isDirectory()) {
      throw new Error(`Template source path not found: ${sourcePath}`);
    }
  }

  private async prepareDeploymentDirectory(resolved: ResolvedTemplateDeployment) {
    await fs.mkdir(resolved.siteBasePath, { recursive: true });
    const existingEntries = await fs.readdir(resolved.siteBasePath).catch(() => []);
    const preserved = new Set([".well-known", ".user.ini", "404.html", "502.html", DEPLOYMENT_MARKER_FILE]);

    for (const entry of existingEntries) {
      if (preserved.has(entry)) {
        continue;
      }

      const target = path.join(resolved.siteBasePath, entry);
      const stat = await fs.lstat(target).catch(() => null);
      if (!stat) {
        continue;
      }

      await fs.rm(target, {
        recursive: stat.isDirectory(),
        force: true,
      });
    }
  }

  private async writeDeploymentMarker(
    context: ProvisioningContext,
    config: ProvisioningConfig,
    resolved: ResolvedTemplateDeployment,
  ) {
    const marker = {
      websiteId: context.websiteId,
      templateId: context.templateId,
      profile: resolved.profile.id,
      sourcePath: resolved.sourcePath,
      deployedAt: new Date().toISOString(),
      stack: config.stack,
    };

    await fs.writeFile(
      path.join(resolved.siteBasePath, DEPLOYMENT_MARKER_FILE),
      `${JSON.stringify(marker, null, 2)}\n`,
      "utf8",
    );
  }

  private async configureLaravel(
    siteBasePath: string,
    liveUrl: string,
    database: AapanelDatabaseCreationResult | null,
    context: ProvisioningContext,
  ) {
    const envPath = path.join(siteBasePath, ".env");
    const envExamplePath = path.join(siteBasePath, ".env.example");
    const existing = await readFirstExistingFile([envPath, envExamplePath]);
    const updated = upsertEnvValues(existing, {
      APP_NAME: context.metadata?.projectName || context.subdomain,
      APP_ENV: "production",
      APP_DEBUG: "false",
      APP_URL: liveUrl,
      DB_CONNECTION: database ? "mysql" : undefined,
      DB_HOST: database?.host,
      DB_PORT: database?.port ? String(database.port) : undefined,
      DB_DATABASE: database?.databaseName,
      DB_USERNAME: database?.username,
      DB_PASSWORD: database?.password,
      OVMON_WEBSITE_ID: context.websiteId,
      OVMON_TEMPLATE_ID: context.templateId,
      OVMON_USER_ID: context.userId,
    });
    await fs.writeFile(envPath, updated, "utf8");
  }

  private async configureNextjs(
    siteBasePath: string,
    liveUrl: string,
    database: AapanelDatabaseCreationResult | null,
  ) {
    const envPath = path.join(siteBasePath, ".env.production");
    const existing = await readFirstExistingFile([
      envPath,
      path.join(siteBasePath, ".env.local"),
      path.join(siteBasePath, ".env"),
    ]);
    const updated = upsertEnvValues(existing, {
      NEXT_PUBLIC_APP_URL: liveUrl,
      NEXT_PUBLIC_SITE_URL: liveUrl,
      DATABASE_URL: database
        ? `mysql://${database.username}:${database.password}@${database.host}:${database.port}/${database.databaseName}`
        : undefined,
    });
    await fs.writeFile(envPath, updated, "utf8");
  }

  private async configureWordPress(
    siteBasePath: string,
    liveUrl: string,
    database: AapanelDatabaseCreationResult | null,
  ) {
    const targetConfigPath = path.join(siteBasePath, "wp-config.php");
    const samplePath = path.join(siteBasePath, "wp-config-sample.php");
    const currentConfig = await readFirstExistingFile([targetConfigPath, samplePath]);
    if (!currentConfig) {
      return;
    }

    const replacements: Array<[RegExp, string]> = [
      [/database_name_here/g, database?.databaseName || "wordpress"],
      [/username_here/g, database?.username || "wordpress"],
      [/password_here/g, database?.password || "wordpress"],
      [/localhost/g, database ? `${database.host}:${database.port}` : "localhost"],
    ];

    let nextConfig = currentConfig;
    for (const [pattern, value] of replacements) {
      nextConfig = nextConfig.replace(pattern, value);
    }

    if (!nextConfig.includes("WP_HOME")) {
      nextConfig = nextConfig.replace(
        "/* That's all, stop editing! Happy publishing. */",
        `define('WP_HOME', '${liveUrl}');\ndefine('WP_SITEURL', '${liveUrl}');\n\n/* That's all, stop editing! Happy publishing. */`,
      );
    }

    await fs.writeFile(targetConfigPath, nextConfig, "utf8");
  }

  private generateDatabaseName(websiteId: string) {
    return truncateIdentifier(
      `${this.env.databasePrefix}${websiteId.replace(/-/g, "").slice(0, 16)}`,
      32,
    );
  }

  private generateDatabaseUser(websiteId: string) {
    return truncateIdentifier(
      `${this.env.databaseUserPrefix}${websiteId.replace(/-/g, "").slice(0, 12)}`,
      16,
    );
  }

  private generateDatabasePassword(websiteId: string) {
    return crypto
      .createHash("sha256")
      .update(`${websiteId}:${this.env.apiKey}`)
      .digest("hex")
      .slice(0, 24);
  }
}

async function readFirstExistingFile(paths: string[]) {
  for (const target of paths) {
    const content = await fs.readFile(target, "utf8").catch(() => null);
    if (content !== null) {
      return content;
    }
  }

  return "";
}

function upsertEnvValues(
  source: string,
  values: Record<string, string | undefined>,
) {
  const lines = source ? source.split(/\r?\n/) : [];
  const seen = new Set<string>();

  const nextLines = lines.map((line) => {
    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      return line;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!(key in values)) {
      return line;
    }

    seen.add(key);
    const value = values[key];
    if (value === undefined) {
      return line;
    }
    return `${key}=${value}`;
  });

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || seen.has(key)) {
      continue;
    }
    nextLines.push(`${key}=${value}`);
  }

  return `${nextLines.filter(Boolean).join("\n")}\n`;
}

function truncateIdentifier(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

function isAlreadyExistsError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("exists") ||
    message.includes("already") ||
    message.includes("duplicate") ||
    message.includes("same as original path") ||
    message.includes("no need to change")
  );
}

function normalizeStackName(stack: ProvisioningConfig["stack"]) {
  if (stack === "laravel") return "Laravel" as const;
  if (stack === "wordpress") return "WordPress" as const;
  return "Next.js" as const;
}
