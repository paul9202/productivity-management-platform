package com.productivityx.repository;

import com.productivityx.model.policy.PolicyPack;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PolicyPackRepository extends JpaRepository<PolicyPack, UUID> {
    List<PolicyPack> findByTenantIdAndOrgId(UUID tenantId, UUID orgId);
}
