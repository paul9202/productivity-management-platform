package com.productivityx.controller;

import com.productivityx.dto.dashboard.DashboardDataDTO;
import com.productivityx.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDataDTO> getDashboardData(
            @RequestParam(defaultValue = "TODAY") String range,
            @RequestParam(defaultValue = "ORG") String scopeType,
            @RequestParam(required = false) String scopeId) {
        
        return ResponseEntity.ok(dashboardService.getDashboardData(range, scopeType, scopeId));
    }
}
