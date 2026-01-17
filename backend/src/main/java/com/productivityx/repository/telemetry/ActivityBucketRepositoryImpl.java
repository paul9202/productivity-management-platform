package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.ActivityBucket;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ActivityBucketRepositoryImpl implements ActivityBucketRepositoryCustom {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public int saveAllIgnoreConflict(List<ActivityBucket> buckets) {
        String sql = "INSERT INTO activity_buckets " +
                "(id, tenant_id, org_id, device_id, bucket_start, bucket_minutes, " +
                "active_seconds, idle_seconds, avg_focus_score, ingest_batch_id, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) " +
                "ON CONFLICT (device_id, bucket_start, bucket_minutes) DO NOTHING";

        int[][] result = jdbcTemplate.batchUpdate(sql, buckets, 1000, (ps, bucket) -> {
            ps.setObject(1, bucket.getId());
            ps.setObject(2, bucket.getTenantId());
            ps.setObject(3, bucket.getOrgId());
            ps.setString(4, bucket.getDeviceId());
            ps.setTimestamp(5, Timestamp.valueOf(bucket.getBucketStart()));
            ps.setObject(6, bucket.getBucketMinutes());
            ps.setObject(7, bucket.getActiveSeconds());
            ps.setObject(8, bucket.getIdleSeconds());
            ps.setObject(9, bucket.getAvgFocusScore());
            ps.setObject(10, bucket.getIngestBatchId());
        });
        
        int inserted = 0;
        for (int[] batchResult : result) {
            for (int r : batchResult) {
                if (r > 0) inserted += r;
            }
        }
        return inserted;
    }
}
