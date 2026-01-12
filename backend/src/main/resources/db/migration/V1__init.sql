CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE departments (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL
);

CREATE TABLE device_registry (
    device_id VARCHAR(255) PRIMARY KEY, -- urn:focus:device:uuid
    tenant_id UUID REFERENCES tenants(id),
    status VARCHAR(50),
    enrolled_at TIMESTAMP,
    last_seen_at TIMESTAMP,
    fingerprint VARCHAR(255)
);

CREATE TABLE telemetry_events (
    event_id VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) REFERENCES device_registry(device_id),
    timestamp TIMESTAMP NOT NULL,
    focus_score INT,
    away_seconds INT,
    idle_seconds INT,
    data JSONB, -- store extra details like appDurations
    PRIMARY KEY (device_id, event_id),
    CONSTRAINT unique_event_per_device UNIQUE (device_id, event_id)
);

CREATE TABLE daily_aggregates (
    id UUID PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES device_registry(device_id),
    date DATE NOT NULL,
    avg_focus_score DOUBLE PRECISION,
    total_away_seconds BIGINT,
    total_idle_seconds BIGINT,
    UNIQUE (device_id, date)
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, MANAGER, EMPLOYEE
    tenant_id UUID REFERENCES tenants(id),
    department_id UUID REFERENCES departments(id)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor_id UUID REFERENCES users(id),
    action VARCHAR(255),
    details JSONB,
    timestamp TIMESTAMP
);
