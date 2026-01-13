-- M1: Add Departments
-- Drop the table if it exists (from V2 seed) to allow recreation with correct schema
DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manager_id UUID, -- Link to a User (Manager)
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add department_id and status to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';

-- Seed Departments
INSERT INTO departments (id, name, organization_id) VALUES
('80000000-0000-0000-0000-000000000001', 'Engineering', '10000000-0000-0000-0000-000000000001'),
('80000000-0000-0000-0000-000000000002', 'Sales', '10000000-0000-0000-0000-000000000001'),
('80000000-0000-0000-0000-000000000003', 'HR', '10000000-0000-0000-0000-000000000001');

-- Update Users to belong to departments
UPDATE users SET department_id = '80000000-0000-0000-0000-000000000001', status = 'ACTIVE' WHERE username = 'employee';
UPDATE users SET department_id = '80000000-0000-0000-0000-000000000002', status = 'ACTIVE' WHERE username = 'manager';
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
