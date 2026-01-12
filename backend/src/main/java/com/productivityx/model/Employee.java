package com.productivityx.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "employees")
@Data
public class Employee {
    @Id
    private String id;
    private String name;
    private String departmentId;
    private String role;
    private String email;
    private String status;
}
