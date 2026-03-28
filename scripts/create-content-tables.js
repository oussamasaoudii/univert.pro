import mysql from "mysql2/promise";

/**
 * Create testimonials and content tables
 */
async function createContentSchema() {
  const pool = mysql.createPool({
    host: "72.60.90.147",
    port: 3306,
    user: "univert_v0_temp",
    password: "d6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b",
    database: "ovmon_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    console.log("Creating testimonials table...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        page_key VARCHAR(100) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_title VARCHAR(255),
        author_image_url VARCHAR(500),
        content TEXT NOT NULL,
        rating INT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_page_key (page_key),
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log("✓ Testimonials table created successfully");

    // Create FAQ table
    console.log("Creating FAQ table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        page_key VARCHAR(100) NOT NULL,
        question VARCHAR(500) NOT NULL,
        answer TEXT NOT NULL,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_page_key (page_key),
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log("✓ FAQ table created successfully");

    // Create case studies table
    console.log("Creating case studies table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS case_studies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        page_key VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        client_name VARCHAR(255),
        industry VARCHAR(100),
        image_url VARCHAR(500),
        results TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_page_key (page_key),
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log("✓ Case studies table created successfully");

    console.log("\n✓ All content tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createContentSchema();
