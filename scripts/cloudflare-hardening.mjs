import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    return env;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) {
      continue;
    }

    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1);
    if (key) {
      env[key] = value;
    }
  }

  return env;
}

const rootDir = process.cwd();
const env = {
  ...loadEnvFile(path.join(rootDir, ".env.production")),
  ...process.env,
};

function getRequired(name) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildHeaders() {
  const email = env.CLOUDFLARE_EMAIL?.trim();
  const globalApiKey = env.CLOUDFLARE_GLOBAL_API_KEY?.trim();
  if (email && globalApiKey) {
    return {
      "X-Auth-Email": email,
      "X-Auth-Key": globalApiKey,
      "Content-Type": "application/json",
    };
  }

  const apiToken = getRequired("CLOUDFLARE_API_TOKEN");
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
}

const zoneId = getRequired("CLOUDFLARE_ZONE_ID");
const headers = buildHeaders();
const apiBase = env.CLOUDFLARE_API_BASE_URL?.trim() || "https://api.cloudflare.com/client/v4";

async function cfRequest(pathname, init = {}) {
  const response = await fetch(`${apiBase}${pathname}`, {
    method: init.method || "GET",
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const details =
      payload?.errors?.map((entry) => entry.message).join("; ") ||
      payload?.messages?.map((entry) => entry.message).join("; ") ||
      `${response.status} ${response.statusText}`;
    throw new Error(`${pathname}: ${details}`);
  }

  return payload.result;
}

function isBenignCloudflareStateError(message) {
  const normalized = String(message).toLowerCase();
  return (
    normalized.includes("already enabled") ||
    normalized.includes("already disabled") ||
    normalized.includes("already set") ||
    normalized.includes("same value") ||
    normalized.includes("no changes")
  );
}

async function getSetting(setting) {
  const result = await cfRequest(`/zones/${zoneId}/settings/${setting}`);
  return result.value;
}

async function patchSetting(setting, value) {
  const currentValue = await getSetting(setting);
  if (currentValue === value) {
    return { setting, value: currentValue, unchanged: true };
  }

  try {
    const result = await cfRequest(`/zones/${zoneId}/settings/${setting}`, {
      method: "PATCH",
      body: { value },
    });
    return { setting, value: result.value };
  } catch (error) {
    if (!isBenignCloudflareStateError(error?.message)) {
      throw error;
    }

    return { setting, value: await getSetting(setting), unchanged: true };
  }
}

async function putZoneSettingObject(setting, value) {
  try {
    const result = await cfRequest(`/zones/${zoneId}/settings/${setting}`, {
      method: "PATCH",
      body: { value },
    });
    return { setting, value: result.value };
  } catch (error) {
    if (!isBenignCloudflareStateError(error?.message)) {
      throw error;
    }

    return { setting, value: await getSetting(setting), unchanged: true };
  }
}

function ruleByDescription(rules, description) {
  return rules.find((rule) => rule.description === description);
}

async function ensureCustomFirewallRules() {
  const pathname = `/zones/${zoneId}/rulesets/phases/http_request_firewall_custom/entrypoint`;
  let entrypoint = null;

  try {
    entrypoint = await cfRequest(pathname);
  } catch (error) {
    if (!String(error.message).includes("could not find entrypoint ruleset")) {
      throw error;
    }
  }

  const sensitiveProbeExpression =
    '((lower(http.request.uri.path) contains "/." and not lower(http.request.uri.path) contains "/.well-known/") or lower(http.request.uri.path) in {"/composer.json" "/composer.lock" "/package.json" "/package-lock.json" "/pnpm-lock.yaml" "/yarn.lock" "/next.config.mjs" "/phpinfo.php" "/info.php" "/server-status" "/id_rsa" "/backup.zip" "/database.sql"} or starts_with(lower(http.request.uri.path), "/phpinfo") or starts_with(lower(http.request.uri.path), "/php_info") or lower(http.request.uri.path) contains "/vendor/" or lower(http.request.uri.path) contains "/storage/logs/")';
  const scannerExploitExpression =
    '(lower(http.request.uri.path) contains "/wp-admin" or lower(http.request.uri.path) contains "/wp-login.php" or lower(http.request.uri.path) contains "/wp-content/" or lower(http.request.uri.path) contains "/wp-includes/" or lower(http.request.uri.path) eq "/xmlrpc.php" or lower(http.request.uri.path) contains "/cgi-bin/" or lower(http.request.uri.path) contains "/boaform/" or lower(http.request.uri.path) contains "/actuator/" or lower(http.request.uri.path) contains "/phpmyadmin" or lower(http.request.uri.path) eq "/pma" or lower(http.request.uri.path) contains "/pma/" or lower(http.request.uri.path) contains "/debug/default/" or lower(http.request.uri.path) contains "/vendor/phpunit/")';

  const desiredRules = [
    {
      description: "Block public access to internal worker endpoints",
      expression:
        '(http.request.uri.path in {"/api/queue/worker" "/api/queue/maintenance" "/api/monitoring/worker"})',
      action: "block",
      enabled: true,
    },
    {
      description: "Block sensitive file and dotfile probes",
      expression: sensitiveProbeExpression,
      action: "block",
      enabled: true,
    },
    {
      description: "Block common scanner exploit paths",
      expression: scannerExploitExpression,
      action: "block",
      enabled: true,
    },
    {
      description: "Managed challenge on admin auth pages",
      expression: '(http.request.uri.path in {"/admin/login" "/admin/mfa"})',
      action: "managed_challenge",
      enabled: true,
    },
    {
      description: "Block obvious SQLi probes in URI",
      expression:
        '(lower(http.request.uri.query) contains "union select" or lower(http.request.uri.query) contains "information_schema" or lower(http.request.uri.query) contains "sleep(" or lower(http.request.uri.query) contains "benchmark(" or lower(http.request.uri.query) contains "load_file(" or lower(http.request.uri.path) contains "../")',
      action: "block",
      enabled: true,
    },
  ];

  const mergedRules = [];
  for (const desiredRule of desiredRules) {
    const existing = entrypoint?.rules ? ruleByDescription(entrypoint.rules, desiredRule.description) : null;
    mergedRules.push(existing ? { ...existing, ...desiredRule } : desiredRule);
  }

  if (!entrypoint) {
    return cfRequest(`/zones/${zoneId}/rulesets`, {
      method: "POST",
      body: {
        name: "Univert custom firewall protections",
        kind: "zone",
        phase: "http_request_firewall_custom",
        rules: mergedRules,
      },
    });
  }

  return cfRequest(`/zones/${zoneId}/rulesets/${entrypoint.id}`, {
    method: "PUT",
    body: {
      description: entrypoint.description || "Univert custom firewall protections",
      rules: mergedRules,
    },
  });
}

async function ensureManagedWafRuleset() {
  const pathname = `/zones/${zoneId}/rulesets/phases/http_request_firewall_managed/entrypoint`;
  let entrypoint = null;

  try {
    entrypoint = await cfRequest(pathname);
  } catch (error) {
    if (!String(error.message).includes("could not find entrypoint ruleset")) {
      throw error;
    }
  }

  const executeRule = {
    description: "Execute Cloudflare Managed Free Ruleset",
    expression: '(http.host eq "univert.pro" or http.host eq "www.univert.pro")',
    action: "execute",
    action_parameters: {
      id: "77454fe2d30c4220b5701f6fdfb893ba",
    },
    enabled: true,
  };

  if (!entrypoint) {
    return cfRequest(`/zones/${zoneId}/rulesets`, {
      method: "POST",
      body: {
        name: "Univert managed firewall protections",
        kind: "zone",
        phase: "http_request_firewall_managed",
        rules: [executeRule],
      },
    });
  }

  const existing = entrypoint.rules?.find(
    (rule) => rule.description === executeRule.description || rule.action_parameters?.id === executeRule.action_parameters.id,
  );

  return cfRequest(`/zones/${zoneId}/rulesets/${entrypoint.id}`, {
    method: "PUT",
    body: {
      description: entrypoint.description || "Univert managed firewall protections",
      rules: [existing ? { ...existing, ...executeRule } : executeRule],
    },
  });
}

async function ensureRateLimitRules() {
  const entrypoint = await cfRequest(`/zones/${zoneId}/rulesets/phases/http_ratelimit/entrypoint`);
  const desiredRule = {
    description: "Protect auth surfaces and leaked credential probes",
    expression:
      '((http.request.uri.path in {"/api/auth/login" "/api/auth/admin-login" "/api/auth/forgot-password" "/api/auth/signup" "/api/auth/reset-password" "/api/auth/admin-mfa/verify" "/api/auth/admin-mfa/step-up" "/admin/login" "/admin/mfa"}) or cf.waf.credential_check.password_leaked)',
    action: "block",
    enabled: true,
    ratelimit: {
      characteristics: ["ip.src", "cf.colo.id"],
      period: 10,
      requests_per_period: 5,
      mitigation_timeout: 10,
    },
  };

  return cfRequest(`/zones/${zoneId}/rulesets/${entrypoint.id}`, {
    method: "PUT",
    body: {
      description: entrypoint.description || "Univert rate limits",
      rules: [desiredRule],
    },
  });
}

async function main() {
  const results = [];
  results.push(await patchSetting("ssl", "strict"));
  results.push(await patchSetting("always_use_https", "on"));
  results.push(await patchSetting("automatic_https_rewrites", "on"));
  results.push(await patchSetting("browser_check", "on"));
  results.push(await patchSetting("security_level", "under_attack"));
  results.push(await patchSetting("min_tls_version", "1.2"));
  results.push(await patchSetting("tls_1_2_only", "on"));
  results.push(await patchSetting("tls_1_3", "on"));
  results.push(await patchSetting("challenge_ttl", 2700));
  results.push(
    await putZoneSettingObject("security_header", {
      strict_transport_security: {
        enabled: true,
        max_age: 31536000,
        include_subdomains: true,
        preload: true,
        nosniff: true,
      },
    }),
  );

  const customRuleset = await ensureCustomFirewallRules();
  const managedRuleset = await ensureManagedWafRuleset();
  const rateLimitRuleset = await ensureRateLimitRules();

  console.log(
    JSON.stringify(
      {
        settings: results,
        customRuleset: {
          id: customRuleset.id,
          phase: customRuleset.phase,
          rules: (customRuleset.rules || []).map((rule) => ({
            description: rule.description,
            action: rule.action,
            enabled: rule.enabled,
          })),
        },
        managedRuleset: {
          id: managedRuleset.id,
          phase: managedRuleset.phase,
          rules: (managedRuleset.rules || []).map((rule) => ({
            description: rule.description,
            action: rule.action,
            enabled: rule.enabled,
          })),
        },
        rateLimitRuleset: {
          id: rateLimitRuleset.id,
          phase: rateLimitRuleset.phase,
          rules: (rateLimitRuleset.rules || []).map((rule) => ({
            description: rule.description,
            action: rule.action,
            enabled: rule.enabled,
          })),
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
