-- Extended Domain Schema for Ovmon
-- Adds comprehensive domain management with DNS verification and SSL automation

-- Add new columns to domains table
ALTER TABLE IF EXISTS public.domains
ADD COLUMN IF NOT EXISTS domain_type 'pending_subdomain' | 'platform_subdomain' | 'custom_domain' DEFAULT 'custom_domain',
ADD COLUMN IF NOT EXISTS status 'pending' | 'verifying' | 'verified' | 'ssl_pending' | 'active' | 'failed' DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS dns_status 'pending' | 'verifying' | 'verified' | 'failed' DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ssl_status 'pending' | 'requested' | 'verified' | 'issued' | 'failed' DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS dns_records JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS dns_verification_token TEXT,
ADD COLUMN IF NOT EXISTS dns_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ssl_cert_id TEXT,
ADD COLUMN IF NOT EXISTS ssl_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ssl_auto_renewal BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE;

-- Create domain_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.domain_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_state JSONB,
  new_state JSONB,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dns_verification table for tracking verification attempts
CREATE TABLE IF NOT EXISTS public.dns_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  verification_token TEXT UNIQUE NOT NULL,
  record_name TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_value TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verification_attempts INT DEFAULT 0,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ssl_certificates table for tracking SSL automation
CREATE TABLE IF NOT EXISTS public.ssl_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id TEXT,
  common_name TEXT NOT NULL,
  subject_alt_names TEXT[] DEFAULT ARRAY[]::TEXT[],
  status 'pending' | 'provisioning' | 'verified' | 'issued' | 'failed' DEFAULT 'pending',
  issue_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renewal BOOLEAN DEFAULT true,
  renewal_status 'pending' | 'in_progress' | 'completed' | 'failed',
  renewal_last_attempted TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  provider TEXT DEFAULT 'letsencrypt',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.domain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ssl_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for domain_logs
CREATE POLICY "Users can view their domain logs" ON public.domain_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all domain logs" ON public.domain_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for dns_verifications
CREATE POLICY "Users can view their DNS verifications" ON public.dns_verifications
  FOR SELECT USING (
    domain_id IN (
      SELECT id FROM public.domains WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for ssl_certificates
CREATE POLICY "Users can view their SSL certificates" ON public.ssl_certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all SSL certificates" ON public.ssl_certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_domain_logs_domain_id ON public.domain_logs(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_logs_website_id ON public.domain_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_domain_logs_user_id ON public.domain_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_logs_created_at ON public.domain_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dns_verifications_domain_id ON public.dns_verifications(domain_id);
CREATE INDEX IF NOT EXISTS idx_dns_verifications_verified ON public.dns_verifications(verified);
CREATE INDEX IF NOT EXISTS idx_dns_verifications_expires_at ON public.dns_verifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_ssl_certificates_domain_id ON public.ssl_certificates(domain_id);
CREATE INDEX IF NOT EXISTS idx_ssl_certificates_website_id ON public.ssl_certificates(website_id);
CREATE INDEX IF NOT EXISTS idx_ssl_certificates_status ON public.ssl_certificates(status);
CREATE INDEX IF NOT EXISTS idx_ssl_certificates_expires_at ON public.ssl_certificates(expires_at);

-- Update domain status when primary domain changes
CREATE OR REPLACE FUNCTION public.update_website_live_url_on_domain_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary AND OLD.is_primary = FALSE THEN
    UPDATE public.websites
    SET live_url = 'https://' || NEW.domain,
        updated_at = NOW()
    WHERE id = NEW.website_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_website_live_url ON public.domains;
CREATE TRIGGER trigger_update_website_live_url
  AFTER UPDATE ON public.domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_website_live_url_on_domain_change();
