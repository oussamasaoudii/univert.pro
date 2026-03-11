-- Health Monitoring Schema for Ovmon
-- Tracks website health, server health, provisioning health, domain/SSL health, and backup health

-- Health Check Types (for tracking different check types)
CREATE TABLE IF NOT EXISTS health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES websites(id) ON DELETE CASCADE,
  check_type text NOT NULL CHECK (check_type IN (
    'website_reachability',
    'website_performance',
    'database_connectivity',
    'domain_dns',
    'domain_ssl',
    'provisioning_status',
    'backup_success',
    'restore_success',
    'export_success',
    'server_uptime'
  )),
  status text NOT NULL CHECK (status IN ('passing', 'warning', 'critical', 'unknown')),
  response_time_ms integer,
  error_message text,
  details jsonb,
  checked_at timestamp with time zone NOT NULL DEFAULT NOW(),
  created_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_checks_website_id ON health_checks(website_id);
CREATE INDEX idx_health_checks_check_type ON health_checks(check_type);
CREATE INDEX idx_health_checks_checked_at ON health_checks(checked_at DESC);

-- Incidents (user-facing problems)
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES websites(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_type text NOT NULL CHECK (incident_type IN (
    'provisioning_failed',
    'ssl_issuance_failed',
    'domain_verification_failed',
    'website_unreachable',
    'database_unreachable',
    'backup_failed',
    'restore_failed',
    'export_failed',
    'ssl_expiring_soon'
  )),
  status text NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'closed')) DEFAULT 'open',
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',
  title text NOT NULL,
  description text,
  affected_resources jsonb,
  resolution_notes text,
  detected_at timestamp with time zone NOT NULL DEFAULT NOW(),
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_website_id ON incidents(website_id);
CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_detected_at ON incidents(detected_at DESC);

-- Alerts (system notifications)
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES incidents(id) ON DELETE CASCADE,
  website_id uuid REFERENCES websites(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  alert_state text NOT NULL CHECK (alert_state IN ('info', 'warning', 'critical', 'resolved')) DEFAULT 'info',
  title text NOT NULL,
  message text,
  action_url text,
  action_label text,
  sent_at timestamp with time zone,
  acknowledged_at timestamp with time zone,
  acknowledged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_incident_id ON alerts(incident_id);
CREATE INDEX idx_alerts_website_id ON alerts(website_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_alert_state ON alerts(alert_state);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Website Health Summary (denormalized for performance)
CREATE TABLE IF NOT EXISTS website_health_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid UNIQUE NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  overall_status text NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'critical', 'unknown')) DEFAULT 'unknown',
  reachability_status text DEFAULT 'unknown',
  ssl_status text DEFAULT 'unknown',
  dns_status text DEFAULT 'unknown',
  last_successful_check timestamp with time zone,
  last_failed_check timestamp with time zone,
  uptime_percentage numeric(5, 2) DEFAULT 0,
  open_incidents_count integer DEFAULT 0,
  critical_incidents_count integer DEFAULT 0,
  last_check_duration_ms integer,
  last_updated timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_website_health_summary_overall_status ON website_health_summary(overall_status);
CREATE INDEX idx_website_health_summary_last_updated ON website_health_summary(last_updated DESC);

-- Server/Infrastructure Health
CREATE TABLE IF NOT EXISTS server_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('healthy', 'degraded', 'critical', 'offline')),
  cpu_percentage numeric(5, 2),
  memory_percentage numeric(5, 2),
  disk_percentage numeric(5, 2),
  active_deployments integer,
  error_rate numeric(5, 2),
  last_heartbeat timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_server_health_server_id ON server_health(server_id);
CREATE INDEX idx_server_health_status ON server_health(status);

-- RLS Policies for health checks
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_health_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_health ENABLE ROW LEVEL SECURITY;

-- Health checks: users see their own websites' checks, admins see all
CREATE POLICY health_checks_select ON health_checks
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM websites WHERE id = health_checks.website_id)
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Incidents: users see their own, admins see all
CREATE POLICY incidents_select ON incidents
  FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Alerts: users see their own, admins see all
CREATE POLICY alerts_select ON alerts
  FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Website health summary: users see their own
CREATE POLICY website_health_summary_select ON website_health_summary
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM websites WHERE id = website_health_summary.website_id)
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Server health: admins only
CREATE POLICY server_health_select ON server_health
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
