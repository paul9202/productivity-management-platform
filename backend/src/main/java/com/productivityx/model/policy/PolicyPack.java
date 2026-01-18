package com.productivityx.model.policy;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "policy_pack")
@Data
public class PolicyPack {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    private String name;
    private String description;
    
    private String status; // DRAFT, PUBLISHED, ARCHIVED
    
    @Column(name = "published_version")
    private Integer publishedVersion;

    @Column(name = "config_draft", columnDefinition = "jsonb")
    private String configDraft; // JSON string

    @Column(name = "created_at")
    private Long createdAt;

    @Column(name = "updated_at")
    private Long updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;
}
