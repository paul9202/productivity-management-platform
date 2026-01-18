package com.productivityx.model.policy;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
@Data
public class AuditLog {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "actor_id")
    private UUID actorId;

    private String action;
    private String target;

    @Column(name = "details_json", columnDefinition = "jsonb")
    private String detailsJson;

    @Column(name = "ts_ms")
    private Long tsMs;
}
