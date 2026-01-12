package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "device_registry")
@Data
public class DeviceRegistry {

    @Id
    @Column(name = "device_id")
    private String deviceId; // urn:focus:device:uuid

    @Column(name = "tenant_id")
    private UUID tenantId;

    private String status;
    
    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;
    
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;
    
    private String fingerprint;
}
