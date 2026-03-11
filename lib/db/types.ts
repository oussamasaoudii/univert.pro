// Database row shapes used by legacy wrappers and MySQL compatibility layers

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  role: 'user' | 'admin';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'ended';
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  ended_at: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsiteRow = {
  id: string;
  user_id: string;
  template_id: string;
  name?: string;
  description?: string | null;
  project_name?: string;
  status: 'pending' | 'provisioning' | 'ready' | 'suspended' | 'failed';
  subdomain: string;
  custom_domain: string | null;
  live_url: string;
  admin_url?: string | null;
  stack?: string;
  provisioning_progress?: number;
  provisioning_job_id: string | null;
  provisioning_error?: string | null;
  created_at: string;
  updated_at: string;
};

export type TemplateRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  stack: string;
  category: string;
  image_url: string | null;
  featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ProvisioningJobRow = {
  id: string;
  website_id: string;
  user_id: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
  progress: number;
  current_step: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  retry_count?: number;
};

export type SupportTicketRow = {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed' | 'waiting_customer';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
};

export type DomainRow = {
  id: string;
  user_id: string;
  website_id: string | null;
  domain: string;
  is_primary: boolean;
  domain_type: 'pending_subdomain' | 'platform_subdomain' | 'custom_domain';
  status: 'pending' | 'verifying' | 'verified' | 'ssl_pending' | 'active' | 'failed';
  dns_status: 'pending' | 'verifying' | 'verified' | 'failed';
  ssl_status: 'pending' | 'requested' | 'verified' | 'issued' | 'failed';
  dns_records: Record<string, any>;
  dns_verification_token: string | null;
  dns_verified_at: string | null;
  ssl_cert_id: string | null;
  ssl_expires_at: string | null;
  ssl_auto_renewal: boolean;
  error_message: string | null;
  metadata: Record<string, any>;
  verified_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DomainLogRow = {
  id: string;
  domain_id: string;
  website_id: string | null;
  user_id: string;
  action: string;
  old_state: Record<string, any> | null;
  new_state: Record<string, any> | null;
  details: Record<string, any> | null;
  created_at: string;
};

export type DnsVerificationRow = {
  id: string;
  domain_id: string;
  verification_token: string;
  record_name: string;
  record_type: string;
  record_value: string;
  verified: boolean;
  verification_attempts: number;
  last_checked_at: string | null;
  verified_at: string | null;
  expires_at: string;
  created_at: string;
};

export type SslCertificateRow = {
  id: string;
  domain_id: string;
  website_id: string;
  user_id: string;
  certificate_id: string | null;
  common_name: string;
  subject_alt_names: string[];
  status: 'pending' | 'provisioning' | 'verified' | 'issued' | 'failed';
  issue_date: string | null;
  expires_at: string | null;
  auto_renewal: boolean;
  renewal_status: 'pending' | 'in_progress' | 'completed' | 'failed' | null;
  renewal_last_attempted: string | null;
  error_message: string | null;
  provider: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type PlanName = 'starter' | 'growth' | 'pro' | 'premium' | 'enterprise';

export type BillingPlanRow = {
  id: string;
  name: PlanName;
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_annual: number | null;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  is_active: boolean;
  position: number | null;
  created_at: string;
  updated_at: string;
};

export type PlanFeatureRow = {
  id: string;
  plan_id: string;
  feature_key: string;
  feature_name: string;
  feature_value: string | null;
  is_enabled: boolean;
  created_at: string;
};

export type SubscriptionHistoryRow = {
  id: string;
  subscription_id: string;
  user_id: string;
  action: 'created' | 'upgraded' | 'downgraded' | 'renewed' | 'canceled' | 'payment_failed';
  old_plan_id: string | null;
  new_plan_id: string | null;
  old_status: string | null;
  new_status: string | null;
  amount: number | null;
  metadata: Record<string, any>;
  created_at: string;
};

export type FeatureUsageRow = {
  id: string;
  user_id: string;
  feature_key: string;
  usage_count: number;
  limit_value: number | null;
  reset_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceRow = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'refunded';
  description?: string | null;
  payment_method?: string | null;
  download_url?: string | null;
  stripe_invoice_id?: string | null;
  issued_at?: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BackupRow = {
  id: string;
  website_id: string;
  user_id: string;
  backup_type: 'automatic_scheduled' | 'manual' | 'pre_deploy' | 'pre_restore' | 'export_package';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'expired' | 'deleted';
  size_bytes: number | null;
  storage_location: string | null;
  storage_provider: string;
  retention_days: number | null;
  expires_at: string | null;
  metadata: Record<string, any>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type BackupLogRow = {
  id: string;
  backup_id: string;
  website_id: string;
  user_id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  details: Record<string, any>;
  created_at: string;
};

export type ExportRow = {
  id: string;
  backup_id: string | null;
  website_id: string;
  user_id: string;
  export_type: 'full_website' | 'database_only' | 'files_only' | 'custom';
  status: 'pending' | 'preparing' | 'packaging' | 'completed' | 'failed' | 'expired';
  format: string;
  size_bytes: number | null;
  download_url: string | null;
  download_expires_at: string | null;
  download_count: number;
  last_downloaded_at: string | null;
  metadata: Record<string, any>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type RestoreRow = {
  id: string;
  backup_id: string;
  website_id: string;
  user_id: string;
  restore_type: 'full_restore' | 'database_only' | 'files_only' | 'point_in_time';
  status: 'pending' | 'preparing' | 'restoring' | 'completed' | 'failed' | 'rolled_back';
  restoration_job_id: string | null;
  restore_started_at: string | null;
  restore_completed_at: string | null;
  metadata: Record<string, any>;
  error_message: string | null;
  rollback_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RestoreLogRow = {
  id: string;
  restore_id: string;
  website_id: string;
  user_id: string;
  step: string;
  status: string;
  duration_ms: number | null;
  details: Record<string, any>;
  error_message: string | null;
  created_at: string;
};

export type BackupRetentionPolicyRow = {
  id: string;
  plan_id: string;
  backup_frequency: string;
  max_backups_retained: number;
  max_backup_age_days: number;
  allow_manual_backups: boolean;
  allow_pre_deploy_backups: boolean;
  allow_exports: boolean;
  export_download_retention_days: number;
  created_at: string;
  updated_at: string;
};

// ========== Monitoring & Health Tracking ==========

export type HealthCheckRow = {
  id: string;
  website_id: string | null;
  check_type: 'website_reachability' | 'website_performance' | 'database_connectivity' | 'domain_dns' | 'domain_ssl' | 'provisioning_status' | 'backup_success' | 'restore_success' | 'export_success' | 'server_uptime';
  status: 'passing' | 'warning' | 'critical' | 'unknown';
  response_time_ms: number | null;
  error_message: string | null;
  details: Record<string, any>;
  checked_at: string;
  created_at: string;
};

export type IncidentRow = {
  id: string;
  website_id: string;
  user_id: string;
  incident_type: 'provisioning_failed' | 'ssl_issuance_failed' | 'domain_verification_failed' | 'website_unreachable' | 'database_unreachable' | 'backup_failed' | 'restore_failed' | 'export_failed' | 'ssl_expiring_soon';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string | null;
  affected_resources: Record<string, any>;
  resolution_notes: string | null;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AlertRow = {
  id: string;
  incident_id: string | null;
  website_id: string;
  user_id: string;
  alert_type: string;
  alert_state: 'info' | 'warning' | 'critical' | 'resolved';
  title: string;
  message: string | null;
  action_url: string | null;
  action_label: string | null;
  sent_at: string | null;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsiteHealthSummaryRow = {
  id: string;
  website_id: string;
  overall_status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  reachability_status: string | null;
  ssl_status: string | null;
  dns_status: string | null;
  last_successful_check: string | null;
  last_failed_check: string | null;
  uptime_percentage: number;
  open_incidents_count: number;
  critical_incidents_count: number;
  last_check_duration_ms: number | null;
  last_updated: string;
};

export type ServerHealthRow = {
  id: string;
  server_id: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  cpu_percentage: number | null;
  memory_percentage: number | null;
  disk_percentage: number | null;
  active_deployments: number | null;
  error_rate: number | null;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
};

// ========== Blog System ==========

export type BlogAuthorRow = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type BlogCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
};

export type BlogTagRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_id: string;
  category_id: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  featured_position: number | null;
  reading_time_minutes: number | null;
  view_count: number;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostWithRelations = BlogPostRow & {
  author?: BlogAuthorRow;
  category?: BlogCategoryRow;
  tags?: BlogTagRow[];
};

export type BlogPostTagRow = {
  post_id: string;
  tag_id: string;
};

export type BlogPostViewRow = {
  id: string;
  post_id: string;
  viewer_ip: string | null;
  viewer_country: string | null;
  referrer: string | null;
  viewed_at: string;
  created_at: string;
};
