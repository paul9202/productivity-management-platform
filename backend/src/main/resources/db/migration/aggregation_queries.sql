-- SQL to update Daily Device Summary with Top Apps and Domains from Raw Events
-- This can be run periodically (e.g. via pg_cron or Spring Scheduler)

-- 1. Compute Daily Stats per Device (Temporary View or CTE)
WITH daily_stats AS (
    SELECT 
        device_id,
        DATE(ts_start) as work_date,
        SUM(EXTRACT(EPOCH FROM (ts_end - ts_start))) as total_duration
    FROM app_usage_events
    GROUP BY device_id, work_date
),
top_apps AS (
    SELECT 
        device_id,
        DATE(ts_start) as work_date,
        jsonb_agg(jsonb_build_object('name', app_name, 'duration', duration)) as apps_json
    FROM (
        SELECT 
            device_id, 
            DATE(ts_start) as work_date, 
            app_name, 
            SUM(EXTRACT(EPOCH FROM (ts_end - ts_start))) as duration
        FROM app_usage_events
        GROUP BY device_id, work_date, app_name
        ORDER BY duration DESC
        LIMIT 5 -- Top 5
    ) t
    GROUP BY device_id, work_date
)
UPDATE daily_device_summary s
SET 
    top_apps = t.apps_json,
    updated_at = NOW()
FROM top_apps t
WHERE s.device_id = t.device_id AND s.date = t.work_date;

-- Same logic applies for Web Events -> top_domains
