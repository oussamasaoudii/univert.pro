import { getAapanelConfig } from "@/lib/aapanel/config";

export const provisioningConfig = {
  get aapanel() {
    const config = getAapanelConfig();
    return {
      enabled: true,
      apiUrl: config.baseUrl,
      apiKey: config.apiKey,
      templateSourcePath: config.templatesBasePath,
      deploymentBasePath: config.deploymentsBasePath,
      timeout: config.requestTimeoutMs,
      retryPolicy: {
        maxAttempts: 3,
        delayMs: 1000,
      },
    };
  },
  jobProcessing: {
    batchSize: parseInt(process.env.PROVISIONING_BATCH_SIZE || "5", 10),
    pollingIntervalMs: parseInt(process.env.PROVISIONING_POLL_INTERVAL || "5000", 10),
    jobTimeoutMs: parseInt(process.env.PROVISIONING_JOB_TIMEOUT || "3600000", 10),
  },
  logging: {
    level: process.env.PROVISIONING_LOG_LEVEL || "info",
    persistLogs: process.env.PROVISIONING_PERSIST_LOGS === "true",
    logRetentionDays: parseInt(process.env.PROVISIONING_LOG_RETENTION || "90", 10),
  },
  notifications: {
    enabled: process.env.PROVISIONING_NOTIFICATIONS === "true",
    webhookUrl: process.env.PROVISIONING_WEBHOOK_URL,
    emailOnCompletion: process.env.PROVISIONING_EMAIL_ON_COMPLETE === "true",
  },
};

export function validateProvisioningConfig(): { valid: boolean; errors: string[] } {
  try {
    getAapanelConfig();
    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Invalid aaPanel configuration"],
    };
  }
}
