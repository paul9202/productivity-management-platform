package com.productivityx.model.policy;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "device_policy_ack")
@Data
public class DevicePolicyAck {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "device_id")
    private String deviceId;

    @Column(name = "policy_id")
    private UUID policyId;

    private Integer version;
    private String status; // APPLIED, FAILED, STALE
    private String reason;

    @Column(name = "applied_at_ms")
    private Long appliedAtMs;

    @Column(name = "agent_version")
    private String agentVersion;

    @Column(name = "client_etag")
    private String clientEtag;

    @Column(name = "created_at")
    private Long createdAt;
}
