-- V13__policy_and_risk.sql
-- Implements Policy Pack, Assignment, Snapshot, Acknowledgement, Risk Events, and Telemetry Updates

-- A) Policy Tables

-- 1. Policy Pack
CREATE TABLE IF NOT EXISTS policy_pack (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL, -- DRAFT, PUBLISHED, ARCHIVED
    published_version INT DEFAULT 0,
    config_draft JSONB, -- Editable draft config
    created_at BIGINT, -- epoch ms
    updated_at BIGINT,
    created_by UUID, -- audit
    updated_by UUID
);
CREATE INDEX idx_policy_pack_tenant ON policy_pack(tenant_id, org_id);

-- 2. Policy Snapshot (Immutable)
CREATE TABLE IF NOT EXISTS policy_snapshot (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    policy_id UUID REFERENCES policy_pack(id),
    version INT NOT NULL,
    snapshot_json JSONB NOT NULL,
    etag TEXT NOT NULL,
    issued_at_ms BIGINT NOT NULL,
    expires_at_ms BIGINT NOT NULL,
    created_at BIGINT,
    UNIQUE (policy_id, version)
);
CREATE INDEX idx_policy_snapshot_tenant_policy ON policy_snapshot(tenant_id, org_id, policy_id, version DESC);

-- 3. Policy Assignment
CREATE TABLE IF NOT EXISTS policy_assignment (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    policy_id UUID REFERENCES policy_pack(id),
    active BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 100,
    created_at BIGINT,
    updated_at BIGINT
);
CREATE UNIQUE INDEX idx_policy_assignment_unique_active 
    ON policy_assignment(tenant_id, org_id, device_id) 
    WHERE active = true;

-- 4. Device Policy Ack
CREATE TABLE IF NOT EXISTS device_policy_ack (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    policy_id UUID NOT NULL,
    version INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- APPLIED, FAILED, STALE
    reason TEXT,
    applied_at_ms BIGINT,
    agent_version VARCHAR(50),
    client_etag TEXT,
    created_at BIGINT
);
CREATE INDEX idx_device_policy_ack_device_ts 
    ON device_policy_ack(tenant_id, org_id, device_id, created_at DESC);
CREATE UNIQUE INDEX idx_device_policy_ack_dedup 
    ON device_policy_ack(tenant_id, org_id, device_id, policy_id, version, client_etag);

-- 5. Audit Log (Optional but requested)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255),
    details_json JSONB,
    ts_ms BIGINT NOT NULL
);
CREATE INDEX idx_audit_log_tenant_ts ON audit_log(tenant_id, org_id, ts_ms DESC);


-- B) Risk & Telemetry Tables

-- 6. USB Events
CREATE TABLE IF NOT EXISTS usb_events (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    ts_ms BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, REMOVE
    drive_letter VARCHAR(10),
    vendor_id VARCHAR(50),
    product_id VARCHAR(50),
    volume_serial VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_usb_events_device_ts ON usb_events(tenant_id, org_id, device_id, ts_ms DESC);

-- 7. File Events Updates (ALTER existing table)
-- Check columns first to avoid errors if re-running
ALTER TABLE file_events ADD COLUMN IF NOT EXISTS ts_ms BIGINT DEFAULT 0;
ALTER TABLE file_events ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT FALSE;
ALTER TABLE file_events ADD COLUMN IF NOT EXISTS dest_path_hash VARCHAR(64);

-- Indexes for R1/R2
CREATE INDEX IF NOT EXISTS idx_file_events_external_ts 
    ON file_events(tenant_id, org_id, device_id, is_external, ts_ms DESC);
CREATE INDEX IF NOT EXISTS idx_file_events_operation_ts 
    ON file_events(tenant_id, org_id, device_id, operation, ts_ms DESC);

-- 8. Risk Events
CREATE TABLE IF NOT EXISTS risk_event (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MED, HIGH
    type VARCHAR(50) NOT NULL, -- R1_USB_EXFIL, R2_MASS_DELETE_RENAME
    window_start_ms BIGINT,
    window_end_ms BIGINT,
    evidence_json JSONB,
    dedup_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'OPEN'
);
CREATE UNIQUE INDEX idx_risk_event_dedup 
    ON risk_event(tenant_id, org_id, device_id, type, dedup_key);
CREATE INDEX idx_risk_event_tenant_created 
    ON risk_event(tenant_id, org_id, created_at DESC);
