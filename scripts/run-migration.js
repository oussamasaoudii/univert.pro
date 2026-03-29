import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const sql = fs.readFileSync(path.join(__dirname, '050_contact_messages.sql'), 'utf8');
    await connection.query(sql);
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
