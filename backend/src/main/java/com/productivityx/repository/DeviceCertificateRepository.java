package com.productivityx.repository;

import com.productivityx.model.DeviceCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DeviceCertificateRepository extends JpaRepository<DeviceCertificate, String> {
    Optional<DeviceCertificate> findByDeviceId(String deviceId);
}
