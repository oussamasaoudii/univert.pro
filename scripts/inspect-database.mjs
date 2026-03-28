import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: '72.60.90.147',
  port: 3306,
  database: 'ovmon_db',
  user: 'univert_v0_temp',
  password: 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b'
});

console.log('Connected to MySQL database: ovmon_db\n');

// Get all tables
const [tables] = await connection.execute(`
  SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT 
  FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = 'ovmon_db'
  ORDER BY TABLE_NAME
`);

console.log(`Found ${tables.length} tables:\n`);
console.log('='.repeat(80));

for (const table of tables) {
  console.log(`\nTable: ${table.TABLE_NAME}`);
  console.log(`Estimated Rows: ${table.TABLE_ROWS || 0}`);
  if (table.TABLE_COMMENT) console.log(`Comment: ${table.TABLE_COMMENT}`);
  console.log('-'.repeat(40));
  
  // Get columns for each table
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'ovmon_db' AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
  `, [table.TABLE_NAME]);
  
  console.log('Columns:');
  for (const col of columns) {
    const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
    const key = col.COLUMN_KEY ? `[${col.COLUMN_KEY}]` : '';
    const extra = col.EXTRA ? `(${col.EXTRA})` : '';
    console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${nullable} ${key} ${extra}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('\nDatabase inspection complete!');

await connection.end();
