package com.productivityx.repository;

import com.productivityx.model.DeviceRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceRegistryRepository extends JpaRepository<DeviceRegistry, String> {
}
