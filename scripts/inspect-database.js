import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: '72.60.90.147',
  port: 3306,
  user: 'univert_v0_temp',
  password: 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b',
  database: 'ovmon_db'
});

console.log('Connected to MySQL database successfully!\n');

// Get all tables
const [tables] = await connection.query('SHOW TABLES');
const tableKey = Object.keys(tables[0])[0];

console.log('='.repeat(60));
console.log('DATABASE SCHEMA: ovmon_db');
console.log('='.repeat(60));
console.log(`\nTotal Tables: ${tables.length}\n`);

for (const table of tables) {
  const tableName = table[tableKey];
  console.log('-'.repeat(60));
  console.log(`TABLE: ${tableName}`);
  console.log('-'.repeat(60));
  
  // Get columns for each table
  const [columns] = await connection.query(`DESCRIBE ${tableName}`);
  
  console.log('Columns:');
  for (const col of columns) {
    const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
    const key = col.Key ? ` [${col.Key}]` : '';
    const defaultVal = col.Default !== null ? ` DEFAULT: ${col.Default}` : '';
    console.log(`  - ${col.Field}: ${col.Type} ${nullable}${key}${defaultVal}`);
  }
  
  // Get row count
  const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
  console.log(`Row Count: ${countResult[0].count}\n`);
}

await connection.end();
console.log('\nDatabase inspection complete!');
