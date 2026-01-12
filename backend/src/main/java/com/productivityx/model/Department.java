package com.productivityx.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "departments")
@Data
public class Department {
    @Id
    private String id;
    private String name;
    private String tenantId;
}
