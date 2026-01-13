package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "enrollment_tokens")
@Data
public class EnrollmentToken {
    @Id
    private UUID id;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Transient
    private String token; // Not stored, used for transmission only

    @Column(nullable = false)
    private String type; // BOOTSTRAP, REGCODE

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "used_count")
    private Integer usedCount = 0;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "scope_tenant_id", nullable = false)
    private UUID scopeTenantId;

    @Column(name = "scope_org_id")
    private UUID scopeOrgId;
    
    @Column(name = "scope_group_id")
    private UUID scopeGroupId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public boolean isValid() {
        return revokedAt == null && 
               expiresAt.isAfter(LocalDateTime.now()) && 
               usedCount < maxUses;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
