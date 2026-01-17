-- Daily Device Summary (Aggregates)
CREATE TABLE daily_device_summary (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    
    active_seconds INT DEFAULT 0,
    idle_seconds INT DEFAULT 0,
    
    top_apps JSONB DEFAULT '[]', -- List of top 5 apps by duration
    top_domains JSONB DEFAULT '[]', -- List of top 5 domains by duration
    risk_counters JSONB DEFAULT '{}', -- e.g. {"usb_copy": 2, "blocked_sites": 1}
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_daily_device_summary UNIQUE (device_id, date)
);
CREATE INDEX IF NOT EXISTS idx_daily_device_summary_tenant_date ON daily_device_summary(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_device_summary_org_date ON daily_device_summary(org_id, date);

-- Daily Org Summary (Aggregates)
CREATE TABLE daily_org_summary (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    org_id UUID NOT NULL,
    date DATE NOT NULL,
    
    total_active_seconds BIGINT DEFAULT 0,
    total_idle_seconds BIGINT DEFAULT 0,
    active_devices_count INT DEFAULT 0,
    
    top_apps JSONB DEFAULT '[]',
    top_domains JSONB DEFAULT '[]',
    risk_counters JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_daily_org_summary UNIQUE (org_id, date)
);
CREATE INDEX IF NOT EXISTS idx_daily_org_summary_tenant_date ON daily_org_summary(tenant_id, date);
