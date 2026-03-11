# Async Job Queue System

Production-grade asynchronous job queue for Ovmon provisioning.

## Architecture

```
User Request → Enqueue Job → Database Queue → Worker API → Job Handler
                    ↓                              ↓
              Queue Tables          Provisioning Engine → aaPanel
                    ↓                              ↓
              Status Updates ←────── Job Completion
```

## Components

### Database Schema (scripts/007_create_job_queue.sql)
- `job_queue` - Main queue table with status, retry config, payload
- `dead_letter_queue` - Failed jobs that exceeded retry attempts
- `worker_heartbeats` - Worker liveness tracking
- PostgreSQL functions for atomic job claiming and lock release

### Data Access Layer (lib/queue/data-access.ts)
- `enqueueJob()` - Add new job to queue
- `claimNextJob()` - Atomically claim next available job
- `startJob()` / `completeJob()` / `failJob()` - Status transitions
- `releaseStaleLocks()` - Clean up timed-out jobs
- Dead letter management functions

### Queue Manager (lib/queue/queue-manager.ts)
- `processNextJob()` - Process single job
- `runWorkerLoop()` - Batch processing with idle timeout
- `enqueueProvisioningJob()` - Entry point for provisioning
- Job handlers for each job type

### API Routes
- `POST /api/queue/worker` - Process jobs (triggered by cron)
- `POST /api/queue/maintenance` - Clean up stale locks (cron)
- `GET /api/queue/status` - Queue statistics (admin)
- `GET /api/provisioning/[jobId]` - Real-time job status

### Cron Jobs (vercel.json)
- Worker runs every minute
- Maintenance runs every 5 minutes

## Job Types

| Type | Priority | Timeout | Retries | Description |
|------|----------|---------|---------|-------------|
| `provisioning` | 50 | 600s | 3 | Main website provisioning |
| `deployment_retry` | 60 | 600s | 3 | Retry failed deployments |
| `status_poll` | 90 | 60s | 5 | Health checks |
| `post_deploy` | 80 | 300s | 2 | Post-deployment tasks |
| `cleanup` | 100 | 120s | 2 | Resource cleanup |
| `notification` | 100 | 30s | 3 | User notifications |

## Retry Policy

1. **Exponential Backoff**: `delay * 2^(attempt-1)`
2. **Max Backoff**: 1 hour
3. **Dead Letter**: After max attempts exceeded
4. **Lock Timeout**: Jobs auto-release if worker dies

## Admin Actions (app/actions/admin-queue.ts)

- `getQueueDashboard()` - Stats, dead letters, recent jobs
- `resolveDeadLetter()` - Mark as handled
- `retryDeadLetter()` - Create new job from dead letter
- `cancelQueueJob()` - Cancel pending job
- `forceRetryJob()` - Reset and retry any job
- `purgeCompletedJobs()` - Clean old completed jobs
- `triggerWorker()` - Manually run worker

## Environment Variables

```bash
# Required
CRON_SECRET=your-cron-secret  # For cron authentication
SUPABASE_SERVICE_ROLE_KEY=... # For service-level access

# Optional
NEXT_PUBLIC_APP_URL=https://... # For internal API calls
```

## Flow: Website Launch

1. User clicks "Launch Website"
2. `launchWebsite()` creates website + provisioning_job (pending)
3. Admin approves → `approveProvisioningJob()`
4. `enqueueProvisioningJob()` adds to job_queue
5. Cron triggers `/api/queue/worker`
6. Worker claims job, calls `ProvisioningJobManager.executeProvisioning()`
7. aaPanel provider executes each step
8. On success: website status → ready, post-deploy tasks enqueued
9. On failure: retry with backoff, eventually → dead letter

## Monitoring

### Queue Health Check
```bash
curl https://your-app.com/api/queue/maintenance
```

### Queue Status (Admin)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.com/api/queue/status
```

### Job Status (User/Admin)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.com/api/provisioning/$JOB_ID
```

## Dead Letter Handling

1. Jobs that fail after max attempts go to `dead_letter_queue`
2. Admins can view in dashboard
3. Options:
   - **Resolve**: Mark as handled with notes
   - **Retry**: Create new job with reset attempts
4. Original payload preserved for debugging

## Performance Considerations

- Atomic job claiming prevents double-processing
- Worker idle timeout (30s) for serverless efficiency
- Batch processing (up to 100 iterations per invocation)
- Indexed queries for fast job claiming
- Connection pooling via Supabase
