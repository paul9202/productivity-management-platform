package com.productivityx.repository;

import com.productivityx.model.PolicySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PolicySettingsRepository extends JpaRepository<PolicySettings, Integer> {
}
