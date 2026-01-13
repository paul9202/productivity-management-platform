package com.productivityx.controller;

import com.productivityx.model.EnrollmentToken;
import com.productivityx.repository.EnrollmentTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollment-tokens")
@RequiredArgsConstructor
public class EnrollmentTokenController {

    private final EnrollmentTokenRepository tokenRepository;

    @GetMapping
    public List<EnrollmentToken> listTokens() {
        return tokenRepository.findAll();
    }

    @PostMapping
    public EnrollmentToken createToken(@RequestBody EnrollmentToken token) {
        // Init default values
        token.setCreatedAt(LocalDateTime.now());
        token.setUsedCount(0);
        if (token.getCreatedBy() == null) {
            // Default to 'System Admin' from V3 seed data
            token.setCreatedBy(UUID.fromString("20000000-0000-0000-0000-000000000001")); 
        }
        
        // Handle "current-tenant-id" from frontend or missing value
        if (token.getScopeTenantId() == null) {
             // Default to 'Acme Corp' from V3 seed data
             token.setScopeTenantId(UUID.fromString("10000000-0000-0000-0000-000000000001")); 
        }

        // Generate a random token secret if not provided (mock)
        if (token.getToken() == null || token.getToken().isEmpty()) {
            token.setToken(UUID.randomUUID().toString().substring(0, 8)); // Simple token
            token.setTokenHash(token.getToken()); 
        } else {
             token.setTokenHash(token.getToken());
        }
        
        return tokenRepository.save(token);
    }

    @DeleteMapping("/{id}")
    public void revokeToken(@PathVariable UUID id) {
        tokenRepository.findById(id).ifPresent(t -> {
            t.setRevokedAt(LocalDateTime.now());
            tokenRepository.save(t);
        });
    }
}
