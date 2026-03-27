CREATE TABLE loyalty_points (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  total_points INT DEFAULT 0,
  available_points INT DEFAULT 0,
  tier VARCHAR(50) DEFAULT 'bronze',
  lifetime_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE loyalty_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('earned', 'redeemed', 'expired', 'adjusted') DEFAULT 'earned',
  points INT NOT NULL,
  reason VARCHAR(255),
  related_subscription_id BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

CREATE TABLE loyalty_rewards (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  reward_type ENUM('discount', 'feature_upgrade', 'free_month', 'custom') DEFAULT 'discount',
  reward_value VARCHAR(255),
  max_redemptions INT,
  current_redemptions INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
