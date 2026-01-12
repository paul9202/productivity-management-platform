package com.productivityx.controller;

import com.productivityx.model.DailyAggregate;
import com.productivityx.repository.DailyAggregateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final DailyAggregateRepository aggregateRepository;

    @GetMapping("/daily")
    public ResponseEntity<List<DailyAggregate>> getDailyReport(
            @RequestParam(required = false) String deptId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        // MVP: Return all or filter by ID if we had dept logic implemented in the repo
        // For now, returning aggregates by date range
        return ResponseEntity.ok(aggregateRepository.findByDateBetween(from, to));
    }
}
