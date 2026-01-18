package com.productivityx.model.policy;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "policy_assignment")
@Data
public class PolicyAssignment {
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

    private Boolean active;
    private Integer priority;

    @Column(name = "created_at")
    private Long createdAt;

    @Column(name = "updated_at")
    private Long updatedAt;
}
