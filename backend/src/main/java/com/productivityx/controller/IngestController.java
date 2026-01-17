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

    private final IngestService ingestService;

    @PostMapping("/batch")
    public ResponseEntity<IngestResponse> ingestBatch(
            @RequestHeader(value = "X-Device-ID", required = true) String deviceId,
            @RequestBody IngestBatchDTO batch) {
        
        log.debug("Received batch from device {}", deviceId);
        // Add auth check here if not handled by filter (e.g. JWT check)
        
        // Validation: Header vs Body
        // (Assuming deviceId is consistent or checking it)
        
        try {
            IngestResponse response = ingestService.processBatch(deviceId, batch);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid ingest request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Ingest failed", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
