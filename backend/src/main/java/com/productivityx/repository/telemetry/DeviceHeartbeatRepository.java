package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.DeviceHeartbeat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DeviceHeartbeatRepository extends JpaRepository<DeviceHeartbeat, UUID> {
}
