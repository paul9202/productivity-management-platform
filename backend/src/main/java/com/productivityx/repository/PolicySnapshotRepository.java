package com.productivityx.repository;

import com.productivityx.model.policy.PolicySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PolicySnapshotRepository extends JpaRepository<PolicySnapshot, UUID> {
    Optional<PolicySnapshot> findByPolicyIdAndVersion(UUID policyId, Integer version);
}
