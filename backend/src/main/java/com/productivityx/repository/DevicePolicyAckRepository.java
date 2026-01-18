package com.productivityx.repository;

import com.productivityx.model.policy.DevicePolicyAck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DevicePolicyAckRepository extends JpaRepository<DevicePolicyAck, UUID> {
    List<DevicePolicyAck> findByDeviceIdOrderByCreatedAtDesc(String deviceId);
}
