package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "policy_targets")
@Data
public class PolicyTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "target_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @Column(name = "target_type", nullable = false)
    private String targetType; // USER, DEPARTMENT, DEVICE_GROUP, TENANT

    @Column(name = "target_value", nullable = false)
    private UUID targetValue; // ID of the User, Dept, Group, etc.

    @Column(name = "priority")
    private Integer priority = 0; // For conflict resolution (higher wins)
}
