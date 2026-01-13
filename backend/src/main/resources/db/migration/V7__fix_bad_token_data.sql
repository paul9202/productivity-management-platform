-- Fix invalid Tenant IDs in enrollment_tokens
-- Repoint '0000...00' to Acme Corp ('1000...01')
UPDATE enrollment_tokens
SET scope_tenant_id = '10000000-0000-0000-0000-000000000001'
WHERE scope_tenant_id = '00000000-0000-0000-0000-000000000000';

-- Also fix the 'created_by' user if it was set to 0000...
-- Repoint to System Admin ('2000...01')
UPDATE enrollment_tokens
SET created_by = '20000000-0000-0000-0000-000000000001'
WHERE created_by = '00000000-0000-0000-0000-000000000001' OR created_by = '00000000-0000-0000-0000-000000000000';
