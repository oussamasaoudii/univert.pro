import { z } from 'zod';

function parseBooleanFlag(value: string | undefined) {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

/**
 * Production Environment Configuration
 * Validates and provides type-safe access to all environment variables
 * Fails fast if required variables are missing
 */

const environmentSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  DEPLOYMENT_ENVIRONMENT: z.string().default('development'),

  // Database (optional for dev - uses defaults)
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default('72.60.90.147'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USERNAME: z.string().default('univert_v0_temp'),
  DB_PASSWORD: z.string().default('d6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b'),
  DB_DATABASE: z.string().default('ovmon_db'),
  MYSQL_HOST: z.string().default('72.60.90.147'),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string().default('univert_v0_temp'),
  MYSQL_PASSWORD: z.string().default('d6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b'),
  MYSQL_DATABASE: z.string().default('ovmon_db'),

  // Billing (optional for dev)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // aaPanel (optional for dev)
  AAPANEL_BASE_URL: z.string().url().optional(),
  AAPANEL_PORT: z.coerce.number().default(7800),
  AAPANEL_API_KEY: z.string().optional(),
  AAPANEL_REQUEST_TIMEOUT: z.coerce.number().default(30000),

  // DNS/Domains (optional for dev)
  DNS_PROVIDER: z.enum(['cloudflare', 'route53', 'digitalocean', 'none']).default('none'),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_GLOBAL_API_KEY: z.string().optional(),
  CLOUDFLARE_EMAIL: z.string().email().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_BASE_URL: z.string().url().optional(),
  CLOUDFLARE_PROXIED: z.string().transform(v => v === 'true').default('true'),
  CLOUDFLARE_DEFAULT_TTL: z.coerce.number().default(1),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
  ROUTE53_ACCESS_KEY_ID: z.string().optional(),
  ROUTE53_SECRET_ACCESS_KEY: z.string().optional(),
  DIGITALOCEAN_TOKEN: z.string().optional(),

  // SSL (optional for dev)
  LETSENCRYPT_EMAIL: z.string().email().optional(),
  LETSENCRYPT_API_ENDPOINT: z.string().url().optional(),
  CUSTOM_DOMAIN_TARGET_HOST: z.string().optional(),

  // Queue/Redis
  REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Storage (optional for dev)
  STORAGE_PROVIDER: z.enum(['s3', 'gcs', 'none']).default('none'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_BUCKET: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_DEFAULT_REGION: z.string().optional(),
  AWS_ENDPOINT: z.string().url().optional(),
  AWS_URL: z.string().url().optional(),
  AWS_USE_PATH_STYLE_ENDPOINT: z.string().optional(),
  GCS_PROJECT_ID: z.string().optional(),
  GCS_BUCKET_NAME: z.string().optional(),
  GCS_CREDENTIALS: z.string().optional(),

  // Observability
  SENTRY_DSN: z.string().url().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_API_HOST: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_SERVICE: z.string().default('ovmon'),

  // Email (optional for dev)
  EMAIL_PROVIDER: z.enum(['sendgrid', 'resend', 'none']).default('none'),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  RESEND_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Security (with dev defaults)
  ENCRYPTION_KEY: z.string().min(32).default('dev-encryption-key-32-chars-min!!'),
  WEBHOOK_SECRET: z.string().min(32).default('dev-webhook-secret-32-chars-min!!'),

  // Features
  FEATURE_ENABLE_CUSTOM_DOMAINS: z.string().transform(v => v === 'true').default('true'),
  FEATURE_ENABLE_SSL_AUTO_RENEWAL: z.string().transform(v => v === 'true').default('true'),
  FEATURE_ENABLE_BACKUPS: z.string().transform(v => v === 'true').default('true'),
  FEATURE_ENABLE_EXPORTS: z.string().transform(v => v === 'true').default('true'),
  FEATURE_ENABLE_MONITORING: z.string().transform(v => v === 'true').default('true'),
  FEATURE_ENABLE_MANUAL_PROVISIONING: z.string().transform(v => v === 'true').default('false'),

  // Settings
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.coerce.number().default(100),
  RATE_LIMIT_BURST_SIZE: z.coerce.number().default(10),
  QUEUE_WORKER_BATCH_SIZE: z.coerce.number().default(5),
  QUEUE_WORKER_IDLE_TIMEOUT_MS: z.coerce.number().default(30000),
  QUEUE_MAX_RETRY_ATTEMPTS: z.coerce.number().default(3),
  HEALTH_CHECK_INTERVAL_MINUTES: z.coerce.number().default(5),
  HEALTH_CHECK_TIMEOUT_MS: z.coerce.number().default(10000),
  BACKUP_MAX_AGE_DAYS: z.coerce.number().default(365),
  BACKUP_CLEANUP_INTERVAL_HOURS: z.coerce.number().default(24),
});

type Environment = z.infer<typeof environmentSchema>;

let config: Environment | null = null;

export function loadConfig(): Environment {
  if (config) return config;

  const result = environmentSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  config = result.data;
  return config;
}

export function getConfig(): Environment {
  if (!config) {
    return loadConfig();
  }
  return config;
}

// Type-safe getters
export const appConfig = () => {
  const c = getConfig();
  return {
    nodeEnv: c.NODE_ENV,
    appUrl: c.NEXT_PUBLIC_APP_URL,
    environment: c.DEPLOYMENT_ENVIRONMENT,
    isDevelopment: c.NODE_ENV === 'development',
    isProduction: c.NODE_ENV === 'production',
    isTest: c.NODE_ENV === 'test',
  };
};

export const databaseConfig = () => {
  const c = getConfig();
  return {
    url: c.DATABASE_URL,
    mysql: {
      host: c.DB_HOST || c.MYSQL_HOST,
      port: c.DB_PORT || c.MYSQL_PORT,
      user: c.DB_USERNAME || c.MYSQL_USER,
      password: c.DB_PASSWORD || c.MYSQL_PASSWORD,
      database: c.DB_DATABASE || c.MYSQL_DATABASE,
    },
  };
};

export const billingConfig = () => {
  const c = getConfig();
  return {
    stripeSecretKey: c.STRIPE_SECRET_KEY,
    stripePublishableKey: c.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeWebhookSecret: c.STRIPE_WEBHOOK_SECRET,
  };
};

export const aaPanelConfig = () => {
  const c = getConfig();
  return {
    baseUrl: c.AAPANEL_BASE_URL,
    port: c.AAPANEL_PORT,
    apiKey: c.AAPANEL_API_KEY,
    requestTimeoutMs: c.AAPANEL_REQUEST_TIMEOUT,
  };
};

export const dnsConfig = () => {
  const c = getConfig();
  return {
    provider: c.DNS_PROVIDER,
    cloudflare: {
      apiToken: c.CLOUDFLARE_API_TOKEN,
      globalApiKey: c.CLOUDFLARE_GLOBAL_API_KEY,
      email: c.CLOUDFLARE_EMAIL,
      accountId: c.CLOUDFLARE_ACCOUNT_ID,
      apiBaseUrl: c.CLOUDFLARE_API_BASE_URL,
      proxied: c.CLOUDFLARE_PROXIED,
      ttl: c.CLOUDFLARE_DEFAULT_TTL,
      zoneId: c.CLOUDFLARE_ZONE_ID,
    },
    route53: {
      accessKeyId: c.ROUTE53_ACCESS_KEY_ID,
      secretAccessKey: c.ROUTE53_SECRET_ACCESS_KEY,
    },
    digitalOcean: {
      token: c.DIGITALOCEAN_TOKEN,
    },
  };
};

export const storageConfig = () => {
  const c = getConfig();
  return {
    provider: c.STORAGE_PROVIDER,
    s3: {
      accessKeyId: c.AWS_ACCESS_KEY_ID,
      secretAccessKey: c.AWS_SECRET_ACCESS_KEY,
      bucket: c.AWS_S3_BUCKET || c.AWS_BUCKET,
      region: c.AWS_REGION || c.AWS_DEFAULT_REGION,
      endpoint: c.AWS_ENDPOINT,
      publicUrl: c.AWS_URL,
      usePathStyleEndpoint: parseBooleanFlag(c.AWS_USE_PATH_STYLE_ENDPOINT),
    },
    gcs: {
      projectId: c.GCS_PROJECT_ID,
      bucketName: c.GCS_BUCKET_NAME,
      credentials: c.GCS_CREDENTIALS,
    },
  };
};

export const securityConfig = () => {
  const c = getConfig();
  return {
    encryptionKey: c.ENCRYPTION_KEY,
    webhookSecret: c.WEBHOOK_SECRET,
    rateLimitRequestsPerMinute: c.RATE_LIMIT_REQUESTS_PER_MINUTE,
    rateLimitBurstSize: c.RATE_LIMIT_BURST_SIZE,
  };
};

export const featureFlags = () => {
  const c = getConfig();
  return {
    enableCustomDomains: c.FEATURE_ENABLE_CUSTOM_DOMAINS,
    enableSslAutoRenewal: c.FEATURE_ENABLE_SSL_AUTO_RENEWAL,
    enableBackups: c.FEATURE_ENABLE_BACKUPS,
    enableExports: c.FEATURE_ENABLE_EXPORTS,
    enableMonitoring: c.FEATURE_ENABLE_MONITORING,
    enableManualProvisioning: c.FEATURE_ENABLE_MANUAL_PROVISIONING,
  };
};
