package com.productivityx.controller;

import com.productivityx.dto.TelemetryBatchRequest;
import com.productivityx.dto.TelemetryResponse;
import com.productivityx.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final TelemetryService telemetryService;

    @PostMapping("/focus/batch")
    public ResponseEntity<TelemetryResponse> ingestBatch(
            Authentication authentication,
            @RequestBody List<TelemetryBatchRequest> batch) {
        
        String deviceId = authentication.getName(); // Extracted from mTLS/Header by SecurityConfig
        
        TelemetryResponse response = telemetryService.ingestBatch(deviceId, batch);
        return ResponseEntity.ok(response);
    }
}
