package com.productivityx.model.policy;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "policy_snapshot")
@Data
public class PolicySnapshot {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "policy_id")
    private UUID policyId;

    private Integer version;

    @Column(name = "snapshot_json", columnDefinition = "jsonb")
    private String snapshotJson;

    private String etag;

    @Column(name = "issued_at_ms")
    private Long issuedAtMs;

    @Column(name = "expires_at_ms")
    private Long expiresAtMs;

    @Column(name = "created_at")
    private Long createdAt;
}
