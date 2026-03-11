import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ENV_FILES = [".env.production.local", ".env.local", ".env.production", ".env"];
const REQUIRED_ENV_KEYS = ["AAPANEL_BASE_URL", "AAPANEL_API_KEY"];

function md5(value) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
  return true;
}

function loadEnvironment(cwd) {
  const loadedFiles = [];
  for (const file of ENV_FILES) {
    const filePath = path.join(cwd, file);
    if (loadEnvFile(filePath)) {
      loadedFiles.push(file);
    }
  }
  return loadedFiles;
}

function readRequired(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readNumber(name, fallback) {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }
  return value;
}

function appendSignature(params, apiKey) {
  const requestTime = Math.floor(Date.now() / 1000).toString();
  const requestToken = md5(`${requestTime}${md5(apiKey)}`);
  params.set("request_time", requestTime);
  params.set("request_token", requestToken);
}

function buildTargets(baseUrl, resource, action) {
  return [
    new URL(`/${resource}?action=${encodeURIComponent(action)}`, baseUrl),
    new URL(`/v2/${resource}?action=${encodeURIComponent(action)}`, baseUrl),
  ];
}

async function requestAaPanel(input) {
  const { baseUrl, apiKey, timeoutMs, resource, action, data = {} } = input;
  const bodyParams = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }
    bodyParams.set(key, String(value));
  }
  bodyParams.set("action", action);

  let lastError = null;

  for (const target of buildTargets(baseUrl, resource, action)) {
    const signedUrl = new URL(target.toString());
    appendSignature(signedUrl.searchParams, apiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(signedUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/plain, */*",
          "User-Agent": "Ovmon-aaPanel-SmokeTest/1.0",
        },
        body: bodyParams.toString(),
        signal: controller.signal,
      });

      const text = await response.text();
      const payload = safeJsonParse(text);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${extractMessage(payload)}`);
      }

      if (!isSuccessPayload(payload)) {
        throw new Error(extractMessage(payload));
      }

      return {
        target: signedUrl.toString(),
        payload,
      };
    } catch (error) {
      lastError = {
        target: signedUrl.toString(),
        message: error instanceof Error ? error.message : String(error),
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(
    `aaPanel smoke test failed. Last error: ${lastError?.message || "unknown error"}`,
  );
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { msg: text };
  }
}

function extractMessage(payload) {
  if (!payload || typeof payload !== "object") {
    return "aaPanel request failed";
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload.msg === "string" && payload.msg.trim()) {
    return payload.msg;
  }
  if (
    typeof payload.status === "number" &&
    payload.status === 0 &&
    payload.message &&
    typeof payload.message === "object"
  ) {
    return "success";
  }
  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return "aaPanel request failed";
}

function isSuccessPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (payload.status === true || payload.success === true) {
    return true;
  }
  if (typeof payload.status === "number") {
    if (payload.status === 1) {
      return true;
    }
    if (
      payload.status === 0 &&
      ((payload.message && typeof payload.message === "object") || "data" in payload)
    ) {
      return true;
    }
    return false;
  }
  if (typeof payload.msg === "string") {
    const normalized = payload.msg.trim().toLowerCase();
    return normalized === "success" || normalized.includes("success");
  }
  return false;
}

async function main() {
  const cwd = process.cwd();
  const loadedFiles = loadEnvironment(cwd);

  const missingKeys = REQUIRED_ENV_KEYS.filter((name) => !process.env[name]?.trim());
  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(", ")}. Loaded env files: ${
        loadedFiles.length > 0 ? loadedFiles.join(", ") : "none"
      }`,
    );
  }

  const baseUrlRaw = readRequired("AAPANEL_BASE_URL");
  const baseUrl = new URL(baseUrlRaw);
  const port = readNumber("AAPANEL_PORT", Number(baseUrl.port || 7800));
  const panelOrigin = `${baseUrl.protocol}//${baseUrl.hostname}${port ? `:${port}` : ""}`;
  const timeoutMs = readNumber("AAPANEL_REQUEST_TIMEOUT", 30000);

  const result = await requestAaPanel({
    baseUrl: panelOrigin,
    apiKey: readRequired("AAPANEL_API_KEY"),
    timeoutMs,
    resource: "system",
    action: "GetSystemTotal",
  });

  const summary = {
    ok: true,
    panelOrigin,
    target: result.target,
    keys: Object.keys(result.payload || {}),
    message: extractMessage(result.payload),
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  const payload = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  };
  process.stderr.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(1);
});
