package com.productivityx.model.telemetry;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "device_heartbeats")
@Data
public class DeviceHeartbeat {
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

    private String status;
    
    @Column(name = "agent_version")
    private String agentVersion;

    @Column(name = "queue_depth")
    private Integer queueDepth;

    @Column(name = "upload_error_count")
    private Integer uploadErrorCount;

    @Column(name = "ingest_batch_id")
    private UUID ingestBatchId;
}
