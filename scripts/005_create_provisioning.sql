-- Ovmon Database Schema: Provisioning and Jobs

-- Provisioning Jobs
CREATE TABLE IF NOT EXISTS public.provisioning_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'canceled')),
  current_step TEXT,
  progress INTEGER DEFAULT 0,
  steps_completed JSONB DEFAULT '[]'::JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.provisioning_jobs ENABLE ROW LEVEL SECURITY;

-- Users can see jobs for their websites
CREATE POLICY "jobs_select_own" ON public.provisioning_jobs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.websites 
      WHERE websites.id = provisioning_jobs.website_id AND websites.user_id = auth.uid()
    )
  );

-- Admin can manage all jobs
CREATE POLICY "jobs_admin_all" ON public.provisioning_jobs 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Deployment Logs
CREATE TABLE IF NOT EXISTS public.deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.provisioning_jobs(id) ON DELETE CASCADE,
  level TEXT DEFAULT 'info' CHECK (level IN ('info', 'success', 'warning', 'error')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for logs
ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;

-- Users can see logs for their jobs
CREATE POLICY "logs_select_own" ON public.deployment_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.provisioning_jobs j
      JOIN public.websites w ON w.id = j.website_id
      WHERE j.id = deployment_logs.job_id AND w.user_id = auth.uid()
    )
  );

-- Admin can manage all logs
CREATE POLICY "logs_admin_all" ON public.deployment_logs 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Servers (admin only table for infrastructure tracking)
CREATE TABLE IF NOT EXISTS public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  provider TEXT NOT NULL,
  ip_address TEXT,
  status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'offline', 'maintenance')),
  stack_support TEXT[] DEFAULT ARRAY['Laravel', 'Next.js', 'WordPress'],
  capacity INTEGER DEFAULT 100,
  current_load INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (admin only)
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servers_admin_only" ON public.servers 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default servers
INSERT INTO public.servers (name, region, provider, ip_address, status, capacity)
VALUES 
  ('US-East Primary', 'us-east-1', 'aws', '76.76.21.21', 'healthy', 200),
  ('US-West Secondary', 'us-west-2', 'aws', '76.76.21.22', 'healthy', 200),
  ('EU-Central', 'eu-central-1', 'aws', '76.76.21.23', 'healthy', 150)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_website_id ON public.provisioning_jobs(website_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.provisioning_jobs(status);
CREATE INDEX IF NOT EXISTS idx_logs_job_id ON public.deployment_logs(job_id);
