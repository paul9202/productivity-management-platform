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

    @Column(name = "ts_ms")
    private Long tsMs;

    private String operation;
    
    @Column(name = "path_hash")
    private String pathHash;
    
    @Column(name = "file_ext")
    private String fileExt;
    
    @Column(name = "size_bytes")
    private Long sizeBytes;
    
    @Column(name = "is_usb")
    private Boolean isUsb;

    @Column(name = "is_external")
    private Boolean isExternal;

    @Column(name = "dest_path_hash")
    private String destPathHash;

    @Column(name = "ingest_batch_id")
    private UUID ingestBatchId;
}
