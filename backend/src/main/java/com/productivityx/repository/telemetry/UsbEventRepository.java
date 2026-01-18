package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.UsbEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface UsbEventRepository extends JpaRepository<UsbEvent, UUID> {
    @Query("SELECT u FROM UsbEvent u WHERE u.tenantId = :tenantId AND u.orgId = :orgId AND u.deviceId = :deviceId AND u.action = 'INSERT' AND u.tsMs >= :minTs")
    List<UsbEvent> findRecentInserts(UUID tenantId, UUID orgId, String deviceId, Long minTs);
}
