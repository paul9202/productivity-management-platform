package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "departments")
@Data
public class Department {
    @Id
    private UUID id;

    private String name;

    @Column(name = "manager_id")
    private UUID managerId;
    
    @Column(name = "organization_id")
    private UUID organizationId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Transient field for member count (calculated or fetched separately)
    @Transient
    private int memberCount;
    
    @Transient
    private String managerName; // For UI display

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
