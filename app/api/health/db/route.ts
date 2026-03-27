import { getMySQLPool, isMySQLConfigured } from '@/lib/mysql/pool';
import { type NextRequest, NextResponse } from 'next/server';

// Sanitize host to remove whitespace
function sanitizeHost(host: string | undefined): string {
  return (host || "").replace(/\s+/g, "");
}

export async function GET(request: NextRequest) {
  try {
    // Check if MySQL is configured
    if (!isMySQLConfigured()) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'MySQL is not configured',
          configured: false,
        },
        { status: 503 }
      );
    }

    // Get the MySQL pool
    const pool = getMySQLPool();
    if (!pool) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to create MySQL pool',
          configured: false,
        },
        { status: 503 }
      );
    }

    // Test the connection
    const startTime = Date.now();
    const [rows] = await pool.query('SELECT 1 as connection_test');
    const duration = Date.now() - startTime;

    console.log('[Health Check] Database connection successful', { duration });

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      configured: true,
      database: {
        host: sanitizeHost(process.env.DB_HOST),
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
      },
      response_time_ms: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Health Check] Database connection failed:', errorMessage);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: errorMessage,
        configured: isMySQLConfigured(),
        database: {
          host: sanitizeHost(process.env.DB_HOST),
          port: process.env.DB_PORT,
          database: process.env.DB_DATABASE,
          username: process.env.DB_USERNAME,
        },
      },
      { status: 503 }
    );
  }
}
