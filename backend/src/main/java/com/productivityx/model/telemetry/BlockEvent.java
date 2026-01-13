package com.productivityx.model.telemetry;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "block_events")
@Data
public class BlockEvent {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "ts", nullable = false)
    private LocalDateTime ts;

    @Column(name = "target_type")
    private String targetType;

    @Column(name = "target_value")
    private String targetValue;

    private String action;
    private String result;

    @Column(name = "ingest_batch_id")
    private UUID ingestBatchId;
}
