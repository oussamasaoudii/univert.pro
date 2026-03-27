CREATE TABLE analytics_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  website_id BIGINT UNSIGNED,
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(255),
  properties JSON,
  page_url VARCHAR(2048),
  referrer VARCHAR(2048),
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  country VARCHAR(100),
  browser VARCHAR(100),
  device_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_website_id (website_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE TABLE analytics_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  session_id VARCHAR(255) NOT NULL,
  website_id BIGINT UNSIGNED,
  duration_seconds INT,
  page_views INT DEFAULT 1,
  country VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_id (session_id),
  INDEX idx_website_id (website_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE TABLE analytics_daily_stats (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  website_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  page_views BIGINT DEFAULT 0,
  sessions BIGINT DEFAULT 0,
  unique_visitors BIGINT DEFAULT 0,
  bounce_rate DECIMAL(5, 2),
  avg_session_duration INT,
  top_pages JSON,
  referrers JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_website_date (website_id, date),
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);
