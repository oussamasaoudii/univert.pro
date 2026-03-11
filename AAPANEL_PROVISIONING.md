# Ovmon aaPanel Provisioning Engine

Production-grade provisioning system for automating website deployment on aaPanel infrastructure.

## Architecture Overview

The provisioning system is built on a provider abstraction layer that makes it easy to add new infrastructure providers while keeping the UI and business logic unchanged.

### Key Components

1. **Provider Interface** (`lib/provisioning/provider.ts`)
   - Abstract base class defining the contract for all providers
   - Methods for website provisioning, database creation, domain binding, SSL setup
   - Extensible for future providers (AWS, DigitalOcean, etc.)

2. **aaPanel Provider** (`lib/provisioning/providers/aapanel.ts`)
   - Real implementation connecting to aaPanel API
   - Authenticated API calls with retry logic
   - State management and error handling
   - Generates environment variables based on stack type

3. **Job Manager** (`lib/provisioning/job-manager.ts`)
   - Orchestrates provisioning workflows
   - Manages job state transitions (pending → queued → running → completed/failed)
   - Handles retries with exponential backoff
   - Persists logs to database

4. **Data Layer** (`lib/db/provisioning.ts`)
   - Database operations for jobs and logs
   - RLS-protected access to provisioning records
   - Log persistence for audit trails

## Setup

### 1. Environment Variables

```env
# aaPanel Configuration
AAPANEL_ENABLED=true
AAPANEL_API_URL=https://your-aapanel-server.com:7800
AAPANEL_API_TOKEN=your_api_token_here
AAPANEL_API_KEY=your_api_key_here
AAPANEL_SERVER_ID=default-server
AAPANEL_TEMPLATE_PATH=/home/templates
AAPANEL_DEPLOY_PATH=/home/ovmon-websites
AAPANEL_TIMEOUT=30000
AAPANEL_RETRY_ATTEMPTS=3
AAPANEL_RETRY_DELAY=1000

# Job Processing
PROVISIONING_BATCH_SIZE=5
PROVISIONING_POLL_INTERVAL=5000
PROVISIONING_JOB_TIMEOUT=3600000

# Logging
PROVISIONING_LOG_LEVEL=info
PROVISIONING_PERSIST_LOGS=true
PROVISIONING_LOG_RETENTION=90

# Notifications (optional)
PROVISIONING_NOTIFICATIONS=false
PROVISIONING_WEBHOOK_URL=https://your-webhook-url.com
PROVISIONING_EMAIL_ON_COMPLETE=false
```

### 2. Database Schema

The provisioning system requires these tables:

```sql
-- Provisioning Jobs
CREATE TABLE provisioning_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES websites(id),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(20), -- pending, queued, running, completed, failed, canceled
  progress INTEGER DEFAULT 0,
  current_step VARCHAR(255),
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Provisioning Logs
CREATE TABLE provisioning_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES provisioning_jobs(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  level VARCHAR(20), -- info, warning, error, success
  message TEXT,
  step_name VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE provisioning_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provisioning_job_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_provisioning_jobs" ON provisioning_jobs
FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

CREATE POLICY "admin_provisioning_logs" ON provisioning_job_logs
FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));
```

## Usage

### Triggering Provisioning

When a user launches a website from a template:

```typescript
// 1. Create a website record in pending state
const website = await createWebsite({
  template_id: templateId,
  subdomain: subdomain,
  user_id: userId,
  status: 'pending_provisioning'
});

// 2. Create a provisioning job
const job = await createProvisioningJob({
  website_id: website.id,
  user_id: userId,
  status: 'pending'
});
```

### Admin Approval Flow

1. Admin sees pending job in `/admin/provisioning-queue`
2. Admin reviews job details (template, server resources, domain config)
3. Admin clicks "Approve" button
4. `approveProvisioningJob(jobId)` is called
5. Provisioning engine executes asynchronously

```typescript
// From admin-provisioning.ts
import { approveProvisioningJob } from '@/app/actions/admin-provisioning';

await approveProvisioningJob(jobId);
```

### Real-time Progress Updates

The job manager updates progress as provisioning steps complete:

```
0% → validating_config
5% → allocating_server
15% → creating_database
30% → setting_up_environment
45% → deploying_application
65% → configuring_domain
80% → setting_up_ssl
90% → finalizing
100% → completed
```

### Error Handling

- **Automatic Retries**: Failed operations retry up to 3 times with exponential backoff
- **Partial Failures**: Some steps can fail without blocking the entire job (e.g., SSL can be configured later)
- **Admin Retries**: Admins can manually retry failed jobs from the admin dashboard
- **Detailed Logs**: All operations logged with step name, duration, and error details

### Logs & Audit Trail

All provisioning operations are logged with structured data:

```typescript
{
  jobId: "job_xyz",
  timestamp: "2024-11-22T14:30:00Z",
  level: "success",
  message: "Database created: ovmon_abc_123",
  stepName: "creating_database",
  details: {
    databaseId: "db_123",
    databaseName: "ovmon_abc_123",
    databaseHost: "db.internal.ovmon.app",
    user: "ovmon_abc"
  }
}
```

## aaPanel API Integration

### Authentication

The aaPanel provider uses token + key authentication:

```typescript
const params = new URLSearchParams({
  token: AAPANEL_API_TOKEN,
  key: AAPANEL_API_KEY,
});
```

### Supported Operations

1. **Server Allocation** (`/api/system/server_info`)
   - Gets server IP and status
   - Used to verify server availability

2. **Database Creation** (`/api/database/create`)
   - Creates MySQL/PostgreSQL database
   - Creates database user with secure password
   - Supports UTF8MB4 encoding

3. **Website Creation** (`/api/site/add`)
   - Creates website record in aaPanel
   - Configures PHP version based on stack
   - Sets deployment path

4. **Domain Binding** (`/api/site/adddomain`)
   - Binds primary and custom domains
   - Returns DNS records for configuration

5. **SSL Certificate** (`/api/site/apply_ssl`)
   - Requests Let's Encrypt certificate
   - Enables auto-renewal
   - Returns certificate ID and expiry date

6. **File Operations** (`/api/file/save`, `/api/file/copy`)
   - Creates and copies files
   - Used for deploying template files and .env configuration

## Retry & Failure Handling

### Retry Policy

```typescript
retryPolicy: {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2
}
```

- 1st retry: 1 second
- 2nd retry: 2 seconds
- 3rd retry: 4 seconds

### Failure Scenarios

1. **aaPanel Unreachable**
   - Error: "Connection refused" or timeout
   - Action: Retries with backoff, eventually fails
   - Admin: Can retry after server is back online

2. **Database Creation Failure**
   - Error: "Database already exists" or quota exceeded
   - Action: Job fails, logs error
   - Admin: Reviews logs and retries

3. **Domain Binding Failure**
   - Error: "Domain not in DNS zone"
   - Action: Continues (domain can be configured later)
   - Admin: Manual intervention if needed

4. **SSL Certificate Failure**
   - Error: "Let's Encrypt validation failed"
   - Action: Continues (SSL can be configured later)
   - Admin: Manual intervention if needed

## Monitoring & Health

### Provider Health Check

```typescript
const health = await checkProvisioningHealth();
// Returns: { healthy: true, message: "aaPanel healthy (v8.2.1)" }
```

### Job Status Dashboard

View from `/admin/provisioning-queue`:
- Pending jobs awaiting approval
- Running jobs with progress bars
- Completed jobs with details
- Failed jobs with error messages

### Logs Panel

From `/admin/provisioning/[id]`:
- Real-time log streaming
- Filterable by log level
- Downloadable audit trail
- Performance metrics (duration, resources)

## Extending for Other Providers

Adding a new provider is straightforward:

```typescript
// 1. Create provider class
export class MyProviderProvider extends BaseProvider {
  name = 'MyProvider';
  
  async provisionWebsite(...) { ... }
  async allocateServer(...) { ... }
  // ... implement all abstract methods
}

// 2. Register in job manager
private createProvider(name: string): IProvisioningProvider {
  switch (name) {
    case 'aapanel':
      return new AapanelProvider();
    case 'myprovider':
      return new MyProviderProvider();
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

// 3. Use in jobs
const manager = new ProvisioningJobManager('myprovider');
```

## Performance Considerations

- **Async Execution**: Provisioning runs asynchronously to avoid blocking requests
- **Job Caching**: Provider responses cached for 1 minute
- **Batch Processing**: Multiple jobs processed in parallel (default: 5)
- **Connection Pooling**: HTTP requests reused for efficiency

## Security

- **RLS Protection**: Provisioning jobs and logs protected with Row Level Security
- **Token Rotation**: Store tokens in environment variables, never in code
- **Secure Passwords**: Generated database passwords use cryptographic randomness
- **Audit Trail**: All operations logged with timestamps and user IDs
- **Admin-Only**: Provisioning actions require admin authentication

## Troubleshooting

### "AAPANEL_API_TOKEN is required"
- Set environment variables in Supabase settings
- Verify token is copied correctly from aaPanel

### Job stuck in "running" state
- Check aaPanel server connectivity
- Review logs for last successful step
- Manual intervention: Update job status in database

### Database creation failed
- Check database quota on aaPanel server
- Verify naming pattern doesn't exceed length limits
- Check for database naming conflicts

### SSL certificate not issued
- Let's Encrypt DNS validation may take time
- Domain must be properly configured
- Check DNS propagation

## Future Enhancements

- [ ] Webhook notifications on provisioning events
- [ ] Email notifications to user and admin
- [ ] Provisioning templates for different configurations
- [ ] Cost estimation before provisioning
- [ ] Auto-scaling based on website traffic
- [ ] Backup automation integration
