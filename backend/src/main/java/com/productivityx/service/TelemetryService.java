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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
}
