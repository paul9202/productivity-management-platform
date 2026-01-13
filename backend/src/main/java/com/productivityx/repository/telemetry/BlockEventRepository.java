package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.BlockEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BlockEventRepository extends JpaRepository<BlockEvent, UUID> {
}
