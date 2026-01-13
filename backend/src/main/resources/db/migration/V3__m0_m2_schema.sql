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
-- Organizations
INSERT INTO organizations (id, name) VALUES 
('aaa11111-1111-1111-1111-111111111111', 'Acme Corp'),
('bbb22222-2222-2222-2222-222222222222', 'Globex Inc')
ON CONFLICT DO NOTHING;

-- Users (Password hashes are mocks)
INSERT INTO users (id, username, password_hash, role, tenant_id, name, email) VALUES
('u1000000-0000-0000-0000-000000000001', 'admin', '{noop}admin123', 'ADMIN', 'aaa11111-1111-1111-1111-111111111111', 'System Admin', 'admin@acme.com'),
('u1000000-0000-0000-0000-000000000002', 'manager', '{noop}manager123', 'MANAGER', 'aaa11111-1111-1111-1111-111111111111', 'Dept Manager', 'manager@acme.com'),
('u1000000-0000-0000-0000-000000000003', 'employee', '{noop}user123', 'EMPLOYEE', 'aaa11111-1111-1111-1111-111111111111', 'Jane Doe', 'jane@acme.com'),
('u1000000-0000-0000-0000-000000000004', 'audit', '{noop}audit123', 'ORG_ADMIN', 'aaa11111-1111-1111-1111-111111111111', 'Audit Log Viewer', 'audit@acme.com'),
('u1000000-0000-0000-0000-000000000005', 'dev', '{noop}dev123', 'ADMIN', 'bbb22222-2222-2222-2222-222222222222', 'Dev Tenant', 'dev@globex.com')
ON CONFLICT DO NOTHING;

-- Device Groups
INSERT INTO device_groups (id, name, description, organization_id) VALUES
('grp11111-1111-1111-1111-111111111111', 'Engineering Laptops', 'Standard dev machines', 'aaa11111-1111-1111-1111-111111111111'),
('grp22222-2222-2222-2222-222222222222', 'Sales Tablets', 'Field devices', 'aaa11111-1111-1111-1111-111111111111'),
('grp33333-3333-3333-3333-333333333333', 'Kiosk Terminals', 'Public access', 'aaa11111-1111-1111-1111-111111111111'),
('grp44444-4444-4444-4444-444444444444', 'Executive Mobiles', 'High security', 'aaa11111-1111-1111-1111-111111111111'),
('grp55555-5555-5555-5555-555555555555', 'Test Lab', 'Unrestricted', 'bbb22222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Devices
INSERT INTO devices (device_id, name, group_id, tenant_id, status, version, last_seen_at) VALUES
('dev-001', 'John-MacBook', 'grp11111-1111-1111-1111-111111111111', 'aaa11111-1111-1111-1111-111111111111', 'ONLINE', 'v2.0.1', NOW()),
('dev-002', 'Sarah-Windows', 'grp11111-1111-1111-1111-111111111111', 'aaa11111-1111-1111-1111-111111111111', 'OFFLINE', 'v2.0.0', NOW() - INTERVAL '1 day'),
('dev-003', 'Sales-Pad-01', 'grp22222-2222-2222-2222-222222222222', 'aaa11111-1111-1111-1111-111111111111', 'ONLINE', 'v1.9.5', NOW()),
('dev-004', 'Kiosk-Lobby', 'grp33333-3333-3333-3333-333333333333', 'aaa11111-1111-1111-1111-111111111111', 'ERROR', 'v2.0.1', NOW() - INTERVAL '5 hours'),
('dev-005', 'Test-VM-01', 'grp55555-5555-5555-5555-555555555555', 'bbb22222-2222-2222-2222-222222222222', 'ONLINE', 'v2.1.0-beta', NOW())
ON CONFLICT DO NOTHING;

-- Policies
INSERT INTO policies (id, name, description, organization_id) VALUES
('pol11111-1111-1111-1111-111111111111', 'Global Default', 'Base security policy', 'aaa11111-1111-1111-1111-111111111111'),
('pol22222-2222-2222-2222-222222222222', 'Strict Engineering', 'No social media', 'aaa11111-1111-1111-1111-111111111111'),
('pol33333-3333-3333-3333-333333333333', 'Sales Field', 'GPS tracking enabled', 'aaa11111-1111-1111-1111-111111111111'),
('pol44444-4444-4444-4444-444444444444', 'Kiosk Mode', 'Single app only', 'aaa11111-1111-1111-1111-111111111111'),
('pol55555-5555-5555-5555-555555555555', 'Dev Valid', 'Test policy', 'bbb22222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Policy Versions
INSERT INTO policy_versions (id, policy_id, version_number, config, description) VALUES
('ver11111-1111-1111-1111-111111111111', 'pol11111-1111-1111-1111-111111111111', 1, '{"idleTimeout": 10, "block": ["facebook.com"]}', 'Initial release'),
('ver22222-2222-2222-2222-222222222222', 'pol11111-1111-1111-1111-111111111111', 2, '{"idleTimeout": 5, "block": ["facebook.com", "tiktok.com"]}', 'Stricter timeout'),
('ver33333-3333-3333-3333-333333333333', 'pol22222-2222-2222-2222-222222222222', 1, '{"whitelist": ["VSCode", "Slack"]}', 'Eng baseline'),
('ver44444-4444-4444-4444-444444444444', 'pol33333-3333-3333-3333-333333333333', 1, '{"location": true}', 'Sales baseline'),
('ver55555-5555-5555-5555-555555555555', 'pol44444-4444-4444-4444-444444444444', 1, '{"kioskApp": "LobbyApp"}', 'Kiosk setup')
ON CONFLICT DO NOTHING;

-- Policy Targets
INSERT INTO policy_targets (id, policy_id, target_type, target_id) VALUES
('tgt11111-1111-1111-1111-111111111111', 'pol11111-1111-1111-1111-111111111111', 'ORGANIZATION', 'aaa11111-1111-1111-1111-111111111111'),
('tgt22222-2222-2222-2222-222222222222', 'pol22222-2222-2222-2222-222222222222', 'GROUP', 'grp11111-1111-1111-1111-111111111111');

-- Policy Acks
INSERT INTO policy_acks (id, policy_version_id, device_id, status, message) VALUES
('ack11111-1111-1111-1111-111111111111', 'ver22222-2222-2222-2222-222222222222', 'dev-001', 'APPLIED', 'Success'),
('ack22222-2222-2222-2222-222222222222', 'ver22222-2222-2222-2222-222222222222', 'dev-002', 'PENDING', 'Device offline'),
('ack33333-3333-3333-3333-333333333333', 'ver22222-2222-2222-2222-222222222222', 'dev-004', 'FAILED', 'Config error code 500'),
('ack44444-4444-4444-4444-444444444444', 'ver44444-4444-4444-4444-444444444444', 'dev-003', 'APPLIED', 'GPS active'),
('ack55555-5555-5555-5555-555555555555', 'ver55555-5555-5555-5555-555555555555', 'dev-005', 'APPLIED', 'Check passed')
ON CONFLICT DO NOTHING;
