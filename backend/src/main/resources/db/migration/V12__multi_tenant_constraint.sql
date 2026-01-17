-- Drop old constraint and add new multi-tenant aware constraint
ALTER TABLE daily_device_summary DROP CONSTRAINT IF EXISTS uq_daily_device_summary;

ALTER TABLE daily_device_summary ADD CONSTRAINT uq_daily_device_summary UNIQUE (tenant_id, org_id, device_id, date);
