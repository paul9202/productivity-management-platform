package com.productivityx.controller;

import com.productivityx.model.Policy;
import com.productivityx.model.PolicyVersion;
import com.productivityx.repository.PolicyRepository;
import com.productivityx.repository.PolicyVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyRepository policyRepository;
    private final PolicyVersionRepository versionRepository;
    private final com.productivityx.repository.PolicyTargetRepository targetRepository;
    private final com.productivityx.repository.PolicyAckRepository ackRepository;

    @GetMapping
    public ResponseEntity<List<Policy>> listPolicies(@RequestParam(required = false) UUID organizationId) {
        if (organizationId != null) {
            return ResponseEntity.ok(policyRepository.findByOrganizationId(organizationId));
        }
        return ResponseEntity.ok(policyRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Policy> createPolicy(@RequestBody Policy policy) {
        policy.setCreatedAt(LocalDateTime.now());
        policy.setUpdatedAt(LocalDateTime.now());
        Policy saved = policyRepository.save(policy);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Policy> getPolicy(@PathVariable UUID id) {
        return policyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deletePolicy(@PathVariable UUID id) {
        // Cascade delete manually (because of FK constraints)
        targetRepository.deleteByPolicyId(id);
        ackRepository.deleteByPolicyId(id);
        versionRepository.deleteByPolicyId(id);
        policyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    // --- Versioning ---

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<PolicyVersion>> listVersions(@PathVariable UUID id) {
        return ResponseEntity.ok(versionRepository.findByPolicyIdOrderByVersionDesc(id));
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<PolicyVersion> createVersion(@PathVariable UUID id, @RequestBody PolicyVersion version) {
        return policyRepository.findById(id).map(policy -> {
            // Calculate next version number
            int nextVersion = versionRepository.findTopByPolicyIdOrderByVersionDesc(id)
                    .map(v -> v.getVersion() + 1)
                    .orElse(1);

            version.setPolicy(policy);
            version.setVersion(nextVersion);
            version.setCreatedAt(LocalDateTime.now());
            
            return ResponseEntity.ok(versionRepository.save(version));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/publish/{versionId}")
    public ResponseEntity<Policy> publishVersion(@PathVariable UUID id, @PathVariable UUID versionId) {
        return policyRepository.findById(id).map(policy -> {
             if (!versionRepository.existsById(versionId)) {
                 return ResponseEntity.badRequest().<Policy>build();
             }
             policy.setActiveVersionId(versionId);
             policy.setUpdatedAt(LocalDateTime.now());
             return ResponseEntity.ok(policyRepository.save(policy));
        }).orElse(ResponseEntity.notFound().build());
    }
}
