-- Align Policies Table
ALTER TABLE policies RENAME COLUMN id TO policy_id;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS active_version_id UUID;

-- Align Policy Versions Table
ALTER TABLE policy_versions RENAME COLUMN id TO version_id;
ALTER TABLE policy_versions RENAME COLUMN version_number TO version;
ALTER TABLE policy_versions RENAME COLUMN config TO configuration;
ALTER TABLE policy_versions ALTER COLUMN configuration TYPE TEXT;

-- Align Policy Targets Table
-- 1. Rename existing 'target_id' (value) to 'target_value' to free up the name
ALTER TABLE policy_targets RENAME COLUMN target_id TO target_value;
-- 2. Rename 'id' (PK) to 'target_id'
ALTER TABLE policy_targets RENAME COLUMN id TO target_id;

-- Cast VARCHAR to UUID (Safe because V3 seed data used UUID strings)
ALTER TABLE policy_targets ALTER COLUMN target_value TYPE UUID USING target_value::uuid;
ALTER TABLE policy_targets ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Align Policy Acks Table
ALTER TABLE policy_acks RENAME COLUMN id TO ack_id;
ALTER TABLE policy_acks RENAME COLUMN policy_version_id TO version_id;
ALTER TABLE policy_acks ADD COLUMN IF NOT EXISTS policy_id UUID;
ALTER TABLE policy_acks ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP;

-- Populate policy_id in acks
UPDATE policy_acks pa 
SET policy_id = pv.policy_id 
FROM policy_versions pv 
WHERE pa.version_id = pv.version_id;
