package com.productivityx.model.telemetry;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_buckets")
@Data
public class ActivityBucket {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "bucket_start", nullable = false)
    private LocalDateTime bucketStart;

    @Column(name = "bucket_minutes")
    private Integer bucketMinutes = 5;

    @Column(name = "active_seconds")
    private Integer activeSeconds;

    @Column(name = "idle_seconds")
    private Integer idleSeconds;

    @Column(name = "away_seconds")
    private Integer awaySeconds;

    @Column(name = "locked_seconds")
    private Integer lockedSeconds;

    @Column(name = "avg_focus_score")
    private Integer avgFocusScore;

    @Column(name = "context_switch_count")
    private Integer contextSwitchCount;

    @Column(name = "top_app")
    private String topApp;

    @Column(name = "top_domain")
    private String topDomain;

    @Column(name = "ingest_batch_id")
    private UUID ingestBatchId;
}
