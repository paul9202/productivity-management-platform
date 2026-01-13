package com.productivityx.repository;

import com.productivityx.model.DeviceGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface DeviceGroupRepository extends JpaRepository<DeviceGroup, UUID> {
    List<DeviceGroup> findByOrganizationId(UUID organizationId);
}
