package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.WebUsageEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WebUsageEventRepository extends JpaRepository<WebUsageEvent, UUID> {
}
