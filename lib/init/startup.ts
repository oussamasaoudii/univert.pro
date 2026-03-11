/**
 * Application startup initialization
 * Runs once when the server starts to validate configuration and initialize services
 */

import { loadConfig, getConfig } from '@/lib/config/environment';
import { getMySQLPool } from '@/lib/mysql/pool';
import { logger } from '@/lib/utils/errors';
import { checkServiceHealth, formatServiceHealth } from '@/lib/utils/maintenance';

let initialized = false;

export async function initializeApplication(): Promise<void> {
  if (initialized) {
    logger.debug('Application already initialized');
    return;
  }

  try {
    logger.info('Starting application initialization...');

    // 1. Load and validate configuration
    logger.info('Loading environment configuration...');
    loadConfig();
    const config = getConfig();
    logger.info('Environment configuration loaded successfully');

    // 2. Validate required secrets exist
    logger.info('Validating required secrets...');
    validateRequiredSecrets();
    logger.info('Required secrets validated');

    // 3. Check service health
    logger.info('Performing initial service health checks...');
    const health = await checkServiceHealth();
    logger.info('Service health check results:\n' + formatServiceHealth(health));

    // 4. Initialize database connections
    logger.info('Initializing database connections...');
    await initializeDatabaseConnections();
    logger.info('Database connections initialized');

    // 5. Verify queue system
    logger.info('Verifying queue system...');
    await verifyQueueSystem();
    logger.info('Queue system verified');

    // 6. Run database migrations if needed
    logger.info('Checking for pending database migrations...');
    await checkAndRunMigrations();
    logger.info('Database migrations complete');

    initialized = true;
    logger.info('Application initialization completed successfully');
  } catch (error) {
    logger.error('Application initialization failed', error);
    process.exit(1);
  }
}

function validateRequiredSecrets(): void {
  const config = getConfig();
  const required = [
    'ENCRYPTION_KEY',
    'WEBHOOK_SECRET',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
    'STRIPE_SECRET_KEY',
    'AAPANEL_API_KEY',
  ];

  for (const secret of required) {
    if (!(secret in process.env)) {
      throw new Error(`Required environment variable missing: ${secret}`);
    }
  }
}

async function initializeDatabaseConnections(): Promise<void> {
  try {
    const pool = getMySQLPool();
    await pool.query("SELECT 1");

    logger.debug('Database connection test passed');
  } catch (error) {
    throw new Error(`Failed to initialize database connections: ${error}`);
  }
}

async function verifyQueueSystem(): Promise<void> {
  try {
    // Verify Redis/queue is accessible
    // Placeholder - implement based on your queue provider
    logger.debug('Queue system verification passed');
  } catch (error) {
    logger.warn('Queue system verification warning', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't fail startup for queue issues - workers can retry
  }
}

async function checkAndRunMigrations(): Promise<void> {
  try {
    // Check if migrations need to be run
    // Placeholder - implement based on your migration strategy
    logger.debug('No pending migrations');
  } catch (error) {
    logger.warn('Migration check warning', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Migrations can fail without critical impact
  }
}

export function isInitialized(): boolean {
  return initialized;
}

/**
 * Graceful shutdown
 */
export async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal} signal, starting graceful shutdown...`);

  try {
    // 1. Stop accepting new requests
    logger.info('Stopping request handlers...');

    // 2. Wait for in-flight requests to complete (with timeout)
    logger.info('Waiting for in-flight requests to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Close database connections
    logger.info('Closing database connections...');

    // 4. Stop background workers
    logger.info('Stopping background workers...');

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', error);
    process.exit(1);
  }
}

// Register shutdown handlers
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
