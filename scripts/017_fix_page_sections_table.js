import mysql from 'mysql2/promise';

const TARGET_DATABASE = 'ovmon';

const config = {
  host: process.env.MYSQL_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.MYSQL_PORT || '4000', 10),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: TARGET_DATABASE,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
};

async function main() {
  console.log('Fixing page_sections table structure...');
  
  if (!config.password) {
    console.error('ERROR: MYSQL_PASSWORD environment variable is not set');
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');
    
    // Drop the old table and recreate with correct structure
    console.log('Dropping old page_sections table...');
    await connection.execute('DROP TABLE IF EXISTS page_sections');
    
    console.log('Creating page_sections table with correct structure...');
    await connection.execute(`
      CREATE TABLE page_sections (
        id CHAR(36) PRIMARY KEY,
        page_key VARCHAR(64) NOT NULL,
        section_key VARCHAR(64) NOT NULL,
        title_en VARCHAR(255) NULL,
        title_ar VARCHAR(255) NULL,
        subtitle_en TEXT NULL,
        subtitle_ar TEXT NULL,
        content_en LONGTEXT NULL,
        content_ar LONGTEXT NULL,
        metadata JSON NULL,
        display_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY idx_page_sections_unique (page_key, section_key),
        INDEX idx_page_sections_page (page_key),
        INDEX idx_page_sections_order (display_order),
        INDEX idx_page_sections_active (is_active)
      )
    `);
    
    console.log('Page sections table recreated successfully!');
    
    // Verify
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM page_sections`
    );
    console.log('\nTable columns:');
    columns.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
    
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
