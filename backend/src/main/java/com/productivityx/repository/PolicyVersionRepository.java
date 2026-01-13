package com.productivityx.repository;

import com.productivityx.model.PolicyVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PolicyVersionRepository extends JpaRepository<PolicyVersion, UUID> {
    List<PolicyVersion> findByPolicyIdOrderByVersionDesc(UUID policyId);
    Optional<PolicyVersion> findTopByPolicyIdOrderByVersionDesc(UUID policyId);
}
