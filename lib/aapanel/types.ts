export type AapanelHttpMethod = "GET" | "POST";

export type AapanelApiResult<T> = {
  success: boolean;
  data?: T;
  message: string;
  raw?: unknown;
};

export type AapanelRequestOptions = {
  resource: string;
  action: string;
  method?: AapanelHttpMethod;
  data?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
};

export type AapanelClientConfig = {
  panelOrigin: string;
  apiKey: string;
  timeoutMs: number;
};

export type AapanelEnvConfig = {
  baseUrl: string;
  port: number;
  apiKey: string;
  requestTimeoutMs: number;
  defaultSitePath: string;
  defaultPhpVersion: string;
  defaultDatabaseHost: string;
  defaultDatabasePort: number;
  platformRootDomain: string;
  platformSubdomainSuffix: string;
  defaultProtocol: "http" | "https";
  templatesBasePath: string;
  deploymentsBasePath: string;
  databasePrefix: string;
  databaseUserPrefix: string;
  logEnabled: boolean;
  customDomainTargetHost: string;
};

export type AapanelSitePayload = {
  domain: string;
  rootPath: string;
  phpVersion: string;
  note: string;
};

export type AapanelSiteCreationResult = {
  siteId?: number;
  siteName: string;
  rootPath: string;
  raw?: unknown;
};

export type AapanelSiteRecord = {
  id: number;
  name: string;
  path: string;
  ps?: string | null;
  addtime?: string;
  status?: string | number | boolean;
  raw?: unknown;
};

export type AapanelDatabaseCreationResult = {
  databaseName: string;
  username: string;
  password: string;
  host: string;
  port: number;
  raw?: unknown;
};

export type AapanelSslCertificateResult = {
  siteName: string;
  domains: string[];
  raw?: unknown;
};

export type AapanelSslInfoResult = {
  siteName: string;
  expiresAt?: string | null;
  issuer?: string | null;
  raw?: unknown;
};

export type AapanelHealthResult = {
  healthy: boolean;
  message: string;
  details?: Record<string, unknown>;
};

export type DeploymentProfileId =
  | "laravel"
  | "wordpress"
  | "nextjs-static"
  | "nextjs-standalone";

export type DeploymentProfile = {
  id: DeploymentProfileId;
  stack: "laravel" | "wordpress" | "nextjs";
  requiresDatabase: boolean;
  webRootStrategy: "root" | "public";
  phpVersion?: string;
};

export type ResolvedTemplateDeployment = {
  sourcePath: string;
  profile: DeploymentProfile;
  primaryDomain: string;
  siteBasePath: string;
  webRootPath: string;
  fqdn: string;
  liveUrl: string;
  protocol: "http" | "https";
};
