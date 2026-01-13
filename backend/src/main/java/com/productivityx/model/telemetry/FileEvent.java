package com.productivityx.model.telemetry;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "file_events")
@Data
public class FileEvent {
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

    private String operation;
    
    @Column(name = "file_ext")
    private String fileExt;
    
    @Column(name = "size_bytes")
    private Long sizeBytes;
    
    @Column(name = "is_usb")
    private Boolean isUsb;

    @Column(name = "ingest_batch_id")
    private UUID ingestBatchId;
}
