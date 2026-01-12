package com.productivityx.repository;

import com.productivityx.model.AlertEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertEventRepository extends JpaRepository<AlertEvent, String> {
}
