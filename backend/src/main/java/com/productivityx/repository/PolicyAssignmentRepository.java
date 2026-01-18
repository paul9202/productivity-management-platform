package com.productivityx.repository;

import com.productivityx.model.policy.PolicyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface PolicyAssignmentRepository extends JpaRepository<PolicyAssignment, UUID> {
    @Query("SELECT p FROM PolicyAssignment p WHERE p.tenantId = :tenantId AND p.orgId = :orgId AND p.deviceId = :deviceId AND p.active = true")
    Optional<PolicyAssignment> findActiveByDeviceId(UUID tenantId, UUID orgId, String deviceId);
}
