package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_certificates")
@Data
public class DeviceCertificate {
    @Id
    private String thumbprint;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;
    
    @Column(name = "serial_number")
    private String serialNumber;
    
    private String issuer;
    
    public boolean isValid() {
        return revokedAt == null && expiresAt.isAfter(LocalDateTime.now());
    }
}
