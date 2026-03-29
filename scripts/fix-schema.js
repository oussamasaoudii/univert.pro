import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkAndFixSchema() {
  const connection = await pool.getConnection();
  try {
    // Check current table structure
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'contact_messages' AND TABLE_SCHEMA = ?
    `, [process.env.DB_DATABASE]);
    
    const columnNames = columns.map((col) => col.COLUMN_NAME);
    console.log('[v0] Current columns:', columnNames);

    // Add received_at if missing
    if (!columnNames.includes('received_at')) {
      await connection.query(
        `ALTER TABLE contact_messages ADD COLUMN received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status`
      );
      console.log('✓ Added received_at column');
    }

    // Add responded_at if missing
    if (!columnNames.includes('responded_at')) {
      await connection.query(
        `ALTER TABLE contact_messages ADD COLUMN responded_at TIMESTAMP NULL AFTER received_at`
      );
      console.log('✓ Added responded_at column');
    }

    // Add notes if missing
    if (!columnNames.includes('notes')) {
      await connection.query(
        `ALTER TABLE contact_messages ADD COLUMN notes TEXT AFTER responded_at`
      );
      console.log('✓ Added notes column');
    }

    console.log('✓ Schema check completed');
  } catch (error) {
    console.error('✗ Schema fix failed:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

checkAndFixSchema().catch(console.error);
