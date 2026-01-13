package com.productivityx.repository;

import com.productivityx.model.PolicyAck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PolicyAckRepository extends JpaRepository<PolicyAck, UUID> {
    void deleteByPolicyId(UUID policyId);
}
