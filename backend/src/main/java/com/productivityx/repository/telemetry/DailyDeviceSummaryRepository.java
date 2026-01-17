package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.DailyDeviceSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface DailyDeviceSummaryRepository extends JpaRepository<DailyDeviceSummary, UUID> {
    
    Optional<DailyDeviceSummary> findByDeviceIdAndDate(String deviceId, LocalDate date);

    @Modifying
    @Query(value = "INSERT INTO daily_device_summary (id, tenant_id, org_id, device_id, date, active_seconds, idle_seconds, top_apps, top_domains, risk_counters) " +
            "VALUES (gen_random_uuid(), :tenantId, :orgId, :deviceId, :date, :active, :idle, " +
            "CAST(COALESCE(NULLIF(:apps, ''), '[]') AS jsonb), " +
            "CAST(COALESCE(NULLIF(:domains, ''), '[]') AS jsonb), " +
            "CAST(COALESCE(NULLIF(:risks, ''), '{}') AS jsonb)) " +
            "ON CONFLICT (tenant_id, org_id, device_id, date) DO UPDATE SET " +
            "active_seconds = daily_device_summary.active_seconds + :active, " +
            "idle_seconds = daily_device_summary.idle_seconds + :idle, " +
            "updated_at = NOW()", nativeQuery = true)
    void upsertStats(@Param("tenantId") UUID tenantId, @Param("orgId") UUID orgId, 
                     @Param("deviceId") String deviceId, @Param("date") LocalDate date, 
                     @Param("active") Integer active, @Param("idle") Integer idle,
                     @Param("apps") String apps, @Param("domains") String domains, @Param("risks") String risks);
}
