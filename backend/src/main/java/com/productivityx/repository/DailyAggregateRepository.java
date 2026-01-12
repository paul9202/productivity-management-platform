package com.productivityx.repository;

import com.productivityx.model.DailyAggregate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyAggregateRepository extends JpaRepository<DailyAggregate, java.util.UUID> {
    List<DailyAggregate> findByDateBetween(LocalDate from, LocalDate to);
    List<DailyAggregate> findByDeviceIdAndDateBetween(String deviceId, LocalDate from, LocalDate to);
}
