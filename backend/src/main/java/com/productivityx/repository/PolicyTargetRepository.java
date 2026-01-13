package com.productivityx.repository;

import com.productivityx.model.PolicyTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PolicyTargetRepository extends JpaRepository<PolicyTarget, UUID> {
    void deleteByPolicyId(UUID policyId);
}
