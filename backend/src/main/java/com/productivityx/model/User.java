package com.productivityx.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    private UUID id;
    private String username;
    private String passwordHash;
    private String role;
    private UUID tenantId;
    private String name;
    private String email;
    
    @jakarta.persistence.Column(name = "department_id")
    private UUID departmentId;
    
    private String status; // ACTIVE, INACTIVE, etc.
}
