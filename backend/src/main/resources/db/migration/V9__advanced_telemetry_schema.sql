-- Devices Enhancement
ALTER TABLE devices ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS hostname VARCHAR(255);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS os_info VARCHAR(255);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS policy_version VARCHAR(50);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS last_upload_at TIMESTAMPTZ;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS ack_status VARCHAR(50);
-- status and last_seen_at usually already exist, ensuring columns and constraints
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ack_status') THEN
        ALTER TABLE devices ADD CONSTRAINT chk_ack_status CHECK (ack_status IN ('PENDING', 'APPLIED', 'FAILED'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_status') THEN
        ALTER TABLE devices ADD CONSTRAINT chk_status CHECK (status IN ('ONLINE', 'OFFLINE'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_devices_status_last_seen ON devices(status, last_seen_at DESC);

-- 2.1 Activity Bucket
CREATE TABLE activity_buckets (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL, -- references devices.id is tricky if device_id is String vs UUID in code. Assuming String ID in this codebase.
    user_id UUID, -- Potential link to Users table
    
    bucket_start TIMESTAMPTZ NOT NULL,
    bucket_minutes INT DEFAULT 5 CHECK (bucket_minutes > 0),
    
    active_seconds INT DEFAULT 0 CHECK (active_seconds >= 0),
    idle_seconds INT DEFAULT 0 CHECK (idle_seconds >= 0),
    away_seconds INT DEFAULT 0 CHECK (away_seconds >= 0),
    locked_seconds INT DEFAULT 0 CHECK (locked_seconds >= 0),
    
    avg_focus_score INT DEFAULT 0 CHECK (avg_focus_score BETWEEN 0 AND 100), 
    context_switch_count INT DEFAULT 0,
    
    top_app VARCHAR(255),
    top_domain VARCHAR(255),
    
    ingest_batch_id UUID, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_activity_bucket UNIQUE (device_id, bucket_start, bucket_minutes)
);
CREATE INDEX IF NOT EXISTS idx_activity_tenant_time ON activity_buckets(tenant_id, bucket_start);

-- 2.2 App Usage Events
CREATE TABLE app_usage_events (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    user_id UUID,
    
    ts_start TIMESTAMPTZ NOT NULL,
    ts_end TIMESTAMPTZ NOT NULL,
    -- PostgreSQL 12+ generated column
    duration_seconds INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (ts_end - ts_start))) STORED,
    
    app_name VARCHAR(255),
    process_name VARCHAR(255),
    publisher VARCHAR(255),
    category VARCHAR(100),
    window_title_hash VARCHAR(64),
    
    ingest_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (ts_end >= ts_start)
);
CREATE INDEX IF NOT EXISTS idx_app_tenant_start ON app_usage_events(tenant_id, ts_start);
CREATE INDEX IF NOT EXISTS idx_app_device_start ON app_usage_events(device_id, ts_start);

-- 2.3 Web Usage Events
CREATE TABLE web_usage_events (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    user_id UUID,
    
    ts_start TIMESTAMPTZ NOT NULL, 
    ts_end TIMESTAMPTZ NOT NULL,
    duration_seconds INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (ts_end - ts_start))) STORED,
    
    domain VARCHAR(255),
    url_path_hash VARCHAR(64),
    category VARCHAR(100),
    source VARCHAR(50),
    
    ingest_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (ts_end >= ts_start)
);
CREATE INDEX IF NOT EXISTS idx_web_tenant_start ON web_usage_events(tenant_id, ts_start);

-- 2.4 File Events
CREATE TABLE file_events (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    
    operation VARCHAR(50) NOT NULL,
    path_hash VARCHAR(64),
    file_ext VARCHAR(20),
    size_bytes BIGINT,
    
    is_usb BOOLEAN DEFAULT FALSE,
    is_network_share BOOLEAN DEFAULT FALSE,
    process_name VARCHAR(255),
    
    ingest_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (operation IN ('CREATE','MODIFY','DELETE','RENAME','COPY','MOVE'))
);
CREATE INDEX IF NOT EXISTS idx_file_tenant_time ON file_events(tenant_id, ts);

-- 2.5 Block Events
CREATE TABLE block_events (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    
    target_type VARCHAR(50) NOT NULL,
    target_value VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    result VARCHAR(50),
    
    policy_id UUID,
    policy_version VARCHAR(50),
    rule_id VARCHAR(100),
    reason_code VARCHAR(50),
    
    ingest_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (target_type IN ('APP','WEB')),
    CHECK (action IN ('BLOCK','WARN'))
);
CREATE INDEX IF NOT EXISTS idx_block_tenant_time ON block_events(tenant_id, ts);

-- 3.1 Device Heartbeats
CREATE TABLE device_heartbeats (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    
    status VARCHAR(50), 
    agent_version VARCHAR(50),
    policy_version VARCHAR(50),
    
    queue_depth INT DEFAULT 0 CHECK (queue_depth >= 0),
    last_upload_at TIMESTAMPTZ,
    upload_error_count INT DEFAULT 0 CHECK (upload_error_count >= 0),
    camera_state VARCHAR(50) DEFAULT 'OK', 
    
    ingest_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_heartbeat_device_ts ON device_heartbeats(device_id, ts DESC);
