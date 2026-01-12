package com.productivityx.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "departments")
@Data
public class Department {
    @Id
    private UUID id;
    private String name;
    private UUID tenantId;
}
