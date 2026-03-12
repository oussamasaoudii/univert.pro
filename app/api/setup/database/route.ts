import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

/**
 * Database Setup API
 * GET - Test connection and show existing tables
 * POST - Create all tables from schema
 */

async function getConnection() {
  const host = process.env.MYSQL_HOST;
  const port = parseInt(process.env.MYSQL_PORT || '4000', 10);
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  if (!host || !user || !password || !database) {
    throw new Error('Database environment variables not configured');
  }

  const isTiDB = host.includes('tidbcloud.com');

  return mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    ...(isTiDB && {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    }),
  });
}

export async function GET() {
  try {
    const connection = await getConnection();

    // Get version
    const [versionRows] = await connection.execute('SELECT VERSION() as version');
    const version = (versionRows as any)[0].version;

    // Get existing tables
    const [tableRows] = await connection.execute('SHOW TABLES');
    const tables = (tableRows as any[]).map((t: any) => Object.values(t)[0]);

    await connection.end();

    return NextResponse.json({
      success: true,
      connection: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DATABASE,
        version,
      },
      tables,
      message: `Connected successfully. Found ${tables.length} tables.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const connection = await getConnection();

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'scripts', '014_tidb_full_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      await connection.end();
      return NextResponse.json(
        { success: false, error: 'Schema file not found' },
        { status: 404 }
      );
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        await connection.execute(statement);
        successCount++;
        
        // Log table creation
        const createMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        if (createMatch) {
          results.push(`Created table: ${createMatch[1]}`);
        }
        
        const insertMatch = statement.match(/INSERT IGNORE INTO (\w+)/i);
        if (insertMatch) {
          results.push(`Inserted data into: ${insertMatch[1]}`);
        }
      } catch (err: any) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists')) {
          errorCount++;
          results.push(`Error: ${err.message.substring(0, 100)}`);
        }
      }
    }

    // Get final table count
    const [tableRows] = await connection.execute('SHOW TABLES');
    const tables = (tableRows as any[]).map((t: any) => Object.values(t)[0]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: `Schema setup completed. ${successCount} statements executed.`,
      tables,
      details: results,
      stats: { successCount, errorCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
