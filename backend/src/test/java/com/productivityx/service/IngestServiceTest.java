package com.productivityx.service;

import com.productivityx.dto.ingest.IngestBatchDTO;
import com.productivityx.model.Device;
import com.productivityx.model.telemetry.AppUsageEvent;
import com.productivityx.repository.DeviceRepository;
import com.productivityx.repository.telemetry.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IngestServiceTest {

    @Mock private DeviceRepository deviceRepository;
    @Mock private ActivityBucketRepository bucketRepo;
    @Mock private AppUsageEventRepository appRepo;
    @Mock private WebUsageEventRepository webRepo;
    @Mock private FileEventRepository fileRepo;
    @Mock private DeviceHeartbeatRepository heartbeatRepo;
    @Mock private DailyDeviceSummaryRepository dailySummaryRepo;

    @InjectMocks
    private IngestService ingestService;

    private Device device;
    private final String DEVICE_ID = "dev-test-1";

    @BeforeEach
    void setUp() {
        device = new Device();
        device.setDeviceId(DEVICE_ID);
        device.setTenantId(UUID.randomUUID());
        device.setOrgId(UUID.randomUUID());
    }

    @Test
    void processBatch_ShouldProcessAppEvents() {
        // Arrange
        when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(device));
        
        IngestBatchDTO batch = new IngestBatchDTO();
        IngestBatchDTO.AppPayload appEvent = new IngestBatchDTO.AppPayload();
        appEvent.setId(UUID.randomUUID());
        appEvent.setApp_name("TestApp");
        appEvent.setTs_start("2023-01-01T10:00:00Z");
        appEvent.setTs_end("2023-01-01T10:05:00Z");
        batch.setApp_events(List.of(appEvent));

        // Mock filtering: No existing events
        when(appRepo.findAllById(any())).thenReturn(Collections.emptyList());

        // Act
        IngestResponse response = ingestService.processBatch(DEVICE_ID, batch);

        // Assert
        assertEquals(1, response.getProcessed().get("app_events"));
        verify(appRepo, times(1)).saveAll(any());
        verify(dailySummaryRepo, times(0)).upsertStats(any(), any(), anyString(), any(), any(), any(), any(), any(), any()); // No buckets
    }

    @Test
    void processBatch_ShouldFilterDuplicates() {
        // Arrange
        when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(device));
        
        UUID eventId = UUID.randomUUID();
        IngestBatchDTO batch = new IngestBatchDTO();
        IngestBatchDTO.AppPayload appEvent = new IngestBatchDTO.AppPayload();
        appEvent.setId(eventId);
        batch.setApp_events(List.of(appEvent));

        // Mock filtering: Event exists
        AppUsageEvent existing = new AppUsageEvent();
        existing.setId(eventId);
        when(appRepo.findAllById(any())).thenReturn(List.of(existing));

        // Act
        IngestResponse response = ingestService.processBatch(DEVICE_ID, batch);

        // Assert
        assertEquals(1, response.getRejected().get("app_events"));
        verify(appRepo, times(0)).saveAll(any());
    }

    @Test
    void processBatch_ShouldProcessBucketsAndCallBatchInsert() {
        // Arrange
        when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(device));
        when(bucketRepo.saveAllIgnoreConflict(any())).thenReturn(1);
        
        IngestBatchDTO batch = new IngestBatchDTO();
        IngestBatchDTO.BucketPayload bucket = new IngestBatchDTO.BucketPayload();
        bucket.setBucket_start("2023-01-01T10:00:00Z");
        bucket.setBucket_minutes(5);
        bucket.setActive_seconds(300);
        bucket.setIdle_seconds(0);
        batch.setActivity_buckets(List.of(bucket));

        // Act
        IngestResponse response = ingestService.processBatch(DEVICE_ID, batch);

        // Assert
        verify(bucketRepo, times(1)).saveAllIgnoreConflict(any());
        assertEquals(1, response.getProcessed().get("buckets"));
    }
}
