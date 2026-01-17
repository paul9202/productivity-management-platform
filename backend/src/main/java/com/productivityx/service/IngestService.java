package com.productivityx.service;

import com.productivityx.dto.ingest.IngestBatchDTO;
import com.productivityx.model.Device;
import com.productivityx.model.telemetry.*;
import com.productivityx.repository.DeviceRepository;
import com.productivityx.repository.telemetry.*;
import com.productivityx.util.IngestHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestService {

    private final DeviceRepository deviceRepository;
    private final ActivityBucketRepository bucketRepo;
    private final AppUsageEventRepository appRepo;
    private final WebUsageEventRepository webRepo;
    private final FileEventRepository fileRepo;
    private final DeviceHeartbeatRepository heartbeatRepo;
    private final DailyDeviceSummaryRepository dailySummaryRepo;

    @Transactional
    public IngestResponse processBatch(String deviceIdStr, IngestBatchDTO batch) {
        Device device = deviceRepository.findById(deviceIdStr)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceIdStr));

        // 1. Basic Validation
        validateBatch(batch);

        IngestResponse response = new IngestResponse();
        UUID batchId = UUID.randomUUID();
        UUID tenantId = device.getTenantId();
        UUID orgId = device.getOrgId() != null ? device.getOrgId() : UUID.fromString("d1111111-1111-1111-1111-111111111111");

        // 2. Heartbeat
        if (batch.getHeartbeat() != null) {
            processHeartbeat(device, batch.getHeartbeat(), tenantId, orgId, batchId);
        } else {
            device.setLastSeenAt(LocalDateTime.now());
            deviceRepository.save(device);
        }

        // 3. Activity Buckets
        if (batch.getActivity_buckets() != null && !batch.getActivity_buckets().isEmpty()) {
            processBuckets(batch.getActivity_buckets(), device, tenantId, orgId, batchId, response);
        }

        // 4. App Events
        if (batch.getApp_events() != null && !batch.getApp_events().isEmpty()) {
            processAppEvents(batch.getApp_events(), device, tenantId, orgId, batchId, response);
        }

        // 5. Web Events
        if (batch.getWeb_events() != null && !batch.getWeb_events().isEmpty()) {
            processWebEvents(batch.getWeb_events(), device, tenantId, orgId, batchId, response);
        }

        // 6. File Events
        if (batch.getFile_events() != null && !batch.getFile_events().isEmpty()) {
            processFileEvents(batch.getFile_events(), device, tenantId, orgId, batchId, response);
        }

        // 7. Aggregation Trigger (Simplistic V1: Update Daily Summary for the dates in this batch)
        updateAggregations(batch, device, tenantId, orgId);

        return response;
    }

    private void validateBatch(IngestBatchDTO batch) {
        // Example validation
        if (batch == null) throw new IllegalArgumentException("Batch cannot be null");
        // Additional checks can be added locally
    }

    private void processHeartbeat(Device device, IngestBatchDTO.HeartbeatPayload hb, UUID tenantId, UUID orgId, UUID batchId) {
        device.setLastSeenAt(LocalDateTime.now());
        device.setLastUploadAt(LocalDateTime.now());
        device.setStatus("ONLINE");
        device.setAgentVersion(hb.getAgentVersion());
        deviceRepository.save(device);

        DeviceHeartbeat dhb = new DeviceHeartbeat();
        dhb.setId(UUID.randomUUID());
        dhb.setTenantId(tenantId);
        dhb.setOrgId(orgId);
        dhb.setDeviceId(device.getDeviceId());
        dhb.setTs(LocalDateTime.now());
        dhb.setStatus(hb.getStatus());
        dhb.setAgentVersion(hb.getAgentVersion());
        dhb.setQueueDepth(hb.getQueueDepth());
        dhb.setUploadErrorCount(hb.getUploadErrorCount());
        dhb.setIngestBatchId(batchId);
        heartbeatRepo.save(dhb);
    }

    private void processBuckets(List<IngestBatchDTO.BucketPayload> buckets, Device device, UUID tenantId, UUID orgId, UUID batchId, IngestResponse response) {
        // Generate IDs hash for idempotency if not provided (Buckets don't have ID in DTO usually, so we rely on unique constraint)
        // Here we assume client acts correctly or we can't easily dedup without query. 
        // Strategy: Try saveAll, catch exception? Or query check. 
        // Given complexity, let's query check.
        // Complex Constraint: device + start + minutes.
        
        List<ActivityBucket> toSave = new ArrayList<>();
        for (IngestBatchDTO.BucketPayload b : buckets) {
            LocalDateTime start = IngestHelper.parseIso(b.getBucket_start());
            if (bucketRepo.existsByDeviceIdAndBucketStartAndBucketMinutes(device.getDeviceId(), start, b.getBucket_minutes())) {
                response.incrementRejected("buckets");
            } else {
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
                toSave.add(bucket);
            }
        }
        if (!toSave.isEmpty()) {
            bucketRepo.saveAll(toSave);
            response.getProcessed().put("buckets", response.getProcessed().getOrDefault("buckets", 0) + toSave.size());
        }
    }

    private void processAppEvents(List<IngestBatchDTO.AppPayload> events, Device device, UUID tenantId, UUID orgId, UUID batchId, IngestResponse response) {
        // Read-then-Write
        Set<UUID> ids = events.stream().map(IngestBatchDTO.AppPayload::getId).collect(Collectors.toSet());
        Set<UUID> existing = new HashSet<>(appRepo.findAllById(ids).stream().map(AppUsageEvent::getId).toList());

        List<AppUsageEvent> newEvents = events.stream()
                .filter(e -> !existing.contains(e.getId()))
                .map(e -> {
                    AppUsageEvent evt = new AppUsageEvent();
                    evt.setId(e.getId());
                    evt.setTenantId(tenantId);
                    evt.setOrgId(orgId);
                    evt.setDeviceId(device.getDeviceId());
                    evt.setTsStart(IngestHelper.parseIso(e.getTs_start()));
                    evt.setTsEnd(IngestHelper.parseIso(e.getTs_end()));
                    evt.setAppName(e.getApp_name());
                    evt.setProcessName(e.getProcess_name());
                    evt.setIngestBatchId(batchId);
                    return evt;
                }).toList();

        if (!newEvents.isEmpty()) {
            appRepo.saveAll(newEvents);
            response.getProcessed().put("app_events", response.getProcessed().getOrDefault("app_events", 0) + newEvents.size());
        }
        int rejected = events.size() - newEvents.size();
        if (rejected > 0) response.getRejected().put("app_events", rejected);
    }

    private void processWebEvents(List<IngestBatchDTO.WebPayload> events, Device device, UUID tenantId, UUID orgId, UUID batchId, IngestResponse response) {
        Set<UUID> ids = events.stream().map(IngestBatchDTO.WebPayload::getId).collect(Collectors.toSet());
        Set<UUID> existing = new HashSet<>(webRepo.findAllById(ids).stream().map(WebUsageEvent::getId).toList());

        List<WebUsageEvent> newEvents = events.stream()
                .filter(e -> !existing.contains(e.getId()))
                .map(e -> {
                    WebUsageEvent evt = new WebUsageEvent();
                    evt.setId(e.getId());
                    evt.setTenantId(tenantId);
                    evt.setOrgId(orgId);
                    evt.setDeviceId(device.getDeviceId());
                    evt.setTsStart(IngestHelper.parseIso(e.getTs_start()));
                    evt.setTsEnd(IngestHelper.parseIso(e.getTs_end()));
                    evt.setDomain(e.getDomain());
                    evt.setIngestBatchId(batchId);
                    return evt;
                }).toList();

        if (!newEvents.isEmpty()) {
            webRepo.saveAll(newEvents);
            response.getProcessed().put("web_events", response.getProcessed().getOrDefault("web_events", 0) + newEvents.size());
        }
        int rejected = events.size() - newEvents.size();
        if (rejected > 0) response.getRejected().put("web_events", rejected);
    }

    private void processFileEvents(List<IngestBatchDTO.FilePayload> events, Device device, UUID tenantId, UUID orgId, UUID batchId, IngestResponse response) {
        Set<UUID> ids = events.stream().map(IngestBatchDTO.FilePayload::getId).collect(Collectors.toSet());
        Set<UUID> existing = new HashSet<>(fileRepo.findAllById(ids).stream().map(FileEvent::getId).toList());

        List<FileEvent> newEvents = events.stream()
                .filter(e -> !existing.contains(e.getId()))
                .map(e -> {
                    FileEvent evt = new FileEvent();
                    evt.setId(e.getId());
                    evt.setTenantId(tenantId);
                    evt.setOrgId(orgId);
                    evt.setDeviceId(device.getDeviceId());
                    evt.setTs(IngestHelper.parseIso(e.getTimestamp()));
                    evt.setOperation(e.getOperation());
                    // Mapping file path to path_hash per privacy requirement
                    evt.setPathHash(IngestHelper.hash(e.getFile_path())); 
                    evt.setFileExt(e.getFile_name().contains(".") ? e.getFile_name().substring(e.getFile_name().lastIndexOf(".") + 1) : ""); 
                    evt.setSizeBytes(e.getSize_bytes());
                    evt.setIsUsb(e.is_usb());
                    evt.setIngestBatchId(batchId);
                    return evt;
                }).toList();

        if (!newEvents.isEmpty()) {
            fileRepo.saveAll(newEvents);
            response.getProcessed().put("file_events", response.getProcessed().getOrDefault("file_events", 0) + newEvents.size());
        }
        int rejected = events.size() - newEvents.size();
        if (rejected > 0) response.getRejected().put("file_events", rejected);
    }

    private void updateAggregations(IngestBatchDTO batch, Device device, UUID tenantId, UUID orgId) {
        if (batch.getActivity_buckets() == null) return;
        
        // Simple Aggregation: Sum active/idle per day
        Map<LocalDate, AggStats> statsByDay = new HashMap<>();

        for (IngestBatchDTO.BucketPayload b : batch.getActivity_buckets()) {
            LocalDateTime start = IngestHelper.parseIso(b.getBucket_start());
            LocalDate date = start.toLocalDate();
            statsByDay.computeIfAbsent(date, k -> new AggStats()).active += (b.getActive_seconds() != null ? b.getActive_seconds() : 0);
            statsByDay.computeIfAbsent(date, k -> new AggStats()).idle += (b.getIdle_seconds() != null ? b.getIdle_seconds() : 0);
        }

        statsByDay.forEach((date, stats) -> {
            try {
                // Upsert
                dailySummaryRepo.upsertStats(tenantId, orgId, device.getDeviceId(), date, stats.active, stats.idle, "[]", "[]", "{}");
            } catch (Exception e) {
                log.error("Failed to update daily summary for device {} on {}", device.getDeviceId(), date, e);
            }
        });
    }

    private static class AggStats {
        int active = 0;
        int idle = 0;
    }
}
