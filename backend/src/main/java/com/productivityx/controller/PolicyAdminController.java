package com.productivityx.controller;

import com.productivityx.dto.policy.PolicyPackDTO;
import com.productivityx.dto.policy.PolicySnapshotDTO;
import com.productivityx.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class PolicyAdminController {

    private final PolicyService policyService;
    private final com.productivityx.repository.PolicyPackRepository policyPackRepository;
    private final com.productivityx.repository.PolicyAssignmentRepository assignmentRepository;

    @PostMapping("/policies")
    public ResponseEntity<PolicyPackDTO> createPolicy(
            @RequestAttribute(value = "tenantId", required = false) UUID tenantId,
            @RequestAttribute(value = "orgId", required = false) UUID orgId,
            @RequestAttribute(value = "userId", required = false) UUID userId,
            @RequestBody Map<String, String> request) {
        
        // Mock Auth context if missing (MVP)
        if (tenantId == null) tenantId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (orgId == null) orgId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (userId == null) userId = UUID.fromString("20000000-0000-0000-0000-000000000001");

        return ResponseEntity.ok(policyService.createDraft(
            tenantId, orgId, userId, 
            request.get("name"), request.get("description")
        ));
    }

    @PutMapping("/policies/{id}/draft")
    public ResponseEntity<PolicyPackDTO> updateDraft(
            @PathVariable UUID id,
            @RequestAttribute(value = "tenantId", required = false) UUID tenantId,
            @RequestAttribute(value = "orgId", required = false) UUID orgId,
            @RequestAttribute(value = "userId", required = false) UUID userId,
            @RequestBody String configJson) {

        if (tenantId == null) tenantId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (orgId == null) orgId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (userId == null) userId = UUID.fromString("20000000-0000-0000-0000-000000000001");

        return ResponseEntity.ok(policyService.updateDraft(tenantId, orgId, userId, id, configJson));
    }

    @PostMapping("/policies/{id}/publish")
    public ResponseEntity<PolicySnapshotDTO> publishPolicy(
            @PathVariable UUID id,
            @RequestAttribute(value = "tenantId", required = false) UUID tenantId,
            @RequestAttribute(value = "orgId", required = false) UUID orgId,
            @RequestAttribute(value = "userId", required = false) UUID userId) {

        if (tenantId == null) tenantId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (orgId == null) orgId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (userId == null) userId = UUID.fromString("20000000-0000-0000-0000-000000000001");

        return ResponseEntity.ok(policyService.publish(tenantId, orgId, userId, id));
    }
    
    @PostMapping("/policy-assignments")
    public ResponseEntity<?> assignPolicy(
            @RequestAttribute(value = "tenantId", required = false) UUID tenantId,
            @RequestAttribute(value = "orgId", required = false) UUID orgId,
            @RequestAttribute(value = "userId", required = false) UUID userId,
            @RequestBody Map<String, Object> request) {

        if (tenantId == null) tenantId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (orgId == null) orgId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (userId == null) userId = UUID.fromString("20000000-0000-0000-0000-000000000001");

        String deviceId = (String) request.get("deviceId");
        UUID policyId = UUID.fromString((String) request.get("policyId"));
        
        policyService.assignPolicy(tenantId, orgId, userId, deviceId, policyId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/policies")
    public ResponseEntity<List<com.productivityx.model.policy.PolicyPack>> listPolicies(
            @RequestAttribute(value = "tenantId", required = false) UUID tenantId,
            @RequestAttribute(value = "orgId", required = false) UUID orgId) {
        
        if (tenantId == null) tenantId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        if (orgId == null) orgId = UUID.fromString("10000000-0000-0000-0000-000000000001");

        return ResponseEntity.ok(policyPackRepository.findByTenantIdAndOrgId(tenantId, orgId));
    }
}
