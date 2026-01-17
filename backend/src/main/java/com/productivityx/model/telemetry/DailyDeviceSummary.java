package com.productivityx.model.telemetry;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "daily_device_summary")
public class DailyDeviceSummary {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "active_seconds")
    private Integer activeSeconds = 0;

    @Column(name = "idle_seconds")
    private Integer idleSeconds = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "top_apps")
    private String topApps; // JSONB

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "top_domains")
    private String topDomains; // JSONB

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "risk_counters")
    private String riskCounters; // JSONB

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
    }
}
