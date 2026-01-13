package com.productivityx.model.telemetry;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_usage_events")
@Data
public class AppUsageEvent {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "ts_start", nullable = false)
    private LocalDateTime tsStart;

    @Column(name = "ts_end", nullable = false)
    private LocalDateTime tsEnd;

    @Column(name = "duration_seconds", insertable = false, updatable = false)
    @Generated(GenerationTime.ALWAYS) // Let DB calculate it
    private Integer durationSeconds;

    @Column(name = "app_name")
    private String appName;

    @Column(name = "process_name")
    private String processName;

    @Column(name = "category")
    private String category;
}
