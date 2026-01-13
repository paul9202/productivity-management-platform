-- Create Policies Table
CREATE TABLE policies (
    policy_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id UUID NOT NULL,
    active_version_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create Policy Versions Table
CREATE TABLE policy_versions (
    version_id UUID PRIMARY KEY,
    policy_id UUID NOT NULL,
    version INTEGER NOT NULL,
    configuration TEXT,
    created_at TIMESTAMP,
    created_by VARCHAR(255),
    CONSTRAINT fk_version_policy FOREIGN KEY (policy_id) REFERENCES policies(policy_id)
);

-- Create Policy Targets Table
CREATE TABLE policy_targets (
    target_id UUID PRIMARY KEY,
    policy_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value UUID NOT NULL,
    priority INTEGER DEFAULT 0,
    CONSTRAINT fk_target_policy FOREIGN KEY (policy_id) REFERENCES policies(policy_id)
);

-- Create Policy Acks Table
CREATE TABLE policy_acks (
    ack_id UUID PRIMARY KEY,
    policy_id UUID NOT NULL,
    version_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    message TEXT,
    acknowledged_at TIMESTAMP,
    synced_at TIMESTAMP
);

-- Initial Indexing for performance
CREATE INDEX idx_policies_org ON policies(organization_id);
CREATE INDEX idx_versions_policy ON policy_versions(policy_id);
CREATE INDEX idx_targets_policy ON policy_targets(policy_id);
CREATE INDEX idx_acks_device ON policy_acks(device_id);
