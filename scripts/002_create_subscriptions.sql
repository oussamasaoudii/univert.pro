-- Ovmon Database Schema: Subscriptions and Billing

-- Subscription Plans (reference table)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER,
  websites_limit INTEGER NOT NULL,
  storage_limit_gb INTEGER NOT NULL,
  bandwidth_limit_gb INTEGER NOT NULL,
  custom_domain BOOLEAN DEFAULT FALSE,
  ssl_included BOOLEAN DEFAULT TRUE,
  support_level TEXT DEFAULT 'email',
  features JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO public.subscription_plans (id, name, price_monthly, price_yearly, websites_limit, storage_limit_gb, bandwidth_limit_gb, custom_domain, ssl_included, support_level, features)
VALUES 
  ('starter', 'Starter', 2900, 29000, 1, 5, 50, FALSE, TRUE, 'email', '["1 Website", "5GB Storage", "50GB Bandwidth", "SSL Included", "Email Support"]'::JSONB),
  ('pro', 'Pro', 7900, 79000, 5, 25, 250, TRUE, TRUE, 'priority', '["5 Websites", "25GB Storage", "250GB Bandwidth", "Custom Domain", "Priority Support", "Analytics"]'::JSONB),
  ('business', 'Business', 14900, 149000, 15, 100, 1000, TRUE, TRUE, 'priority', '["15 Websites", "100GB Storage", "1TB Bandwidth", "Custom Domain", "Priority Support", "Advanced Analytics", "Team Access"]'::JSONB),
  ('enterprise', 'Enterprise', 0, 0, 999, 999, 9999, TRUE, TRUE, 'dedicated', '["Unlimited Websites", "Unlimited Storage", "Unlimited Bandwidth", "Custom Domain", "Dedicated Support", "SLA", "Custom Integration"]'::JSONB)
ON CONFLICT (id) DO NOTHING;

-- User Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  trial_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON public.subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can manage all subscriptions
CREATE POLICY "subscriptions_admin_all" ON public.subscriptions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  description TEXT,
  stripe_invoice_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_own" ON public.invoices 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "invoices_admin_all" ON public.invoices 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Updated at trigger for subscriptions
DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
