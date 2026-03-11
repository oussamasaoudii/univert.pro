import { getMySQLPool } from '@/lib/mysql/pool';
import { logger } from '@/lib/utils/errors';

interface MaintenanceMode {
  enabled: boolean;
  message: string;
  startTime: string;
  estimatedEndTime?: string;
  allowAdminAccess: boolean;
}

// Global maintenance mode state (in production, use database)
let maintenanceModeState: MaintenanceMode | null = null;

/**
 * Enable maintenance mode
 */
export async function enableMaintenanceMode(
  message: string,
  estimatedEndTime?: string,
  allowAdminAccess: boolean = true,
): Promise<void> {
  maintenanceModeState = {
    enabled: true,
    message,
    startTime: new Date().toISOString(),
    estimatedEndTime,
    allowAdminAccess,
  };

  logger.warn('Maintenance mode enabled', {
    message,
    estimatedEndTime,
    allowAdminAccess,
  });

  // In production, persist to database
  // await db.maintenanceMode.create({...})
}

/**
 * Disable maintenance mode
 */
export async function disableMaintenanceMode(): Promise<void> {
  maintenanceModeState = null;

  logger.info('Maintenance mode disabled');

  // In production, delete from database
  // await db.maintenanceMode.deleteAll()
}

/**
 * Get current maintenance mode status
 */
export async function getMaintenanceModeStatus(): Promise<MaintenanceMode | null> {
  // In production, check database first
  // const dbMode = await db.maintenanceMode.findFirst();
  // if (dbMode) return dbMode;

  return maintenanceModeState;
}

/**
 * Check if maintenance mode is active
 */
export async function isMaintenanceModeActive(): Promise<boolean> {
  const status = await getMaintenanceModeStatus();
  return status?.enabled ?? false;
}

/**
 * Middleware to check maintenance mode and allow admin bypass
 */
export async function checkMaintenanceMode(userId?: string, isAdmin?: boolean): Promise<boolean> {
  const status = await getMaintenanceModeStatus();

  if (!status?.enabled) {
    return true; // Not in maintenance mode
  }

  // Allow admin users to bypass maintenance mode if configured
  if (status.allowAdminAccess && isAdmin) {
    logger.debug('Admin user bypassing maintenance mode', { userId });
    return true;
  }

  return false; // Maintenance mode is active and user cannot bypass
}

/**
 * Get maintenance mode message for UI
 */
export async function getMaintenanceModeMessage(): Promise<string | null> {
  const status = await getMaintenanceModeStatus();

  if (!status?.enabled) {
    return null;
  }

  let message = status.message;

  if (status.estimatedEndTime) {
    const endTime = new Date(status.estimatedEndTime);
    message += ` - Estimated completion: ${endTime.toLocaleTimeString()}`;
  }

  return message;
}

/**
 * Service health check results
 */
export interface ServiceHealthStatus {
  database: 'healthy' | 'degraded' | 'offline';
  storage: 'healthy' | 'degraded' | 'offline';
  queue: 'healthy' | 'degraded' | 'offline';
  aapanel: 'healthy' | 'degraded' | 'offline';
  dns: 'healthy' | 'degraded' | 'offline';
  stripe: 'healthy' | 'degraded' | 'offline';
  overall: 'healthy' | 'degraded' | 'critical' | 'offline';
}

const HEALTH_CHECK_CACHE: {
  status: ServiceHealthStatus | null;
  timestamp: number;
} = {
  status: null,
  timestamp: 0,
};

const HEALTH_CHECK_TTL = 30000; // 30 seconds

/**
 * Check overall service health
 */
export async function checkServiceHealth(): Promise<ServiceHealthStatus> {
  const now = Date.now();

  // Return cached result if recent
  if (HEALTH_CHECK_CACHE.status && now - HEALTH_CHECK_CACHE.timestamp < HEALTH_CHECK_TTL) {
    return HEALTH_CHECK_CACHE.status;
  }

  const status: ServiceHealthStatus = {
    database: await checkDatabaseHealth(),
    storage: await checkStorageHealth(),
    queue: await checkQueueHealth(),
    aapanel: await checkAaPanelHealth(),
    dns: await checkDnsHealth(),
    stripe: await checkStripeHealth(),
    overall: 'healthy',
  };

  // Determine overall health
  const unhealthyServices = Object.entries(status)
    .filter(([key, value]) => key !== 'overall' && value === 'offline')
    .length;

  const degradedServices = Object.entries(status)
    .filter(([key, value]) => key !== 'overall' && value === 'degraded')
    .length;

  if (unhealthyServices > 2) {
    status.overall = 'offline';
  } else if (unhealthyServices > 0) {
    status.overall = 'critical';
  } else if (degradedServices > 0) {
    status.overall = 'degraded';
  }

  HEALTH_CHECK_CACHE.status = status;
  HEALTH_CHECK_CACHE.timestamp = now;

  return status;
}

async function checkDatabaseHealth(): Promise<'healthy' | 'degraded' | 'offline'> {
  try {
    const pool = getMySQLPool();
    await pool.query("SELECT 1");
    return 'healthy';
  } catch (error) {
    logger.error('Database health check failed', error);
    return 'offline';
  }
}

async function checkStorageHealth(): Promise<'healthy' | 'degraded' | 'offline'> {
  // Check if storage service is reachable
  // Placeholder - implement based on your storage provider
  try {
    // In production, test connection to S3/GCS/etc
    return 'healthy';
  } catch {
    return 'offline';
  }
}

async function checkQueueHealth(): Promise<'healthy' | 'degraded' | 'offline'> {
  // Check if Redis/queue is reachable
  // Placeholder - implement based on your queue provider
  try {
    // In production, test connection to Redis/Upstash/etc
    return 'healthy';
  } catch {
    return 'offline';
  }
}

async function checkAaPanelHealth(): Promise<'healthy' | 'degraded' | 'offline'> {
  // Check if aaPanel is reachable
  // Placeholder - implement actual health check
  try {
    // In production, make test API call to aaPanel
    return 'healthy';
  } catch {
    return 'offline';
  }
}

async function checkDnsHealth(): Promise<'healthy' | 'degraded' | 'offline'> {
  // Check if DNS provider is reachable
  // Placeholder - implement based on your DNS provider
  try {
    // In production, test connection to DNS provider API
    return 'healthy';
  } catch {
    return 'offline';
  }
}

async function checkStripeHealth(): Promise<'healthy' | 'degraded' | 'offline'> {
  // Check if Stripe is reachable
  // Placeholder - implement actual health check
  try {
    // In production, make test API call to Stripe
    return 'healthy';
  } catch {
    return 'offline';
  }
}

/**
 * Format service health for logging/display
 */
export function formatServiceHealth(status: ServiceHealthStatus): string {
  return `
Service Health Status:
  Database: ${status.database}
  Storage: ${status.storage}
  Queue: ${status.queue}
  aaPanel: ${status.aapanel}
  DNS: ${status.dns}
  Stripe: ${status.stripe}
  Overall: ${status.overall}
`.trim();
}
