package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "policy_acks")
@Data
public class PolicyAck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ack_id")
    private UUID id;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;
    
    @Column(name = "version_id", nullable = false)
    private UUID versionId;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "status")
    private String status; // PENDING, APPLIED, FAILED

    @Column(name = "message")
    private String message;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt = LocalDateTime.now();
    
    @Column(name = "synced_at")
    private LocalDateTime syncedAt;
}
