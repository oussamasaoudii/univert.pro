-- Job Queue Schema for Async Provisioning
-- Provides durable, retry-safe job execution

-- Job queue table for async execution
CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN (
    'provisioning',
    'deployment_retry',
    'status_poll',
    'post_deploy',
    'cleanup',
    'notification'
  )),
  
  -- Reference to the provisioning job
  provisioning_job_id UUID REFERENCES provisioning_jobs(id) ON DELETE CASCADE,
  
  -- Queue state
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'claimed',
    'processing',
    'completed',
    'failed',
    'dead_letter'
  )),
  
  -- Priority (lower = higher priority)
  priority INTEGER NOT NULL DEFAULT 100,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Worker tracking
  worker_id TEXT,
  locked_until TIMESTAMPTZ,
  
  -- Retry configuration
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  
  -- Backoff tracking
  next_retry_at TIMESTAMPTZ,
  backoff_seconds INTEGER DEFAULT 30,
  
  -- Timeout handling
  timeout_seconds INTEGER NOT NULL DEFAULT 300,
  
  -- Payload
  payload JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for efficient querying
  CONSTRAINT valid_scheduling CHECK (scheduled_at IS NOT NULL)
);

-- Dead letter queue for failed jobs
CREATE TABLE IF NOT EXISTS dead_letter_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_job_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  provisioning_job_id UUID REFERENCES provisioning_jobs(id) ON DELETE SET NULL,
  
  -- Failure info
  failure_reason TEXT NOT NULL,
  attempt_count INTEGER NOT NULL,
  last_error TEXT,
  
  -- Original payload preserved
  payload JSONB NOT NULL,
  
  -- Timestamps
  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Resolution tracking
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT
);

-- Worker heartbeat tracking
CREATE TABLE IF NOT EXISTS worker_heartbeats (
  worker_id TEXT PRIMARY KEY,
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jobs_processed INTEGER NOT NULL DEFAULT 0,
  jobs_failed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'idle', 'dead')),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_queue_status_scheduled 
  ON job_queue(status, scheduled_at) 
  WHERE status IN ('pending', 'claimed');

CREATE INDEX IF NOT EXISTS idx_job_queue_provisioning_job 
  ON job_queue(provisioning_job_id);

CREATE INDEX IF NOT EXISTS idx_job_queue_worker 
  ON job_queue(worker_id) 
  WHERE worker_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_job_queue_locked 
  ON job_queue(locked_until) 
  WHERE locked_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_job_queue_retry 
  ON job_queue(next_retry_at) 
  WHERE status = 'failed' AND next_retry_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dead_letter_unresolved 
  ON dead_letter_queue(failed_at) 
  WHERE resolved_at IS NULL;

-- Function to claim next available job
CREATE OR REPLACE FUNCTION claim_next_job(
  p_worker_id TEXT,
  p_job_types TEXT[],
  p_lock_duration_seconds INTEGER DEFAULT 300
)
RETURNS job_queue AS $$
DECLARE
  v_job job_queue;
BEGIN
  -- Atomically claim next available job
  UPDATE job_queue
  SET 
    status = 'claimed',
    claimed_at = NOW(),
    worker_id = p_worker_id,
    locked_until = NOW() + (p_lock_duration_seconds || ' seconds')::INTERVAL,
    updated_at = NOW()
  WHERE id = (
    SELECT id FROM job_queue
    WHERE status = 'pending'
      AND job_type = ANY(p_job_types)
      AND scheduled_at <= NOW()
      AND (locked_until IS NULL OR locked_until < NOW())
    ORDER BY priority ASC, scheduled_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING * INTO v_job;
  
  RETURN v_job;
END;
$$ LANGUAGE plpgsql;

-- Function to release stale locks
CREATE OR REPLACE FUNCTION release_stale_locks()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE job_queue
  SET 
    status = 'pending',
    worker_id = NULL,
    locked_until = NULL,
    claimed_at = NULL,
    updated_at = NOW()
  WHERE status = 'claimed'
    AND locked_until < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to move job to dead letter queue
CREATE OR REPLACE FUNCTION move_to_dead_letter(
  p_job_id UUID,
  p_failure_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_job job_queue;
BEGIN
  -- Get the job
  SELECT * INTO v_job FROM job_queue WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Insert into dead letter queue
  INSERT INTO dead_letter_queue (
    original_job_id,
    job_type,
    provisioning_job_id,
    failure_reason,
    attempt_count,
    last_error,
    payload
  ) VALUES (
    v_job.id,
    v_job.job_type,
    v_job.provisioning_job_id,
    p_failure_reason,
    v_job.attempt_count,
    v_job.last_error,
    v_job.payload
  );
  
  -- Update job status
  UPDATE job_queue
  SET 
    status = 'dead_letter',
    updated_at = NOW()
  WHERE id = p_job_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_heartbeats ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for workers)
CREATE POLICY "Service role has full access to job_queue"
  ON job_queue FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to dead_letter_queue"
  ON dead_letter_queue FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to worker_heartbeats"
  ON worker_heartbeats FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Admins can view queue state
CREATE POLICY "Admins can view job_queue"
  ON job_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view dead_letter_queue"
  ON dead_letter_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
