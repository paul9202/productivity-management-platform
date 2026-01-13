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
            @RequestBody List<TelemetryBatchRequest> batch,
            jakarta.servlet.http.HttpServletRequest request) {
        
        String deviceId = authentication.getName(); 
        
        // Fallback for Mock/HTTP mode where mTLS isn't populating the Principal
        if (deviceId == null || "anonymousUser".equals(deviceId)) {
            deviceId = request.getHeader("X-Device-ID");
            if (deviceId == null || deviceId.isBlank()) {
                // Try X-Client-Cert-Hash just in case
                deviceId = request.getHeader("X-Client-Cert-Hash");
            }
        }
        
        if (deviceId == null || deviceId.isBlank()) {
            return ResponseEntity.status(401).build();
        }
        
        TelemetryResponse response = telemetryService.ingestBatch(deviceId, batch);
        return ResponseEntity.ok(response);
    }
}
