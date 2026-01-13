package com.productivityx.service;

import com.productivityx.dto.TelemetryBatchRequest;
import com.productivityx.dto.TelemetryResponse;
import com.productivityx.model.Device;
import com.productivityx.model.TelemetryEvent;
import com.productivityx.repository.DeviceRepository;
import com.productivityx.repository.TelemetryEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.productivityx.dto.telemetry.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetryService {

    private final TelemetryEventRepository telemetryRepository;
    private final DeviceRepository deviceRepository;

    @Transactional
    public TelemetryResponse ingestBatch(String deviceId, List<TelemetryBatchRequest> batch) {
        int accepted = 0;
        int duplicates = 0;
        int rejected = 0;
        List<String> errors = new ArrayList<>();

        // Ensure device is registered or auto-register (for MVP auto-register)
        ensureDeviceRegistered(deviceId);

        for (TelemetryBatchRequest item : batch) {
            try {
                // Check if exists first to avoid exception overhead if possible, 
                // but for true concurrency/atomic, saving and catching constraint violation is safer.
                // However, composite key check is fast.
                /* 
                   We will try to save. If it fails due to unique constraint, we count as duplicate.
                */
                TelemetryEvent event = new TelemetryEvent();
                event.setDeviceId(deviceId);
                event.setEventId(item.getEventId());
                event.setTimestamp(item.getTimestamp().toLocalDateTime()); // Convert Offset to Local (strips offset, assuming UTC)
                event.setFocusScore(item.getFocusScore());
                event.setAwaySeconds(item.getAwaySeconds());
                event.setIdleSeconds(item.getIdleSeconds());
                // Serialize appDurations to JSON if needed, or store simply. 
                // For MVP, we'll just set it to null or perform simple toString if necessary for data field.
                event.setData(item.getAppDurations() != null ? item.getAppDurations().toString() : "{}");

                if (telemetryRepository.existsById(new com.productivityx.model.TelemetryEventId(deviceId, item.getEventId()))) {
                    duplicates++;
                } else {
                    telemetryRepository.save(event);
                    accepted++;
                }

            } catch (Exception e) {
                log.error("Error ingesting event {}", item.getEventId(), e);
                rejected++;
                errors.add("Event " + item.getEventId() + ": " + e.getMessage());
            }
        }

        return TelemetryResponse.builder()
                .accepted(accepted)
                .duplicates(duplicates)
                .rejected(rejected)
                .errors(errors)
                .build();
    }

    private void ensureDeviceRegistered(String deviceId) {
        if (!deviceRepository.existsById(deviceId)) {
            Device device = new Device();
            // In V3 Schema device_id is a VARCHAR, so we can use the string directly
            device.setDeviceId(deviceId); 
            device.setName("Auto-Registered Device"); // Required field
            device.setStatus("ACTIVE");
            device.setEnrolledAt(LocalDateTime.now());
            device.setLastSeenAt(LocalDateTime.now());
            // Tenant/Group would need assignment logic, setting null or defaults for now
            deviceRepository.save(device);
        } else {
            // Update last seen
            deviceRepository.findById(deviceId).ifPresent(d -> {
                d.setLastSeenAt(LocalDateTime.now());
                deviceRepository.save(d);
            });
        }
    }
    public List<TelemetryEvent> getEvents(String deviceId, int page, int size) {
        return telemetryRepository.findByDeviceIdOrderByTimestampDesc(deviceId, org.springframework.data.domain.PageRequest.of(page, size)).getContent();
    }

    // --- MOCK IMPLEMENTATION FOR ADVANCED TELEMETRY ---
    
    public TelemetrySummaryDTO getSummary(String deviceId, String from, String to) {
        List<TimelineBucketDTO> buckets = getTimeline(deviceId, from, to); // Regenerates data for consistency
        long totalActive = buckets.stream().mapToLong(TimelineBucketDTO::getActiveSeconds).sum();
        long totalIdle = buckets.stream().mapToLong(TimelineBucketDTO::getIdleSeconds).sum();
        long totalLocked = buckets.stream().mapToLong(TimelineBucketDTO::getLockedSeconds).sum();

        // Simple aggregation logic
        List<TelemetrySummaryDTO.TopItemDTO> topApps = new ArrayList<>();
        topApps.add(TelemetrySummaryDTO.TopItemDTO.builder().name("VS Code").durationSeconds(totalActive / 2).category("Dev").build());
        topApps.add(TelemetrySummaryDTO.TopItemDTO.builder().name("Chrome").durationSeconds(totalActive / 3).category("Web").build());

        return TelemetrySummaryDTO.builder()
                .deviceId(deviceId)
                .userId("mock-user")
                .from(from != null ? from : LocalDateTime.now().minusHours(24).toString())
                .to(to != null ? to : LocalDateTime.now().toString())
                .totalActiveSeconds(totalActive)
                .totalIdleSeconds(totalIdle)
                .totalLockedSeconds(totalLocked)
                .productivityScore(75)
                .riskScore(20)
                .riskCounters(TelemetrySummaryDTO.RiskCountersDTO.builder()
                        .blocks(2).usbEvents(1).sensitiveKeywords(0).anomalies(1).build())
                .topApps(topApps)
                .topDomains(List.of())
                .status(TelemetrySummaryDTO.StatusDTO.builder()
                        .online(true)
                        .lastSeenAt(LocalDateTime.now().toString())
                        .agentVersion("1.0.0")
                        .policyVersion("v1")
                        .build())
                .build();
    }

    public List<TimelineBucketDTO> getTimeline(String deviceId, String from, String to) {
        // Generate 24h of buckets
        List<TimelineBucketDTO> buckets = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusHours(24);
        
        LocalDateTime cursor = start;
        Random rand = new Random();
        
        while (cursor.isBefore(now)) {
            int active = rand.nextInt(300);
            int idle = rand.nextInt(300 - active);
            int locked = 300 - active - idle;
            
            buckets.add(TimelineBucketDTO.builder()
                    .startTime(cursor.toString())
                    .endTime(cursor.plusMinutes(5).toString())
                    .activeSeconds(active)
                    .idleSeconds(idle)
                    .lockedSeconds(locked)
                    .topApp(active > 150 ? "VS Code" : "Chrome")
                    .topDomain("google.com")
                    .eventCounts(Map.of("block", 0, "file", 0))
                    .build());
            
            cursor = cursor.plusMinutes(5);
        }
        return buckets;
    }

    public List<AdvancedTelemetryEventDTO> getAdvancedEvents(String deviceId, String type, String from, String to) {
        List<AdvancedTelemetryEventDTO> events = new ArrayList<>();
        // Generate some sample events
        events.add(AdvancedTelemetryEventDTO.builder()
                .id(UUID.randomUUID().toString())
                .deviceId(deviceId)
                .userId("user-1")
                .timestamp(LocalDateTime.now().minusMinutes(10).toString())
                .type("APP")
                .metadata(Map.of("appName", "VS Code", "durationSeconds", 600, "category", "Dev"))
                .build());
                
        events.add(AdvancedTelemetryEventDTO.builder()
                .id(UUID.randomUUID().toString())
                .deviceId(deviceId)
                .userId("user-1")
                .timestamp(LocalDateTime.now().minusMinutes(25).toString())
                .type("WEB")
                .metadata(Map.of("domain", "github.com", "url", "https://github.com", "category", "Dev", "title", "GitHub"))
                .build());

         if ("FILE".equals(type) || type == null) {
            events.add(AdvancedTelemetryEventDTO.builder()
                .id(UUID.randomUUID().toString())
                .deviceId(deviceId)
                .userId("user-1")
                .timestamp(LocalDateTime.now().minusMinutes(45).toString())
                .type("FILE")
                .metadata(Map.of("operation", "COPY", "filePath", "E:\\data.zip", "isUsb", true, "fileSize", 102400))
                .build());
         }

        if (type != null) {
            return events.stream().filter(e -> e.getType().equals(type)).collect(Collectors.toList());
        }
        return events;
    }
}
