import { NextRequest, NextResponse } from 'next/server';
import { checkServiceHealth, formatServiceHealth } from '@/lib/utils/maintenance';
import { logger } from '@/lib/utils/errors';

export const runtime = 'nodejs';

/**
 * Health check endpoint
 * Returns service status for monitoring and load balancing
 */
export async function GET(request: NextRequest) {
  try {
    const health = await checkServiceHealth();

    const statusCode = 
      health.overall === 'healthy' ? 200 :
      health.overall === 'degraded' ? 503 :
      health.overall === 'critical' ? 503 :
      500;

    logger.debug('Health check performed', {
      overall: health.overall,
      statusCode,
    });

    return NextResponse.json(
      {
        status: health.overall,
        timestamp: new Date().toISOString(),
        services: {
          database: health.database,
          storage: health.storage,
          queue: health.queue,
          aapanel: health.aapanel,
          dns: health.dns,
          stripe: health.stripe,
        },
      },
      { status: statusCode },
    );
  } catch (error) {
    logger.error('Health check failed', error);

    return NextResponse.json(
      {
        status: 'offline',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 },
    );
  }
}
