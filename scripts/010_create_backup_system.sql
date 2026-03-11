-- Backup, Export, and Restore System for Ovmon
-- Comprehensive backup lifecycle, export packaging, and restore capabilities

-- 1. Backups table - tracks all backup records
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN (
    'automatic_scheduled',
    'manual',
    'pre_deploy',
    'pre_restore',
    'export_package'
  )),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'running',
    'completed',
    'failed',
    'expired',
    'deleted'
  )),
  size_bytes BIGINT,
  storage_location VARCHAR(500),
  storage_provider VARCHAR(50) DEFAULT 'aapanel', -- aapanel, s3, gcs, etc
  retention_days INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata for flexibility
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'expired', 'deleted'))
);

CREATE INDEX idx_backups_website_id ON backups(website_id);
CREATE INDEX idx_backups_user_id ON backups(user_id);
CREATE INDEX idx_backups_status ON backups(status);
CREATE INDEX idx_backups_created_at ON backups(created_at DESC);
CREATE INDEX idx_backups_expires_at ON backups(expires_at);

-- 2. Backup logs - immutable audit trail
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backups(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_backup_logs_backup_id ON backup_logs(backup_id);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at DESC);

-- 3. Exports table - tracks export requests and downloads
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID REFERENCES backups(id) ON DELETE SET NULL,
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type VARCHAR(50) NOT NULL CHECK (export_type IN (
    'full_website',
    'database_only',
    'files_only',
    'custom'
  )),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'preparing',
    'packaging',
    'completed',
    'failed',
    'expired'
  )),
  format VARCHAR(50) DEFAULT 'zip', -- zip, tar.gz, sql, etc
  size_bytes BIGINT,
  download_url VARCHAR(500),
  download_expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  error_message TEXT
);

CREATE INDEX idx_exports_website_id ON exports(website_id);
CREATE INDEX idx_exports_user_id ON exports(user_id);
CREATE INDEX idx_exports_status ON exports(status);
CREATE INDEX idx_exports_created_at ON exports(created_at DESC);

-- 4. Restores table - tracks restore operations
CREATE TABLE IF NOT EXISTS restores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backups(id) ON DELETE RESTRICT,
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restore_type VARCHAR(50) NOT NULL CHECK (restore_type IN (
    'full_restore',
    'database_only',
    'files_only',
    'point_in_time'
  )),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'preparing',
    'restoring',
    'completed',
    'failed',
    'rolled_back'
  )),
  restoration_job_id UUID,
  restore_started_at TIMESTAMP WITH TIME ZONE,
  restore_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  rollback_notes TEXT
);

CREATE INDEX idx_restores_backup_id ON restores(backup_id);
CREATE INDEX idx_restores_website_id ON restores(website_id);
CREATE INDEX idx_restores_user_id ON restores(user_id);
CREATE INDEX idx_restores_status ON restores(status);
CREATE INDEX idx_restores_created_at ON restores(created_at DESC);

-- 5. Restore logs - detailed restore operation logs
CREATE TABLE IF NOT EXISTS restore_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restore_id UUID NOT NULL REFERENCES restores(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  duration_ms INTEGER,
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_restore_logs_restore_id ON restore_logs(restore_id);
CREATE INDEX idx_restore_logs_created_at ON restore_logs(created_at DESC);

-- 6. Backup retention policies - plan-based backup limits
CREATE TABLE IF NOT EXISTS backup_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES billing_plans(id) ON DELETE CASCADE,
  backup_frequency VARCHAR(50) DEFAULT 'daily',
  max_backups_retained INTEGER DEFAULT 7,
  max_backup_age_days INTEGER DEFAULT 30,
  allow_manual_backups BOOLEAN DEFAULT true,
  allow_pre_deploy_backups BOOLEAN DEFAULT true,
  allow_exports BOOLEAN DEFAULT true,
  export_download_retention_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_backup_policies_plan_id ON backup_retention_policies(plan_id);

-- 7. RLS Policies for backups
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY backup_user_access ON backups
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY backup_user_insert ON backups
  FOR INSERT WITH CHECK (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Similar RLS for exports, restores, and logs
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY export_user_access ON exports
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE restores ENABLE ROW LEVEL SECURITY;
CREATE POLICY restore_user_access ON restores
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY backup_log_access ON backup_logs
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE restore_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY restore_log_access ON restore_logs
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
