package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.ActivityBucket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.UUID;

public interface ActivityBucketRepository extends JpaRepository<ActivityBucket, UUID> {
    boolean existsByDeviceIdAndBucketStartAndBucketMinutes(String deviceId, LocalDateTime bucketStart, Integer bucketMinutes);
}
