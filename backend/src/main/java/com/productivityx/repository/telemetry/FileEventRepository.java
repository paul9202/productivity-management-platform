package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.FileEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface FileEventRepository extends JpaRepository<FileEvent, UUID> {
    
    @Query("SELECT f FROM FileEvent f WHERE f.tenantId = :tenantId AND f.orgId = :orgId AND f.deviceId = :deviceId AND f.tsMs >= :minTs AND (f.operation = 'COPY' OR f.operation = 'MODIFY') AND (f.isExternal = true OR f.isUsb = true)")
    List<FileEvent> findRecentExternalOps(UUID tenantId, UUID orgId, String deviceId, Long minTs);

    @Query("SELECT COUNT(f) FROM FileEvent f WHERE f.tenantId = :tenantId AND f.orgId = :orgId AND f.deviceId = :deviceId AND f.tsMs >= :minTs AND (f.operation = 'DELETE' OR f.operation = 'RENAME')")
    long countRecentDestructiveOps(UUID tenantId, UUID orgId, String deviceId, Long minTs);

    @Query("SELECT f FROM FileEvent f WHERE f.tenantId = :tenantId AND f.orgId = :orgId AND f.deviceId = :deviceId AND f.tsMs >= :minTs AND (f.operation = 'DELETE' OR f.operation = 'RENAME')")
    List<FileEvent> findRecentDestructiveOps(UUID tenantId, UUID orgId, String deviceId, Long minTs);
}
