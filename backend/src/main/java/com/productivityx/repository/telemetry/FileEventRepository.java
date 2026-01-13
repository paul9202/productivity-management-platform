package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.FileEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface FileEventRepository extends JpaRepository<FileEvent, UUID> {
}
