package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.RiskEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RiskEventRepository extends JpaRepository<RiskEvent, UUID> {
    boolean existsByTenantIdAndOrgIdAndDeviceIdAndTypeAndDedupKey(UUID tenantId, UUID orgId, String deviceId, String type, String dedupKey);
}
