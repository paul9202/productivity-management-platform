package com.productivityx.service;

import com.productivityx.model.Device;
import com.productivityx.model.telemetry.FileEvent;
import com.productivityx.model.telemetry.RiskEvent;
import com.productivityx.model.telemetry.UsbEvent;
import com.productivityx.repository.telemetry.FileEventRepository;
import com.productivityx.repository.telemetry.RiskEventRepository;
import com.productivityx.repository.telemetry.UsbEventRepository;
import com.productivityx.repository.DeviceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskService {

    private final RiskEventRepository riskRepo;
    private final UsbEventRepository usbRepo;
    private final FileEventRepository fileRepo;
    private final DeviceRepository deviceRepo;
    private final ObjectMapper objectMapper;

    @Transactional
    public void checkForRisks(String deviceId, Long windowEndTsMs) {
        Device device = deviceRepo.findById(deviceId).orElse(null);
        if (device == null) return;
        
        UUID tenantId = device.getTenantId();
        UUID orgId = device.getOrgId();

        checkR1UsbExfil(tenantId, orgId, deviceId, windowEndTsMs);
        checkR2MassDelete(tenantId, orgId, deviceId, windowEndTsMs);
    }

    private void checkR1UsbExfil(UUID tenantId, UUID orgId, String deviceId, Long windowEndTsMs) {
        long windowStart = windowEndTsMs - 600_000; // 10 mins
        List<UsbEvent> usbInserts = usbRepo.findRecentInserts(tenantId, orgId, deviceId, windowStart);
        
        if (usbInserts.isEmpty()) return;

        List<FileEvent> suspiciousFiles = fileRepo.findRecentExternalOps(tenantId, orgId, deviceId, windowStart);
        if (suspiciousFiles.isEmpty()) return;

        for (UsbEvent usb : usbInserts) {
            String dedupKey = sha256("R1:" + deviceId + ":" + usb.getId());
            if (riskRepo.existsByTenantIdAndOrgIdAndDeviceIdAndTypeAndDedupKey(tenantId, orgId, deviceId, "R1_USB_EXFIL", dedupKey)) {
                continue;
            }

            // Create Risk
            RiskEvent risk = new RiskEvent();
            risk.setId(UUID.randomUUID());
            risk.setTenantId(tenantId);
            risk.setOrgId(orgId);
            risk.setDeviceId(deviceId);
            risk.setSeverity("HIGH");
            risk.setType("R1_USB_EXFIL");
            risk.setWindowStartMs(windowStart);
            risk.setWindowEndMs(windowEndTsMs);
            risk.setDedupKey(dedupKey);
            risk.setStatus("OPEN");
            risk.setCreatedAt(LocalDateTime.now());

            Map<String, Object> evidence = new HashMap<>();
            evidence.put("rule", "R1_USB_EXFIL");
            evidence.put("usb_event_id", usb.getId());
            evidence.put("drive_letter", usb.getDriveLetter());
            evidence.put("file_event_ids", suspiciousFiles.stream().map(FileEvent::getId).collect(Collectors.toList()));
            evidence.put("file_count", suspiciousFiles.size());
            
            try {
                risk.setEvidenceJson(objectMapper.writeValueAsString(evidence));
            } catch (Exception e) {
                log.error("Failed to serialize evidence", e);
            }

            riskRepo.save(risk);
        }
    }

    private void checkR2MassDelete(UUID tenantId, UUID orgId, String deviceId, Long windowEndTsMs) {
        long windowStart = windowEndTsMs - 300_000; // 5 mins
        long count = fileRepo.countRecentDestructiveOps(tenantId, orgId, deviceId, windowStart);
        
        if (count > 30) {
            long bucket = windowEndTsMs / 300_000;
            String dedupKey = sha256("R2:" + deviceId + ":" + bucket);
            
            if (riskRepo.existsByTenantIdAndOrgIdAndDeviceIdAndTypeAndDedupKey(tenantId, orgId, deviceId, "R2_MASS_DELETE_RENAME", dedupKey)) {
                 return;
            }

            RiskEvent risk = new RiskEvent();
            risk.setId(UUID.randomUUID());
            risk.setTenantId(tenantId);
            risk.setOrgId(orgId);
            risk.setDeviceId(deviceId);
            risk.setSeverity("HIGH");
            risk.setType("R2_MASS_DELETE_RENAME");
            risk.setWindowStartMs(windowStart);
            risk.setWindowEndMs(windowEndTsMs);
            risk.setDedupKey(dedupKey);
            risk.setStatus("OPEN");
            risk.setCreatedAt(LocalDateTime.now());

            Map<String, Object> evidence = new HashMap<>();
            evidence.put("rule", "R2_MASS_DELETE_RENAME");
            evidence.put("count", count);
            evidence.put("threshold", 30);
            
            try {
                risk.setEvidenceJson(objectMapper.writeValueAsString(evidence));
            } catch (Exception e) {
                log.error("Failed to serialize evidence", e);
            }

            riskRepo.save(risk);
        }
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedhash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (int i = 0; i < hash.length; i++) {
            String hex = Integer.toHexString(0xff & hash[i]);
            if(hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
