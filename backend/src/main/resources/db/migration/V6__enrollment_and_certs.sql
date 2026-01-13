-- Create enrollment_tokens table
CREATE TABLE enrollment_tokens (
    id UUID PRIMARY KEY,
    token_hash VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- BOOTSTRAP, REGCODE
    expires_at TIMESTAMP NOT NULL,
    max_uses INT NOT NULL,
    used_count INT DEFAULT 0,
    revoked_at TIMESTAMP,
    created_by UUID NOT NULL, -- User ID
    scope_tenant_id UUID NOT NULL, -- Organization ID
    scope_org_id UUID, -- Optional sub-department
    scope_group_id UUID, -- Optional device group
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create device_certificates table
CREATE TABLE device_certificates (
    thumbprint VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    serial_number VARCHAR(255),
    issuer VARCHAR(255)
);

-- Alter devices table
ALTER TABLE devices 
    ADD COLUMN IF NOT EXISTS fingerprint_hash VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cert_thumbprint VARCHAR(255),
    ADD COLUMN IF NOT EXISTS agent_version VARCHAR(50);
-- enrolled_at and last_seen_at already exist in entity but checking db
-- (They might not be in V3 migration, so adding if not exists)

DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE devices ADD COLUMN enrolled_at TIMESTAMP;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column enrolled_at already exists in devices.';
    END;
    BEGIN
        ALTER TABLE devices ADD COLUMN last_seen_at TIMESTAMP;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column last_seen_at already exists in devices.';
    END;
END $$;

-- Seed Data for Enrollment Tokens
-- We need a valid User ID from the V2 seed data. Assuming Admin is available.
-- Inserting a bootstrap token and a registration code.
-- Note: 'token_hash' should be a hash, but for mock/dev we might put plain text or a simple hash.
-- Using 'hash_of_secret_token' for demo purposes.

INSERT INTO enrollment_tokens (id, token_hash, type, expires_at, max_uses, used_count, created_by, scope_tenant_id, created_at)
VALUES 
    ('e1000000-0000-0000-0000-000000000001', 'hash_bootstrap_123', 'BOOTSTRAP', NOW() + INTERVAL '365 days', 9999, 0, '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NOW()),
    ('e1000000-0000-0000-0000-000000000002', 'hash_regcode_456', 'REGCODE', NOW() + INTERVAL '30 days', 1, 0, '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NOW());
