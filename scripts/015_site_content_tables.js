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

const CONTENT_TABLES_SQL = `
-- Site Content Table - Stores all editable content for pages
CREATE TABLE IF NOT EXISTS site_content (
  id CHAR(36) PRIMARY KEY,
  page_key VARCHAR(64) NOT NULL,
  section_key VARCHAR(64) NOT NULL,
  content_type ENUM('text', 'html', 'json', 'image', 'array') NOT NULL DEFAULT 'text',
  content_value LONGTEXT NOT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  metadata JSON NULL,
  updated_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_site_content_page_section (page_key, section_key),
  INDEX idx_site_content_page (page_key),
  INDEX idx_site_content_visible (is_visible)
);

-- FAQs Table - Reusable FAQs that can be assigned to pages
CREATE TABLE IF NOT EXISTS faqs (
  id CHAR(36) PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(64) NULL,
  page_assignments JSON NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  helpful_count INT NOT NULL DEFAULT 0,
  updated_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_faqs_category (category),
  INDEX idx_faqs_published (is_published),
  INDEX idx_faqs_order (display_order)
);

-- Testimonials Table - Customer testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id CHAR(36) PRIMARY KEY,
  quote TEXT NOT NULL,
  author_name VARCHAR(191) NOT NULL,
  author_title VARCHAR(191) NULL,
  author_company VARCHAR(191) NULL,
  author_avatar_url TEXT NULL,
  rating TINYINT UNSIGNED NULL,
  page_assignments JSON NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  updated_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_testimonials_featured (is_featured),
  INDEX idx_testimonials_published (is_published),
  INDEX idx_testimonials_order (display_order)
);

-- Page Sections Table - Define which sections exist on each page
CREATE TABLE IF NOT EXISTS page_sections (
  id CHAR(36) PRIMARY KEY,
  page_key VARCHAR(64) NOT NULL,
  section_key VARCHAR(64) NOT NULL,
  section_name VARCHAR(191) NOT NULL,
  section_type ENUM('hero', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'stats', 'content', 'gallery', 'custom') NOT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  config JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_page_sections_unique (page_key, section_key),
  INDEX idx_page_sections_page (page_key),
  INDEX idx_page_sections_order (display_order)
);

-- Content Revisions Table - Track content changes
CREATE TABLE IF NOT EXISTS content_revisions (
  id CHAR(36) PRIMARY KEY,
  content_table VARCHAR(64) NOT NULL,
  content_id CHAR(36) NOT NULL,
  revision_data LONGTEXT NOT NULL,
  changed_by CHAR(36) NOT NULL,
  change_summary VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_content_revisions_content (content_table, content_id),
  INDEX idx_content_revisions_changed_by (changed_by),
  INDEX idx_content_revisions_created (created_at)
);
`;

async function main() {
  console.log('Creating site content tables in TiDB Cloud...');
  console.log('Database:', TARGET_DATABASE);
  
  if (!config.password) {
    console.error('ERROR: MYSQL_PASSWORD environment variable is not set');
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');
    
    // Split and execute each statement
    const statements = [];
    let currentStatement = '';
    const lines = CONTENT_TABLES_SQL.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('--')) continue;
      
      currentStatement += ' ' + line;
      
      if (trimmedLine.endsWith(';')) {
        const stmt = currentStatement.trim().slice(0, -1);
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    console.log(`\nExecuting ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] || `Statement ${i + 1}`;
      
      try {
        await connection.execute(stmt);
        console.log(`[${i + 1}/${statements.length}] Created table: ${tableName}`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`[${i + 1}/${statements.length}] Table already exists: ${tableName}`);
        } else {
          console.error(`[${i + 1}/${statements.length}] Error creating ${tableName}:`, error.message);
        }
      }
    }

    // Verify tables
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND TABLE_NAME IN ('site_content', 'faqs', 'testimonials', 'page_sections', 'content_revisions')`,
      [TARGET_DATABASE]
    );
    
    console.log('\nContent tables in database:');
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    
    console.log('\nSite content tables created successfully!');
    
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
