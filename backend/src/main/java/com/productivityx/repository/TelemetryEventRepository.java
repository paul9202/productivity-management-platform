package com.productivityx.repository;

import com.productivityx.model.TelemetryEvent;
import com.productivityx.model.TelemetryEventId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelemetryEventRepository extends JpaRepository<TelemetryEvent, TelemetryEventId> {
    org.springframework.data.domain.Page<TelemetryEvent> findByDeviceIdOrderByTimestampDesc(String deviceId, org.springframework.data.domain.Pageable pageable);
}
