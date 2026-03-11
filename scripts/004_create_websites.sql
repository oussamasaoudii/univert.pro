-- Ovmon Database Schema: Websites

CREATE TABLE IF NOT EXISTS public.websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id),
  project_name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'provisioning', 'ready', 'suspended', 'failed')),
  stack TEXT NOT NULL CHECK (stack IN ('Laravel', 'Next.js', 'WordPress')),
  server_region TEXT DEFAULT 'us-east-1',
  live_url TEXT,
  admin_url TEXT,
  
  -- Provisioning tracking
  provisioning_started_at TIMESTAMPTZ,
  provisioning_completed_at TIMESTAMPTZ,
  provisioning_error TEXT,
  
  -- Metrics
  storage_used_mb INTEGER DEFAULT 0,
  bandwidth_used_mb INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  suspended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own websites
CREATE POLICY "websites_select_own" ON public.websites 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "websites_insert_own" ON public.websites 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "websites_update_own" ON public.websites 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "websites_delete_own" ON public.websites 
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can manage all websites
CREATE POLICY "websites_admin_all" ON public.websites 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Domains table for custom domain management
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  dns_verified BOOLEAN DEFAULT FALSE,
  ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'provisioning', 'active', 'failed', 'expired')),
  ssl_expires_at TIMESTAMPTZ,
  verification_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for domains
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Users can manage domains for their websites
CREATE POLICY "domains_select_own" ON public.domains 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.websites 
      WHERE websites.id = domains.website_id AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "domains_insert_own" ON public.domains 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.websites 
      WHERE websites.id = domains.website_id AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "domains_update_own" ON public.domains 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.websites 
      WHERE websites.id = domains.website_id AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "domains_delete_own" ON public.domains 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.websites 
      WHERE websites.id = domains.website_id AND websites.user_id = auth.uid()
    )
  );

-- Admin can manage all domains
CREATE POLICY "domains_admin_all" ON public.domains 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON public.websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_status ON public.websites(status);
CREATE INDEX IF NOT EXISTS idx_websites_subdomain ON public.websites(subdomain);
CREATE INDEX IF NOT EXISTS idx_domains_website_id ON public.domains(website_id);

-- Updated at triggers
DROP TRIGGER IF EXISTS websites_updated_at ON public.websites;
CREATE TRIGGER websites_updated_at
  BEFORE UPDATE ON public.websites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS domains_updated_at ON public.domains;
CREATE TRIGGER domains_updated_at
  BEFORE UPDATE ON public.domains
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
