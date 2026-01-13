package com.productivityx.controller;

import com.productivityx.dto.ingest.IngestBatchDTO;
import com.productivityx.service.IngestResponse;
import com.productivityx.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ingest")
@RequiredArgsConstructor
@Slf4j
public class IngestController {

    private final TelemetryService telemetryService;

    @PostMapping("/batch")
    public ResponseEntity<IngestResponse> ingestBatch(
            @RequestHeader(value = "X-Device-ID", required = true) String deviceId,
            @RequestBody IngestBatchDTO batch) {
        
        log.debug("Received batch from device {}", deviceId);
        IngestResponse response = telemetryService.processIngestBatch(deviceId, batch);
        return ResponseEntity.ok(response);
    }
}
