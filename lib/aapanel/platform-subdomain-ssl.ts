import { promises as fs } from "node:fs";
import path from "node:path";
import { X509Certificate } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const NGINX_CONF_ROOT = "/www/server/panel/vhost/nginx";
const NGINX_CERT_ROOT = "/www/server/panel/vhost/cert";
const NGINX_BINARY = "/www/server/nginx/sbin/nginx";

export type PlatformWildcardSslInfo = {
  domain: string;
  certificateDomain: string;
  fullchainPath: string;
  privateKeyPath: string;
  expiresAt: string;
};

export function isPlatformManagedSubdomain(domain: string, rootDomain: string) {
  const normalizedDomain = domain.trim().toLowerCase();
  const normalizedRoot = rootDomain.trim().toLowerCase();
  return normalizedDomain.endsWith(`.${normalizedRoot}`);
}

export async function readPlatformWildcardSslInfo(
  certificateDomain: string,
): Promise<PlatformWildcardSslInfo> {
  const fullchainPath = path.join(NGINX_CERT_ROOT, certificateDomain, "fullchain.pem");
  const privateKeyPath = path.join(NGINX_CERT_ROOT, certificateDomain, "privkey.pem");
  const certificatePem = await fs.readFile(fullchainPath, "utf8");
  const certificate = new X509Certificate(certificatePem);

  return {
    domain: `*.${certificateDomain}`,
    certificateDomain,
    fullchainPath,
    privateKeyPath,
    expiresAt: new Date(certificate.validTo).toISOString(),
  };
}

export async function ensurePlatformSubdomainWildcardSsl(input: {
  domain: string;
  certificateDomain: string;
}) {
  if (!isPlatformManagedSubdomain(input.domain, input.certificateDomain)) {
    return null;
  }

  const sslInfo = await readPlatformWildcardSslInfo(input.certificateDomain);
  await ensureNginxSiteSsl({
    siteName: input.domain,
    fullchainPath: sslInfo.fullchainPath,
    privateKeyPath: sslInfo.privateKeyPath,
  });

  return sslInfo;
}

export async function ensureSiteCertificateSsl(input: {
  siteName: string;
  certificateName?: string;
}) {
  const certificateName = input.certificateName || input.siteName;
  const sslInfo = await readPlatformWildcardSslInfo(certificateName);
  await ensureNginxSiteSsl({
    siteName: input.siteName,
    fullchainPath: sslInfo.fullchainPath,
    privateKeyPath: sslInfo.privateKeyPath,
  });
  return sslInfo;
}

async function ensureNginxSiteSsl(input: {
  siteName: string;
  fullchainPath: string;
  privateKeyPath: string;
}) {
  const confPath = path.join(NGINX_CONF_ROOT, `${input.siteName}.conf`);
  const currentConfig = await fs.readFile(confPath, "utf8");

  const alreadyConfigured =
    currentConfig.includes("listen 443 ssl http2") &&
    currentConfig.includes(input.fullchainPath) &&
    currentConfig.includes(input.privateKeyPath);

  if (alreadyConfigured) {
    return;
  }

  let updatedConfig = currentConfig;
  if (!updatedConfig.includes("listen 443 ssl http2")) {
    updatedConfig = updatedConfig.replace(
      "    listen 80;",
      "    listen 80;\n    listen 443 ssl http2 ;\n    listen [::]:80;",
    );
  }

  updatedConfig = updatedConfig.replace(
    /^\s*ssl_certificate\s+.+;$/m,
    `    ssl_certificate    ${input.fullchainPath};`,
  );
  updatedConfig = updatedConfig.replace(
    /^\s*ssl_certificate_key\s+.+;$/m,
    `    ssl_certificate_key    ${input.privateKeyPath};`,
  );

  const backupPath = `${confPath}.bak_platform_ssl`;
  await fs.writeFile(backupPath, currentConfig, "utf8");
  await fs.writeFile(confPath, updatedConfig, "utf8");

  try {
    await execFileAsync(NGINX_BINARY, ["-t"]);
    await execFileAsync(NGINX_BINARY, ["-s", "reload"]);
  } catch (error) {
    await fs.writeFile(confPath, currentConfig, "utf8");
    throw error;
  }
}
