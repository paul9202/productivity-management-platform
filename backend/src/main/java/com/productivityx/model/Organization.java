package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "organizations")
@Data
public class Organization {
    @Id
    private UUID id;

    private String name;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
    }
}
