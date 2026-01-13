package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.AppUsageEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AppUsageEventRepository extends JpaRepository<AppUsageEvent, UUID> {
}
