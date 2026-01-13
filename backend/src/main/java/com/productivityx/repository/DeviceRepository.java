package com.productivityx.repository;

import com.productivityx.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceRepository extends JpaRepository<Device, String> {
    java.util.List<Device> findByGroupId(java.util.UUID groupId);
    java.util.Optional<Device> findByFingerprintHash(String fingerprintHash);
    long countByStatus(String status);
}
