-- Billing Plans and Features Schema

CREATE TYPE plan_name AS ENUM ('starter', 'growth', 'pro', 'premium', 'enterprise');

CREATE TABLE billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name plan_name NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_annual INTEGER, -- in cents, NULL means no annual option
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual TEXT,
  is_active BOOLEAN DEFAULT true,
  position INTEGER, -- for ordering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES billing_plans(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL, -- e.g., 'max_websites', 'custom_domains', 'api_access'
  feature_name TEXT NOT NULL, -- e.g., 'Max Websites'
  feature_value TEXT, -- e.g., '5', 'unlimited', 'true'
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extended subscription fields
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly'; -- 'monthly' or 'annual'
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount_paid INTEGER;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS failed_payment_count INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_payment_attempt_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Billing history for tracking changes
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'upgraded', 'downgraded', 'renewed', 'canceled', 'payment_failed'
  old_plan_id UUID REFERENCES billing_plans(id),
  new_plan_id UUID REFERENCES billing_plans(id),
  old_status TEXT,
  new_status TEXT,
  amount INTEGER, -- in cents
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feature usage tracking
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  limit_value INTEGER, -- NULL means unlimited
  reset_at TIMESTAMP WITH TIME ZONE, -- when usage resets (monthly/annual)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, feature_key)
);

-- Indexes for queries
CREATE INDEX idx_billing_plans_active ON billing_plans(is_active);
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_subscription_history_subscription_id ON subscription_history(subscription_id);
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- RLS Policies
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by all users" ON billing_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Features are viewable by all users" ON plan_features
  FOR SELECT USING (true);

CREATE POLICY "Users can view their subscription history" ON subscription_history
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'user_metadata'->>'is_admin' = 'true');

CREATE POLICY "Users can view their feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Insert default plans
INSERT INTO billing_plans (name, display_name, description, price_monthly, price_annual, position)
VALUES
  ('starter', 'Starter', 'Perfect for getting started', 2999, 28490, 1),
  ('growth', 'Growth', 'For growing teams', 9999, 94990, 2),
  ('pro', 'Pro', 'Advanced features', 29999, 284990, 3),
  ('premium', 'Premium', 'Enterprise-grade', 79999, 759990, 4),
  ('enterprise', 'Enterprise', 'Custom solutions', NULL, NULL, 5)
ON CONFLICT DO NOTHING;

-- Add features for each plan
INSERT INTO plan_features (plan_id, feature_key, feature_name, feature_value)
SELECT id, 'max_websites', 'Max Websites', '1' FROM billing_plans WHERE name = 'starter'
UNION ALL
SELECT id, 'max_custom_domains', 'Custom Domains', '1' FROM billing_plans WHERE name = 'starter'
UNION ALL
SELECT id, 'max_websites', 'Max Websites', '5' FROM billing_plans WHERE name = 'growth'
UNION ALL
SELECT id, 'max_custom_domains', 'Custom Domains', '5' FROM billing_plans WHERE name = 'growth'
UNION ALL
SELECT id, 'max_websites', 'Max Websites', '25' FROM billing_plans WHERE name = 'pro'
UNION ALL
SELECT id, 'max_custom_domains', 'Custom Domains', '25' FROM billing_plans WHERE name = 'pro'
UNION ALL
SELECT id, 'max_websites', 'Max Websites', 'unlimited' FROM billing_plans WHERE name = 'premium'
UNION ALL
SELECT id, 'max_custom_domains', 'Custom Domains', 'unlimited' FROM billing_plans WHERE name = 'premium'
UNION ALL
SELECT id, 'max_websites', 'Max Websites', 'unlimited' FROM billing_plans WHERE name = 'enterprise'
UNION ALL
SELECT id, 'max_custom_domains', 'Custom Domains', 'unlimited' FROM billing_plans WHERE name = 'enterprise'
ON CONFLICT DO NOTHING;
