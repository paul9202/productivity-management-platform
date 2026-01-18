package com.productivityx.service;

import com.productivityx.dto.policy.PolicyPackDTO;
import com.productivityx.dto.policy.PolicySnapshotDTO;
import com.productivityx.model.policy.*;
import com.productivityx.model.telemetry.FileEvent;
import com.productivityx.model.telemetry.UsbEvent;
import com.productivityx.repository.*;
import com.productivityx.repository.telemetry.FileEventRepository;
import com.productivityx.repository.telemetry.RiskEventRepository;
import com.productivityx.repository.telemetry.UsbEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PolicyAndRiskTest {

    @Mock private PolicyPackRepository policyRepo;
    @Mock private PolicySnapshotRepository snapshotRepo;
    @Mock private PolicyAssignmentRepository assignmentRepo;
    @Mock private DevicePolicyAckRepository ackRepo;
    @Mock private DeviceRepository deviceRepo;
    @Mock private AuditLogRepository auditRepo;
    @Mock private RiskEventRepository riskRepo;
    @Mock private UsbEventRepository usbRepo;
    @Mock private FileEventRepository fileRepo;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks private PolicyService policyService;
    @InjectMocks private RiskService riskService;

    private final UUID tenantId = UUID.randomUUID();
    private final UUID orgId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final String deviceId = "device-123";

    @Test
    public void testPolicyPublish() {
        UUID policyId = UUID.randomUUID();
        PolicyPack pack = new PolicyPack();
        pack.setId(policyId);
        pack.setTenantId(tenantId);
        pack.setOrgId(orgId);
        pack.setStatus("DRAFT");
        pack.setPublishedVersion(0);
        pack.setConfigDraft("{\"foo\":\"bar\"}");

        when(policyRepo.findById(policyId)).thenReturn(Optional.of(pack));
        when(snapshotRepo.save(any(PolicySnapshot.class))).thenAnswer(i -> i.getArguments()[0]);

        PolicySnapshotDTO result = policyService.publish(tenantId, orgId, userId, policyId);

        assertNotNull(result);
        assertEquals(1, result.getVersion());
        assertNotNull(result.getEtag());
        assertEquals("{\"foo\":\"bar\"}", result.getSnapshotJson());
        
        verify(policyRepo).save(pack);
        assertEquals("PUBLISHED", pack.getStatus());
        assertEquals(1, pack.getPublishedVersion());
    }

    @Test
    public void testGetSnapshotWithEtag() {
        PolicyAssignment assignment = new PolicyAssignment();
        assignment.setPolicyId(UUID.randomUUID());
        assignment.setActive(true);

        PolicyPack pack = new PolicyPack();
        pack.setId(assignment.getPolicyId());
        pack.setPublishedVersion(2);

        PolicySnapshot snapshot = new PolicySnapshot();
        snapshot.setVersion(2);
        snapshot.setSnapshotJson("{}");
        snapshot.setEtag("hash123");

        com.productivityx.model.Device device = new com.productivityx.model.Device();
        device.setDeviceId(deviceId);
        device.setTenantId(tenantId);
        device.setOrgId(orgId);

        when(deviceRepo.findById(deviceId)).thenReturn(Optional.of(device));
        when(assignmentRepo.findActiveByDeviceId(tenantId, orgId, deviceId)).thenReturn(Optional.of(assignment));
        when(policyRepo.findById(assignment.getPolicyId())).thenReturn(Optional.of(pack));
        when(snapshotRepo.findByPolicyIdAndVersion(pack.getId(), 2)).thenReturn(Optional.of(snapshot));

        Optional<PolicySnapshotDTO> result = policyService.getSnapshotForDevice(deviceId, "hash123");
        
        assertTrue(result.isPresent());
        assertEquals("hash123", result.get().getEtag());
        // Controller layer handles the 304 transformation based on logic
    }
    
    @Test
    public void testRiskR1Detection() {
        UsbEvent usb = new UsbEvent();
        usb.setId(UUID.randomUUID());
        usb.setDriveLetter("E:");
        
        FileEvent file = new FileEvent();
        file.setId(UUID.randomUUID());
        
        com.productivityx.model.Device device = new com.productivityx.model.Device();
        device.setDeviceId(deviceId);
        device.setTenantId(tenantId);
        device.setOrgId(orgId);

        when(deviceRepo.findById(deviceId)).thenReturn(Optional.of(device));
        when(usbRepo.findRecentInserts(eq(tenantId), eq(orgId), eq(deviceId), anyLong()))
            .thenReturn(List.of(usb));
        when(fileRepo.findRecentExternalOps(eq(tenantId), eq(orgId), eq(deviceId), anyLong()))
            .thenReturn(List.of(file));
        
        riskService.checkForRisks(deviceId, System.currentTimeMillis());
        
        verify(riskRepo, times(1)).save(any(com.productivityx.model.telemetry.RiskEvent.class));
    }
}
