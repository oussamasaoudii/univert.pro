/**
 * TiDB Cloud Connection Test Script
 * Run with: npx tsx scripts/test-tidb-connection.ts
 */

import mysql from 'mysql2/promise';

async function testConnection() {
  const host = process.env.MYSQL_HOST;
  const port = parseInt(process.env.MYSQL_PORT || '4000', 10);
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  console.log('Testing TiDB Cloud connection...');
  console.log('Host:', host);
  console.log('Port:', port);
  console.log('User:', user);
  console.log('Database:', database);

  if (!host || !user || !password || !database) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const isTiDB = host.includes('tidbcloud.com');

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ...(isTiDB && {
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
      }),
    });

    console.log('\n✓ Connected successfully to TiDB Cloud!');

    // Test query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('TiDB Version:', (rows as any)[0].version);

    // List existing tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nExisting tables:');
    if ((tables as any[]).length === 0) {
      console.log('  (no tables found)');
    } else {
      (tables as any[]).forEach((t: any) => {
        const tableName = Object.values(t)[0];
        console.log('  -', tableName);
      });
    }

    await connection.end();
    console.log('\n✓ Connection test completed successfully!');
  } catch (error) {
    console.error('\n✗ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
