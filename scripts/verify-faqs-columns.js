import mysql from 'mysql2/promise';

const config = {
  host: '72.60.90.147',
  port: 3306,
  user: 'univert_v0_temp',
  password: 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b',
  database: 'ovmon_db',
};

async function verifyColumns() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('[v0] Checking faqs table structure...');
    const [columns] = await connection.execute('DESCRIBE faqs');
    console.log('[v0] Current FAQs table columns:');
    console.log(columns);
  } catch (error) {
    console.error('[v0] Error:', error);
  } finally {
    await connection.end();
  }
}

verifyColumns();
