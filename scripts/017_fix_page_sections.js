import mysql from 'mysql2/promise';

const config = {
  host: process.env.MYSQL_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.MYSQL_PORT || '4000', 10),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'ovmon',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
};

async function main() {
  console.log('Connecting to TiDB Cloud (ovmon database)...');
  
  if (!config.password) {
    console.error('ERROR: MYSQL_PASSWORD environment variable is not set');
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');
    
    // Check current columns in page_sections
    console.log('\nChecking page_sections table structure...');
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'ovmon' AND TABLE_NAME = 'page_sections'`
    );
    console.log('Current columns:', columns.map(c => c.COLUMN_NAME).join(', '));
    
    // Add is_active column if not exists
    const hasIsActive = columns.some(c => c.COLUMN_NAME === 'is_active');
    if (!hasIsActive) {
      console.log('\nAdding is_active column...');
      await connection.execute(`ALTER TABLE page_sections ADD COLUMN is_active BOOLEAN DEFAULT TRUE`);
      console.log('Added is_active column.');
    } else {
      console.log('\nis_active column already exists.');
    }
    
    // Also ensure auth_rate_limits table exists in ovmon
    console.log('\nChecking auth_rate_limits table...');
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'ovmon' AND TABLE_NAME = 'auth_rate_limits'`
    );
    
    if (tables.length === 0) {
      console.log('Creating auth_rate_limits table...');
      await connection.execute(`
        CREATE TABLE auth_rate_limits (
          key_hash VARCHAR(64) NOT NULL,
          scope VARCHAR(64) NOT NULL,
          attempts INT DEFAULT 0,
          window_started_at DATETIME NOT NULL,
          blocked_until DATETIME DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (key_hash),
          INDEX idx_scope (scope),
          INDEX idx_blocked_until (blocked_until)
        )
      `);
      console.log('Created auth_rate_limits table.');
    } else {
      console.log('auth_rate_limits table already exists.');
    }
    
    console.log('\nDone!');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
