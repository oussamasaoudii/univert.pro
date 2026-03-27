import { getMySQLPool, isMySQLConfigured } from '@/lib/mysql/pool';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Tables required by the application
const REQUIRED_TABLES = [
  // Core tables
  'users',
  'sessions',
  'password_resets',
  'email_verifications',
  'oauth_accounts',
  
  // System tables
  'settings',
  'audit_logs',
  'rate_limits',
  
  // Content tables
  'countries',
  'pricing',
  'websites',
  'templates',
  'servers',
  'provisioning_profiles',
  'provisioning_queue',
  'domains',
  'backups',
  
  // New feature tables
  'notifications',
  'notification_preferences',
  'support_tickets',
  'support_ticket_replies',
  'analytics_events',
  'analytics_sessions',
  'analytics_daily_stats',
  'roles',
  'permissions',
  'role_permissions',
  'user_roles',
  'coupons',
  'coupon_usage',
  'loyalty_points',
  'loyalty_transactions',
  'api_keys',
  'webhooks',
  'webhook_logs',
];

export async function GET() {
  if (!isMySQLConfigured()) {
    return NextResponse.json({
      error: 'Database not configured',
    }, { status: 500 });
  }

  try {
    const pool = getMySQLPool();
    
    // Get all existing tables
    const [tables] = await pool.query<any[]>(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_DATABASE]
    );
    
    const existingTables = tables.map((t: any) => t.TABLE_NAME);
    
    // Find missing tables
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));
    
    // Get columns for existing tables
    const [columns] = await pool.query<any[]>(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
       FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      [process.env.DB_DATABASE]
    );
    
    // Group columns by table
    const tableColumns: Record<string, any[]> = {};
    for (const col of columns) {
      if (!tableColumns[col.TABLE_NAME]) {
        tableColumns[col.TABLE_NAME] = [];
      }
      tableColumns[col.TABLE_NAME].push({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        default: col.COLUMN_DEFAULT,
        key: col.COLUMN_KEY,
        extra: col.EXTRA,
      });
    }
    
    // Get indexes
    const [indexes] = await pool.query<any[]>(
      `SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`,
      [process.env.DB_DATABASE]
    );
    
    // Group indexes by table
    const tableIndexes: Record<string, any[]> = {};
    for (const idx of indexes) {
      if (!tableIndexes[idx.TABLE_NAME]) {
        tableIndexes[idx.TABLE_NAME] = [];
      }
      tableIndexes[idx.TABLE_NAME].push({
        name: idx.INDEX_NAME,
        column: idx.COLUMN_NAME,
        unique: idx.NON_UNIQUE === 0,
      });
    }
    
    return NextResponse.json({
      status: 'success',
      database: process.env.DB_DATABASE,
      existingTables,
      missingTables,
      tableColumns,
      tableIndexes,
      summary: {
        totalExisting: existingTables.length,
        totalRequired: REQUIRED_TABLES.length,
        totalMissing: missingTables.length,
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
    }, { status: 500 });
  }
}
