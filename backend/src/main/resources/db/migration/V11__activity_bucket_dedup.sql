-- Ensure unique constraint exists for deduplication
-- For PostgreSQL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_activity_bucket') THEN
        ALTER TABLE activity_buckets ADD CONSTRAINT uq_activity_bucket UNIQUE (device_id, bucket_start, bucket_minutes);
    END IF;
END $$;
