import mysql from 'mysql2/promise';

const config = {
  host: '72.60.90.147',
  port: 3306,
  user: 'univert_v0_temp',
  password: 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b',
  database: 'ovmon_db',
};

async function dropAndRecreate() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('[v0] Dropping old faqs table...');
    await connection.execute('DROP TABLE IF EXISTS `faqs`');
    console.log('[v0] Old faqs table dropped successfully');

    console.log('[v0] Creating new faqs table with correct schema...');
    await connection.execute(`
      CREATE TABLE \`faqs\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`question_en\` VARCHAR(500) NOT NULL,
        \`question_ar\` VARCHAR(500) NOT NULL,
        \`answer_en\` TEXT NOT NULL,
        \`answer_ar\` TEXT NOT NULL,
        \`category\` VARCHAR(100) NULL,
        \`display_order\` INT NOT NULL DEFAULT 0,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_faqs_category\` (\`category\`),
        KEY \`idx_faqs_is_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('[v0] New faqs table created successfully with proper schema');
    console.log('[v0] Done! FAQs table is now ready to use');
  } catch (error) {
    console.error('[v0] Error:', error);
  } finally {
    await connection.end();
  }
}

dropAndRecreate();
