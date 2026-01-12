-- Create new tables if they don't exist
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id VARCHAR(255),
    role VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS alert_events (
    id VARCHAR(255) PRIMARY KEY,
    employee_id VARCHAR(255) REFERENCES employees(id),
    employee_name VARCHAR(255),
    type VARCHAR(50),
    severity VARCHAR(50),
    timestamp TIMESTAMP,
    acknowledged BOOLEAN,
    details TEXT
);

CREATE TABLE IF NOT EXISTS daily_productivity_summary (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) REFERENCES employees(id),
    date DATE,
    focus_score INT,
    active_hours DOUBLE PRECISION,
    idle_hours DOUBLE PRECISION,
    off_task_hours DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS app_usage_records (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) REFERENCES employees(id),
    category VARCHAR(50),
    app_name VARCHAR(255),
    duration_seconds INT
);

CREATE TABLE IF NOT EXISTS website_visit_records (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) REFERENCES employees(id),
    domain VARCHAR(255),
    visits INT,
    duration_seconds INT,
    is_blocked BOOLEAN
);

CREATE TABLE IF NOT EXISTS policy_settings (
    id SERIAL PRIMARY KEY,
    idle_threshold_minutes INT,
    gaze_away_threshold_seconds INT,
    off_task_threshold_minutes INT,
    exempt_schedules TEXT[],
    whitelisted_apps TEXT[],
    blacklisted_sites TEXT[]
);

-- Seed Departments (using the departments table from V1)
INSERT INTO departments (id, name, tenant_id) VALUES 
('d1111111-1111-1111-1111-111111111111', 'Engineering', null),
('d2222222-2222-2222-2222-222222222222', 'Sales', null),
('d3333333-3333-3333-3333-333333333333', 'Marketing', null),
('d4444444-4444-4444-4444-444444444444', 'HR', null)
ON CONFLICT DO NOTHING;

-- Seed Policy
INSERT INTO policy_settings (idle_threshold_minutes, gaze_away_threshold_seconds, off_task_threshold_minutes, exempt_schedules, whitelisted_apps, blacklisted_sites)
VALUES (5, 30, 10, ARRAY['12:00-13:00'], ARRAY['VS Code', 'Chrome'], ARRAY['facebook.com', 'tiktok.com']);

-- Seed Employees
INSERT INTO employees (id, name, department_id, role, email, status) VALUES
('emp-0', 'John Doe', 'd1111111-1111-1111-1111-111111111111', 'Manager', 'john.doe@company.com', 'ACTIVE'),
('emp-1', 'Jane Smith', 'd1111111-1111-1111-1111-111111111111', 'Contributor', 'jane.smith@company.com', 'IDLE'),
('emp-2', 'Bob Jones', 'd2222222-2222-2222-2222-222222222222', 'Manager', 'bob.jones@company.com', 'ACTIVE'),
('emp-3', 'Alice Wonder', 'd2222222-2222-2222-2222-222222222222', 'Contributor', 'alice.wonder@company.com', 'OFFLINE');

-- Seed Alerts
INSERT INTO alert_events (id, employee_id, employee_name, type, severity, timestamp, acknowledged, details) VALUES
('alert-1', 'emp-1', 'Jane Smith', 'IDLE_TIMEOUT', 'LOW', NOW() - INTERVAL '2 hours', false, 'Idle for 15 mins'),
('alert-2', 'emp-3', 'Alice Wonder', 'BLOCKED_SITE', 'HIGH', NOW() - INTERVAL '1 day', true, 'Visited facebook.com');

-- Seed Daily Summary
INSERT INTO daily_productivity_summary (employee_id, date, focus_score, active_hours, idle_hours, off_task_hours) VALUES
('emp-0', CURRENT_DATE, 85, 7.5, 0.5, 0.2),
('emp-0', CURRENT_DATE - 1, 90, 8.0, 0.2, 0.1),
('emp-1', CURRENT_DATE, 60, 5.0, 2.0, 1.0);
