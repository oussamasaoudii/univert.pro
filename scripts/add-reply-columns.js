const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function addReplyColumn() {
  const connection = await pool.getConnection();
  try {
    // Add admin_reply column if it doesn't exist
    try {
      await connection.query(
        `ALTER TABLE contact_messages ADD COLUMN admin_reply LONGTEXT NULL`
      );
      console.log('✓ Added admin_reply column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('[v0] admin_reply column already exists');
      } else {
        throw error;
      }
    }

    // Add admin_replied_at column if it doesn't exist
    try {
      await connection.query(
        `ALTER TABLE contact_messages ADD COLUMN admin_replied_at TIMESTAMP NULL`
      );
      console.log('✓ Added admin_replied_at column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('[v0] admin_replied_at column already exists');
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

addReplyColumn();
