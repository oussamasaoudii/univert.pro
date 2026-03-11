import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureCoreSchema } from "@/lib/mysql/schema";
import { decryptSecret, encryptSecret } from "@/lib/security/crypto";

export type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowNewSignups: boolean;
  requireEmailVerification: boolean;
  maintenanceMessage: string;
  s3Enabled: boolean;
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3PublicUrl: string;
  s3UsePathStyle: boolean;
  turnstileEnabled: boolean;
  turnstileSiteKey: string;
  turnstileSecretKey: string;
  updatedAt: string;
};

type SettingsRow = {
  platform_name: string;
  support_email: string;
  maintenance_mode: number | boolean;
  allow_new_signups: number | boolean;
  require_email_verification: number | boolean;
  maintenance_message: string | null;
  addon_s3_enabled: number | boolean;
  s3_endpoint: string | null;
  s3_region: string | null;
  s3_bucket: string | null;
  s3_access_key: string | null;
  s3_secret_key: string | null;
  s3_public_url: string | null;
  s3_use_path_style: number | boolean | null;
  addon_turnstile_enabled: number | boolean;
  turnstile_site_key: string | null;
  turnstile_secret_key: string | null;
  updated_at: string;
};

export type EffectivePlatformSettings = PlatformSettings & {
  s3ConfigSource: "database" | "env" | "mixed" | "none";
  s3EnvFallbackActive: boolean;
};

type S3EnvironmentSettings = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  publicUrl: string;
  usePathStyle: boolean | null;
};

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
}

function parseBooleanEnv(value: string | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

export function getS3EnvironmentSettings(): S3EnvironmentSettings {
  return {
    endpoint: firstNonEmpty(process.env.AWS_ENDPOINT, process.env.S3_ENDPOINT),
    region: firstNonEmpty(process.env.AWS_REGION, process.env.AWS_DEFAULT_REGION, process.env.S3_REGION),
    bucket: firstNonEmpty(process.env.AWS_S3_BUCKET, process.env.AWS_BUCKET, process.env.S3_BUCKET),
    accessKey: firstNonEmpty(process.env.AWS_ACCESS_KEY_ID, process.env.S3_ACCESS_KEY),
    secretKey: firstNonEmpty(process.env.AWS_SECRET_ACCESS_KEY, process.env.S3_SECRET_KEY),
    publicUrl: firstNonEmpty(process.env.AWS_URL, process.env.S3_PUBLIC_URL),
    usePathStyle: parseBooleanEnv(
      firstNonEmpty(process.env.AWS_USE_PATH_STYLE_ENDPOINT, process.env.S3_USE_PATH_STYLE_ENDPOINT),
    ),
  };
}

function hasStoredS3Values(settings: PlatformSettings) {
  return Boolean(
    settings.s3Endpoint ||
      settings.s3Region ||
      settings.s3Bucket ||
      settings.s3AccessKey ||
      settings.s3SecretKey ||
      settings.s3PublicUrl ||
      settings.s3UsePathStyle,
  );
}

export function resolvePlatformSettings(settings: PlatformSettings): EffectivePlatformSettings {
  const s3Env = getS3EnvironmentSettings();
  const storedS3Values = hasStoredS3Values(settings);

  const next: EffectivePlatformSettings = {
    ...settings,
    s3Endpoint: settings.s3Endpoint || s3Env.endpoint,
    s3Region: settings.s3Region || s3Env.region,
    s3Bucket: settings.s3Bucket || s3Env.bucket,
    s3AccessKey: settings.s3AccessKey || s3Env.accessKey,
    s3SecretKey: settings.s3SecretKey || s3Env.secretKey,
    s3PublicUrl: settings.s3PublicUrl || s3Env.publicUrl,
    s3UsePathStyle: storedS3Values ? settings.s3UsePathStyle : (s3Env.usePathStyle ?? settings.s3UsePathStyle),
    s3ConfigSource: "none",
    s3EnvFallbackActive: false,
  };

  const envUsed =
    (!settings.s3Endpoint && Boolean(s3Env.endpoint)) ||
    (!settings.s3Region && Boolean(s3Env.region)) ||
    (!settings.s3Bucket && Boolean(s3Env.bucket)) ||
    (!settings.s3AccessKey && Boolean(s3Env.accessKey)) ||
    (!settings.s3SecretKey && Boolean(s3Env.secretKey)) ||
    (!settings.s3PublicUrl && Boolean(s3Env.publicUrl)) ||
    (!storedS3Values && s3Env.usePathStyle !== null);

  if (envUsed && storedS3Values) {
    next.s3ConfigSource = "mixed";
    next.s3EnvFallbackActive = true;
    return next;
  }

  if (envUsed) {
    next.s3ConfigSource = "env";
    next.s3EnvFallbackActive = true;
    return next;
  }

  if (storedS3Values) {
    next.s3ConfigSource = "database";
    return next;
  }

  return next;
}

function normalizeSettings(row: SettingsRow): PlatformSettings {
  return {
    platformName: row.platform_name,
    supportEmail: row.support_email,
    maintenanceMode: row.maintenance_mode === 1 || row.maintenance_mode === true,
    allowNewSignups: row.allow_new_signups === 1 || row.allow_new_signups === true,
    requireEmailVerification:
      row.require_email_verification === 1 || row.require_email_verification === true,
    maintenanceMessage: row.maintenance_message || "",
    s3Enabled: row.addon_s3_enabled === 1 || row.addon_s3_enabled === true,
    s3Endpoint: row.s3_endpoint || "",
    s3Region: row.s3_region || "",
    s3Bucket: row.s3_bucket || "",
    s3AccessKey: decryptSecret(row.s3_access_key || ""),
    s3SecretKey: decryptSecret(row.s3_secret_key || ""),
    s3PublicUrl: row.s3_public_url || "",
    s3UsePathStyle: row.s3_use_path_style === 1 || row.s3_use_path_style === true,
    turnstileEnabled:
      row.addon_turnstile_enabled === 1 || row.addon_turnstile_enabled === true,
    turnstileSiteKey: row.turnstile_site_key || "",
    turnstileSecretKey: decryptSecret(row.turnstile_secret_key || ""),
    updatedAt: row.updated_at,
  };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  await ensureCoreSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<SettingsRow[]>(
    `
      SELECT
        platform_name,
        support_email,
        maintenance_mode,
        allow_new_signups,
        require_email_verification,
        maintenance_message,
        addon_s3_enabled,
        s3_endpoint,
        s3_region,
        s3_bucket,
        s3_access_key,
        s3_secret_key,
        s3_public_url,
        s3_use_path_style,
        addon_turnstile_enabled,
        turnstile_site_key,
        turnstile_secret_key,
        updated_at
      FROM platform_settings
      WHERE id = 1
      LIMIT 1
    `,
  );

  if (!rows[0]) {
    throw new Error("Platform settings row is missing");
  }

  return normalizeSettings(rows[0]);
}

export async function updatePlatformSettings(
  updates: Partial<Omit<PlatformSettings, "updatedAt">>,
  updatedByUserId: string | null,
): Promise<PlatformSettings> {
  await ensureCoreSchema();
  const pool = getMySQLPool();

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (typeof updates.platformName === "string") {
    fields.push("platform_name = ?");
    values.push(updates.platformName.trim() || "Ovmon");
  }

  if (typeof updates.supportEmail === "string") {
    fields.push("support_email = ?");
    values.push(updates.supportEmail.trim() || "support@ovmon.com");
  }

  if (typeof updates.maintenanceMode === "boolean") {
    fields.push("maintenance_mode = ?");
    values.push(updates.maintenanceMode ? 1 : 0);
  }

  if (typeof updates.allowNewSignups === "boolean") {
    fields.push("allow_new_signups = ?");
    values.push(updates.allowNewSignups ? 1 : 0);
  }

  if (typeof updates.requireEmailVerification === "boolean") {
    fields.push("require_email_verification = ?");
    values.push(updates.requireEmailVerification ? 1 : 0);
  }

  if (typeof updates.maintenanceMessage === "string") {
    fields.push("maintenance_message = ?");
    values.push(updates.maintenanceMessage.trim());
  }

  if (typeof updates.s3Enabled === "boolean") {
    fields.push("addon_s3_enabled = ?");
    values.push(updates.s3Enabled ? 1 : 0);
  }

  if (typeof updates.s3Endpoint === "string") {
    fields.push("s3_endpoint = ?");
    values.push(updates.s3Endpoint.trim() || null);
  }

  if (typeof updates.s3Region === "string") {
    fields.push("s3_region = ?");
    values.push(updates.s3Region.trim() || null);
  }

  if (typeof updates.s3Bucket === "string") {
    fields.push("s3_bucket = ?");
    values.push(updates.s3Bucket.trim() || null);
  }

  if (typeof updates.s3AccessKey === "string") {
    fields.push("s3_access_key = ?");
    values.push(updates.s3AccessKey.trim() ? encryptSecret(updates.s3AccessKey.trim()) : null);
  }

  if (typeof updates.s3SecretKey === "string") {
    fields.push("s3_secret_key = ?");
    values.push(updates.s3SecretKey.trim() ? encryptSecret(updates.s3SecretKey.trim()) : null);
  }

  if (typeof updates.s3PublicUrl === "string") {
    fields.push("s3_public_url = ?");
    values.push(updates.s3PublicUrl.trim() || null);
  }

  if (typeof updates.s3UsePathStyle === "boolean") {
    fields.push("s3_use_path_style = ?");
    values.push(updates.s3UsePathStyle ? 1 : 0);
  }

  if (typeof updates.turnstileEnabled === "boolean") {
    fields.push("addon_turnstile_enabled = ?");
    values.push(updates.turnstileEnabled ? 1 : 0);
  }

  if (typeof updates.turnstileSiteKey === "string") {
    fields.push("turnstile_site_key = ?");
    values.push(updates.turnstileSiteKey.trim() || null);
  }

  if (typeof updates.turnstileSecretKey === "string") {
    fields.push("turnstile_secret_key = ?");
    values.push(
      updates.turnstileSecretKey.trim()
        ? encryptSecret(updates.turnstileSecretKey.trim())
        : null,
    );
  }

  if (fields.length === 0) {
    return getPlatformSettings();
  }

  fields.push("updated_by = ?");
  values.push(updatedByUserId);

  await pool.query(
    `
      UPDATE platform_settings
      SET ${fields.join(", ")}
      WHERE id = 1
    `,
    values,
  );

  return getPlatformSettings();
}
