package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "devices")
@Data
public class Device {

    @Id
    @Column(name = "device_id")
    private String deviceId; // urn:focus:device:uuid

    @Column(name = "name")
    private String name;

    @Column(name = "group_id")
    private UUID groupId;

    @Column(name = "tenant_id")
    private UUID tenantId; // organization_id in V3 logic

    private String status;

    private String version;
    
    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;
    
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;
    
    @Column(name = "fingerprint_hash")
    private String fingerprintHash;
    
    @Column(name = "cert_thumbprint")
    private String certThumbprint;
    
    @Column(name = "agent_version")
    private String agentVersion;
}
