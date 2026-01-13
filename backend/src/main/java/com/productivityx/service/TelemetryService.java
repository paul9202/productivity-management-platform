package com.productivityx.service;

import com.productivityx.dto.ingest.IngestBatchDTO;
import com.productivityx.model.Device;
import com.productivityx.model.telemetry.*;
import com.productivityx.repository.*;
import com.productivityx.repository.telemetry.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetryService {

    private final DeviceRepository deviceRepository;
    private final ActivityBucketRepository activityBucketRepository;
    private final AppUsageEventRepository appUsageEventRepository;
    private final WebUsageEventRepository webUsageEventRepository;
    private final FileEventRepository fileEventRepository;
    private final BlockEventRepository blockEventRepository;
    private final DeviceHeartbeatRepository deviceHeartbeatRepository;

    @Transactional
    public IngestResponse processIngestBatch(String deviceIdStr, IngestBatchDTO batch) {
        Device device = deviceRepository.findById(deviceIdStr)
                .orElseThrow(() -> new RuntimeException("Device not found: " + deviceIdStr));

        UUID tenantId = device.getTenantId();
        UUID orgId = device.getOrgId();
        if (orgId == null) orgId = UUID.fromString("d1111111-1111-1111-1111-111111111111"); // Fallback

        IngestResponse response = new IngestResponse();
        UUID batchId = UUID.randomUUID();

        // 1. Process Heartbeat & Update Device
        if (batch.getHeartbeat() != null) {
            updateDeviceStatus(device, batch.getHeartbeat());
            
            DeviceHeartbeat hb = new DeviceHeartbeat();
            hb.setId(UUID.randomUUID()); 
            hb.setTenantId(tenantId);
            hb.setOrgId(orgId);
            hb.setDeviceId(device.getDeviceId());
            hb.setTs(LocalDateTime.now());
            hb.setStatus(batch.getHeartbeat().getStatus());
            hb.setAgentVersion(batch.getHeartbeat().getAgentVersion());
            hb.setQueueDepth(batch.getHeartbeat().getQueueDepth());
            hb.setUploadErrorCount(batch.getHeartbeat().getUploadErrorCount());
            hb.setIngestBatchId(batchId);
            deviceHeartbeatRepository.save(hb);
        } else {
             // Implicit "Online" if sending events? Or just update last seen
             device.setLastSeenAt(LocalDateTime.now());
             device.setLastUploadAt(LocalDateTime.now());
             device.setStatus("ONLINE"); // Infer online
             deviceRepository.save(device);
        }

        // 2. Process Activity Buckets
        if (batch.getActivity_buckets() != null) {
            for (IngestBatchDTO.BucketPayload b : batch.getActivity_buckets()) {
                LocalDateTime start = parseIso(b.getBucket_start());
                // Idempotency check handled by DB Constraint (Unique device, time, minutes)
                // We use ON CONFLICT DO NOTHING (via separate native query or try-catch if JPA)
                // For simplicity in JPA: Check existence first or handle exception? 
                // Best practice for bulk is usually native SQL or JDBC batch. 
                // Given the requirement "INSERT ON CONFLICT DO NOTHING", let's try to save and check existence.
                
                boolean exists = activityBucketRepository.existsByDeviceIdAndBucketStartAndBucketMinutes(
                        device.getDeviceId(), start, b.getBucket_minutes());
                
                if (!exists) {
                    ActivityBucket bucket = new ActivityBucket();
                    bucket.setId(UUID.randomUUID());
                    bucket.setTenantId(tenantId);
                    bucket.setOrgId(orgId);
                    bucket.setDeviceId(device.getDeviceId());
                    bucket.setBucketStart(start);
                    bucket.setBucketMinutes(b.getBucket_minutes());
                    bucket.setActiveSeconds(b.getActive_seconds());
                    bucket.setIdleSeconds(b.getIdle_seconds());
                    bucket.setAvgFocusScore(b.getAvg_focus_score());
                    bucket.setIngestBatchId(batchId);
                    activityBucketRepository.save(bucket);
                    response.incrementProcessed("buckets");
                } else {
                    response.incrementRejected("buckets");
                }
            }
        }

        // 3. Process Events (App)
        if (batch.getApp_events() != null) {
            for (IngestBatchDTO.AppPayload e : batch.getApp_events()) {
                if (appUsageEventRepository.existsById(e.getId())) {
                    response.incrementRejected("app_events");
                    continue;
                }
                AppUsageEvent evt = new AppUsageEvent();
                evt.setId(e.getId());
                evt.setTenantId(tenantId);
                evt.setOrgId(orgId);
                evt.setDeviceId(device.getDeviceId());
                evt.setTsStart(parseIso(e.getTs_start()));
                evt.setTsEnd(parseIso(e.getTs_end()));
                evt.setAppName(e.getApp_name());
                evt.setProcessName(e.getProcess_name());
                evt.setIngestBatchId(batchId);
                appUsageEventRepository.save(evt);
                response.incrementProcessed("app_events");
            }
        }

        // 4. Process Events (Web)
        if (batch.getWeb_events() != null) {
            for (IngestBatchDTO.WebPayload e : batch.getWeb_events()) {
                if (webUsageEventRepository.existsById(e.getId())) {
                    response.incrementRejected("web_events");
                    continue;
                }
                WebUsageEvent evt = new WebUsageEvent();
                evt.setId(e.getId());
                evt.setTenantId(tenantId);
                evt.setOrgId(orgId);
                evt.setDeviceId(device.getDeviceId());
                evt.setTsStart(parseIso(e.getTs_start()));
                evt.setTsEnd(parseIso(e.getTs_end()));
                evt.setDomain(e.getDomain());
                evt.setIngestBatchId(batchId);
                webUsageEventRepository.save(evt);
                response.incrementProcessed("web_events");
            }
        }

        return response;
    }

    private void updateDeviceStatus(Device device, IngestBatchDTO.HeartbeatPayload hb) {
        device.setLastSeenAt(LocalDateTime.now());
        device.setLastUploadAt(LocalDateTime.now());
        device.setStatus("ONLINE"); // Heartbeat implies online
        device.setAgentVersion(hb.getAgentVersion());
        // device.setQueueDepth(hb.getQueueDepth()); // If we had this col on Device
        deviceRepository.save(device);
    }
    
    private LocalDateTime parseIso(String iso) {
        if (iso == null) return LocalDateTime.now();
        // Assuming Input is UTC ISO
        try {
            return LocalDateTime.ofInstant(Instant.parse(iso), ZoneId.of("UTC"));
        } catch (Exception e) {
            log.error("Failed to parse date: " + iso);
            return LocalDateTime.now();
        }
    }
}
