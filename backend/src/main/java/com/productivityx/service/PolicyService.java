package com.productivityx.service;

import com.productivityx.dto.policy.*;
import com.productivityx.model.Device;
import com.productivityx.model.policy.*;
import com.productivityx.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyService {

    private final PolicyPackRepository policyRepo;
    private final PolicySnapshotRepository snapshotRepo;
    private final PolicyAssignmentRepository assignmentRepo;
    private final DevicePolicyAckRepository ackRepo;
    private final DeviceRepository deviceRepo;
    private final AuditLogRepository auditRepo;
    private final ObjectMapper objectMapper;

    @Transactional
    public PolicyPackDTO createDraft(UUID tenantId, UUID orgId, UUID userId, String name, String desc) {
        PolicyPack policy = new PolicyPack();
        policy.setId(UUID.randomUUID());
        policy.setTenantId(tenantId);
        policy.setOrgId(orgId);
        policy.setName(name);
        policy.setDescription(desc);
        policy.setStatus("DRAFT");
        policy.setPublishedVersion(0);
        policy.setCreatedAt(System.currentTimeMillis());
        policy.setCreatedBy(userId);
        
        // Default empty config
        policy.setConfigDraft("{}");
        
        policyRepo.save(policy);
        
        logAudit(tenantId, orgId, userId, "CREATE_POLICY", policy.getId().toString(), null);
        
        return mapToDTO(policy);
    }

    @Transactional
    public PolicyPackDTO updateDraft(UUID tenantId, UUID orgId, UUID userId, UUID policyId, String configJson) {
        PolicyPack policy = policyRepo.findById(policyId)
            .orElseThrow(() -> new RuntimeException("Policy not found"));
        
        if (!policy.getTenantId().equals(tenantId) || !policy.getOrgId().equals(orgId)) {
            throw new RuntimeException("Access denied");
        }
        
        // Allow editing draft even if previously published (editing "next" version)
        // But simplified: only DRAFT status implies "Work In Progress". 
        // If PUBLISHED, we update the draft config for the *next* version.
        
        policy.setConfigDraft(configJson);
        policy.setUpdatedAt(System.currentTimeMillis());
        policy.setUpdatedBy(userId);
        
        // If it was ARCHIVED, maybe move back to DRAFT?
        // Logic: Always allow updating config_draft.
        
        policyRepo.save(policy);
        logAudit(tenantId, orgId, userId, "UPDATE_DRAFT", policyId.toString(), null);
        return mapToDTO(policy);
    }
    
    @Transactional
    public PolicySnapshotDTO publish(UUID tenantId, UUID orgId, UUID userId, UUID policyId) {
        PolicyPack policy = policyRepo.findById(policyId)
            .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getTenantId().equals(tenantId) || !policy.getOrgId().equals(orgId)) {
            throw new RuntimeException("Access denied");
        }

        int nextVersion = (policy.getPublishedVersion() == null ? 0 : policy.getPublishedVersion()) + 1;
        
        // Create Snapshot
        PolicySnapshot snapshot = new PolicySnapshot();
        snapshot.setId(UUID.randomUUID());
        snapshot.setTenantId(tenantId);
        snapshot.setOrgId(orgId);
        snapshot.setPolicyId(policyId);
        snapshot.setVersion(nextVersion);
        
        // Snapshot JSON is the config draft
        snapshot.setSnapshotJson(policy.getConfigDraft());
        
        // Calc ETag
        String etag = sha256(policy.getConfigDraft());
        snapshot.setEtag(etag);
        
        long now = System.currentTimeMillis();
        snapshot.setIssuedAtMs(now);
        snapshot.setExpiresAtMs(now + 31536000000L); // 1 year validity
        snapshot.setCreatedAt(now);

        snapshotRepo.save(snapshot);
        
        // Update Policy Pack
        policy.setPublishedVersion(nextVersion);
        policy.setStatus("PUBLISHED");
        policy.setUpdatedAt(now);
        policy.setUpdatedBy(userId);
        policyRepo.save(policy);
        
        logAudit(tenantId, orgId, userId, "PUBLISH_POLICY", policyId.toString(), "Version " + nextVersion);
        
        return mapToSnapshotDTO(snapshot);
    }

    @Transactional(readOnly = true)
    public Optional<PolicySnapshotDTO> getSnapshotForDevice(String deviceId, String ifNoneMatch) {
         Device device = deviceRepo.findById(deviceId).orElse(null);
         if (device == null) return Optional.empty();
         
         // 1. Find active assignment
         Optional<PolicyAssignment> assignOpt = assignmentRepo.findActiveByDeviceId(
             device.getTenantId(), device.getOrgId(), deviceId);
             
         if (assignOpt.isEmpty()) return Optional.empty();
         
         PolicyAssignment assignment = assignOpt.get();
         PolicyPack policy = policyRepo.findById(assignment.getPolicyId()).orElse(null);
         if (policy == null || policy.getPublishedVersion() == null || policy.getPublishedVersion() == 0) {
             return Optional.empty();
         }
         
         int version = policy.getPublishedVersion();
         
         // 2. Get Snapshot
         Optional<PolicySnapshot> snapshotOpt = snapshotRepo.findByPolicyIdAndVersion(policy.getId(), version);
         if (snapshotOpt.isEmpty()) return Optional.empty();
         
         PolicySnapshot snapshot = snapshotOpt.get();
         
         PolicySnapshotDTO dto = mapToSnapshotDTO(snapshot);
         
         // Check ETag
         if (ifNoneMatch != null && ifNoneMatch.replace("\"", "").equals(snapshot.getEtag())) {
             // 304 Case - handled by Controller returning empty body + 304 status if DTO matches
             // But Service should return the DTO and let controller decide? 
             // Or return empty optional? 
             // Returning the DTO is safer, Controller uses ETag to set status.
         }
         
         return Optional.of(dto);
    }
    
    @Transactional
    public void assignPolicy(UUID tenantId, UUID orgId, UUID userId, String deviceId, UUID policyId) {
        // Enforce Unique Active Assignment
        // Deactivate existing
        assignmentRepo.findActiveByDeviceId(tenantId, orgId, deviceId).ifPresent(existing -> {
            existing.setActive(false);
            assignmentRepo.save(existing);
        });
        
        PolicyAssignment pa = new PolicyAssignment();
        pa.setId(UUID.randomUUID());
        pa.setTenantId(tenantId);
        pa.setOrgId(orgId);
        pa.setDeviceId(deviceId);
        pa.setPolicyId(policyId);
        pa.setActive(true);
        pa.setPriority(100);
        pa.setCreatedAt(System.currentTimeMillis());
        pa.setUpdatedAt(System.currentTimeMillis());
        
        assignmentRepo.save(pa);
        logAudit(tenantId, orgId, userId, "ASSIGN_POLICY", deviceId, policyId.toString());
    }

    @Transactional
    public void recordAck(String deviceId, UUID policyId, Integer version, String status, String reason, Long appliedAtMs, String agentVersion, String clientEtag) {
        Device device = deviceRepo.findById(deviceId).orElseThrow(() -> new RuntimeException("Device not found"));
        
        DevicePolicyAck ack = new DevicePolicyAck();
        ack.setId(UUID.randomUUID());
        ack.setTenantId(device.getTenantId());
        ack.setOrgId(device.getOrgId());
        ack.setDeviceId(deviceId);
        ack.setPolicyId(policyId);
        ack.setVersion(version);
        ack.setStatus(status);
        ack.setReason(reason);
        ack.setAppliedAtMs(appliedAtMs);
        ack.setAgentVersion(agentVersion);
        ack.setClientEtag(clientEtag);
        ack.setCreatedAt(System.currentTimeMillis());
        
        ackRepo.save(ack);
        
        // Update Device status for quick lookup
        device.setPolicyVersion(version.toString());
        device.setAckStatus(status);
        deviceRepo.save(device);
    }

    private void logAudit(UUID tenantId, UUID orgId, UUID userId, String action, String target, String details) {
        AuditLog log = new AuditLog();
        log.setId(UUID.randomUUID());
        log.setTenantId(tenantId);
        log.setOrgId(orgId);
        log.setActorId(userId);
        log.setAction(action);
        log.setTarget(target);
        log.setDetailsJson(details != null ? "{\"msg\":\"" + details + "\"}" : "{}");
        log.setTsMs(System.currentTimeMillis());
        auditRepo.save(log);
    }

    private PolicyPackDTO mapToDTO(PolicyPack p) {
        PolicyPackDTO d = new PolicyPackDTO();
        d.setId(p.getId());
        d.setTenantId(p.getTenantId());
        d.setOrgId(p.getOrgId());
        d.setName(p.getName());
        d.setDescription(p.getDescription());
        d.setStatus(p.getStatus());
        d.setPublishedVersion(p.getPublishedVersion());
        d.setConfigDraft(p.getConfigDraft());
        d.setCreatedAt(p.getCreatedAt());
        d.setUpdatedAt(p.getUpdatedAt());
        return d;
    }

    private PolicySnapshotDTO mapToSnapshotDTO(PolicySnapshot s) {
        PolicySnapshotDTO d = new PolicySnapshotDTO();
        d.setPolicyId(s.getPolicyId());
        d.setVersion(s.getVersion());
        d.setSnapshotJson(s.getSnapshotJson());
        d.setEtag(s.getEtag());
        d.setIssuedAtMs(s.getIssuedAtMs());
        d.setExpiresAtMs(s.getExpiresAtMs());
        return d;
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
            if(hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
