package com.productivityx.model.telemetry;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "usb_events")
@Data
public class UsbEvent {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "device_id")
    private String deviceId;

    @Column(name = "ts_ms")
    private Long tsMs;

    private String action; // INSERT, REMOVE
    
    @Column(name = "drive_letter")
    private String driveLetter;
    
    @Column(name = "vendor_id")
    private String vendorId;
    
    @Column(name = "product_id")
    private String productId;
    
    @Column(name = "volume_serial")
    private String volumeSerial;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
