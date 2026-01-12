package com.productivityx.controller;

import com.productivityx.dto.PolicyResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;

@RestController
@RequestMapping("/api/policy")
public class PolicyController {

    @GetMapping("/agent")
    public ResponseEntity<PolicyResponse> getAgentPolicy(
            @RequestParam(required = false) String deptId) {
        
        // Mock Policy Logic for MVP
        // In real app, fetch from DB based on Tenant/Department
        
        return ResponseEntity.ok(PolicyResponse.builder()
                .focusThreshold(50)
                .idleTimeoutSeconds(300)
                .allowedAppCategories(Arrays.asList("work", "utility", "education"))
                .updatedAt(LocalDateTime.now())
                .build());
    }
}
