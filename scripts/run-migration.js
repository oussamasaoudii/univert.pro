import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '72.60.90.147',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'univert_v0_temp',
  password: process.env.DB_PASSWORD || 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b',
  database: process.env.DB_DATABASE || 'ovmon_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    // Add missing received_at column if it doesn't exist
    try {
      await connection.query(
        `ALTER TABLE contact_messages ADD COLUMN received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status`
      );
      console.log('✓ Added received_at column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('[v0] received_at column already exists');
      } else {
        throw error;
      }
    }

    // Add missing responded_at column if it doesn't exist
    try {
      await connection.query(
        `ALTER TABLE contact_messages ADD COLUMN responded_at TIMESTAMP NULL`
      );
      console.log('✓ Added responded_at column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('[v0] responded_at column already exists');
      } else {
        throw error;
      }
    }

    // Add notes column if it doesn't exist
    try {
      await connection.query(
        `ALTER TABLE contact_messages ADD COLUMN notes TEXT`
      );
      console.log('✓ Added notes column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('[v0] notes column already exists');
      } else {
        throw error;
      }
    }

    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigration().catch((error) => {
  process.exit(1);
});
