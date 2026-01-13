-- M0: Foundation & Auth
-- Refactor 'tenants' to 'organizations' concept
ALTER TABLE tenants RENAME TO organizations;

-- Ensure Users have necessary fields for RBAC
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
-- role is already present (ADMIN, MANAGER, EMPLOYEE)

-- M1: Org & Device Management
-- Device Groups
CREATE TABLE IF NOT EXISTS device_groups (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refactor Device Registry to 'devices'
ALTER TABLE device_registry RENAME TO devices;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES device_groups(id);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS version VARCHAR(50);
-- status, last_seen_at, fingerprint, tenant_id (now organization_id conceptually) exist

-- M2: Policy Center
-- Drop simple policy_settings in favor of robust Policy Engine
DROP TABLE IF EXISTS policy_settings;

CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policy_versions (
    id UUID PRIMARY KEY,
    policy_id UUID REFERENCES policies(id),
    version_number INT NOT NULL,
    config JSONB NOT NULL, -- The actual rules (blocking, retention, etc)
    created_by UUID, -- REFERENCES users(id) technically
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS policy_targets (
    id UUID PRIMARY KEY,
    policy_id UUID REFERENCES policies(id),
    target_type VARCHAR(50), -- ORGANIZATION, DEPARTMENT, GROUP, DEVICE
    target_id VARCHAR(255) -- UUID or String ID
);

CREATE TABLE IF NOT EXISTS policy_acks (
    id UUID PRIMARY KEY,
    policy_version_id UUID REFERENCES policy_versions(id),
    device_id VARCHAR(255) REFERENCES devices(device_id),
    status VARCHAR(50), -- PENDING, APPLIED, FAILED
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT
);

-- SEED DATA (M0-M2)
-- Organizations (IDs must be valid UUIDs)
INSERT INTO organizations (id, name) VALUES 
('10000000-0000-0000-0000-000000000001', 'Acme Corp'),
('10000000-0000-0000-0000-000000000002', 'Globex Inc')
ON CONFLICT DO NOTHING;

-- Users (IDs must be valid UUIDs)
-- Replacing 'u' prefix with '1' and ensuring hex structure
INSERT INTO users (id, username, password_hash, role, tenant_id, name, email) VALUES
('20000000-0000-0000-0000-000000000001', 'admin', '{noop}admin123', 'ADMIN', '10000000-0000-0000-0000-000000000001', 'System Admin', 'admin@acme.com'),
('20000000-0000-0000-0000-000000000002', 'manager', '{noop}manager123', 'MANAGER', '10000000-0000-0000-0000-000000000001', 'Dept Manager', 'manager@acme.com'),
('20000000-0000-0000-0000-000000000003', 'employee', '{noop}user123', 'EMPLOYEE', '10000000-0000-0000-0000-000000000001', 'Jane Doe', 'jane@acme.com'),
('20000000-0000-0000-0000-000000000004', 'audit', '{noop}audit123', 'ORG_ADMIN', '10000000-0000-0000-0000-000000000001', 'Audit Log Viewer', 'audit@acme.com'),
('20000000-0000-0000-0000-000000000005', 'dev', '{noop}dev123', 'ADMIN', '10000000-0000-0000-0000-000000000002', 'Dev Tenant', 'dev@globex.com')
ON CONFLICT DO NOTHING;

-- Device Groups
INSERT INTO device_groups (id, name, description, organization_id) VALUES
('30000000-0000-0000-0000-000000000001', 'Engineering Laptops', 'Standard dev machines', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', 'Sales Tablets', 'Field devices', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000003', 'Kiosk Terminals', 'Public access', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000004', 'Executive Mobiles', 'High security', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000005', 'Test Lab', 'Unrestricted', '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Devices (device_id is VARCHAR, so 'dev-001' is fine)
INSERT INTO devices (device_id, name, group_id, tenant_id, status, version, last_seen_at) VALUES
('dev-001', 'John-MacBook', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'ONLINE', 'v2.0.1', NOW()),
('dev-002', 'Sarah-Windows', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'OFFLINE', 'v2.0.0', NOW() - INTERVAL '1 day'),
('dev-003', 'Sales-Pad-01', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'ONLINE', 'v1.9.5', NOW()),
('dev-004', 'Kiosk-Lobby', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'ERROR', 'v2.0.1', NOW() - INTERVAL '5 hours'),
('dev-005', 'Test-VM-01', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'ONLINE', 'v2.1.0-beta', NOW())
ON CONFLICT DO NOTHING;

-- Policies
INSERT INTO policies (id, name, description, organization_id) VALUES
('40000000-0000-0000-0000-000000000001', 'Global Default', 'Base security policy', '10000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000002', 'Strict Engineering', 'No social media', '10000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000003', 'Sales Field', 'GPS tracking enabled', '10000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000004', 'Kiosk Mode', 'Single app only', '10000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000005', 'Dev Valid', 'Test policy', '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Policy Versions
INSERT INTO policy_versions (id, policy_id, version_number, config, description) VALUES
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, '{"idleTimeout": 10, "block": ["facebook.com"]}', 'Initial release'),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 2, '{"idleTimeout": 5, "block": ["facebook.com", "tiktok.com"]}', 'Stricter timeout'),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 1, '{"whitelist": ["VSCode", "Slack"]}', 'Eng baseline'),
('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', 1, '{"location": true}', 'Sales baseline'),
('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000004', 1, '{"kioskApp": "LobbyApp"}', 'Kiosk setup')
ON CONFLICT DO NOTHING;

-- Policy Targets
INSERT INTO policy_targets (id, policy_id, target_type, target_id) VALUES
('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'ORGANIZATION', '10000000-0000-0000-0000-000000000001'),
('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'GROUP', '30000000-0000-0000-0000-000000000001');

-- Policy Acks
INSERT INTO policy_acks (id, policy_version_id, device_id, status, message) VALUES
('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'dev-001', 'APPLIED', 'Success'),
('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'dev-002', 'PENDING', 'Device offline'),
('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', 'dev-004', 'FAILED', 'Config error code 500'),
('70000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', 'dev-003', 'APPLIED', 'GPS active'),
('70000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', 'dev-005', 'APPLIED', 'Check passed')
ON CONFLICT DO NOTHING;
