package com.productivityx.model.telemetry;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "risk_event")
@Data
public class RiskEvent {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "device_id")
    private String deviceId;

    private String severity; // LOW, MED, HIGH
    private String type; // R1_USB_EXFIL, R2_MASS_DELETE_RENAME

    @Column(name = "window_start_ms")
    private Long windowStartMs;

    @Column(name = "window_end_ms")
    private Long windowEndMs;

    @Column(name = "evidence_json", columnDefinition = "jsonb")
    private String evidenceJson;

    @Column(name = "dedup_key")
    private String dedupKey;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
