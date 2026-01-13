package com.productivityx.controller;

import com.productivityx.model.Device;
import com.productivityx.model.DeviceCertificate;
import com.productivityx.model.EnrollmentToken;
import com.productivityx.repository.DeviceRepository;
import com.productivityx.repository.DeviceCertificateRepository;
import com.productivityx.repository.EnrollmentTokenRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/enroll")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentTokenRepository tokenRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceCertificateRepository certificateRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<?> enrollDevice(@RequestBody EnrollmentRequest request) {
        // 1. Validate Token
        // Hash the incoming token to match DB (assuming simple string match for mock)
        // In prod, request.token should be hashed before lookup if DB stores hash
        // For this demo, let's assume DB stores the direct token string or we hash it here.
        // The V6 migration inserted 'hash_bootstrap_123', so we expect client to send that or the secret that hashes to it.
        // Let's assume the client sends the SECRET and we look it up. 
        // For simplicity in this "mock" compatible backend: DB stores the Secret directly as "hash".
        
        var tokenOpt = tokenRepository.findByTokenHash(request.getToken());
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid token"));
        }
        
        EnrollmentToken token = tokenOpt.get();
        if (!token.isValid()) {
             return ResponseEntity.status(401).body(new ErrorResponse("Token expired or revoked"));
        }

        // 2. Limit Check (if not infinite)
        if (token.getMaxUses() > 0) {
            token.setUsedCount(token.getUsedCount() + 1);
            tokenRepository.save(token);
        }

        // 3. Register/Update Device
        // Fingerprint Logic: request.fingerprintHash
        // Check if device exists
        Device device = deviceRepository.findByFingerprintHash(request.getFingerprintHash())
            .orElseGet(() -> {
                Device d = new Device();
                d.setDeviceId("urn:focus:device:" + UUID.randomUUID());
                d.setFingerprintHash(request.getFingerprintHash());
                d.setEnrolledAt(LocalDateTime.now());
                return d;
            });

        // Update fields
        device.setName(request.getHostname());
        device.setTenantId(token.getScopeTenantId());
        device.setGroupId(token.getScopeGroupId() != null ? token.getScopeGroupId() : UUID.fromString("00000000-0000-0000-0000-000000000000")); // Fallback or null
        device.setAgentVersion(request.getAgentVersion());
        device.setLastSeenAt(LocalDateTime.now());
        device.setStatus("ONLINE");
        
        // 4. Issue Certificate (Mock PFX generation)
        // In real world: Generate KeyPair, Sign Cert, Export PFX
        // Here: Generate a dummy "thumbprint" and "pfxBlob"
        String thumbprint = UUID.randomUUID().toString();
        String pfxBase64 = "MOCK_PFX_DATA_BASE64_ENCODED_FOR_" + device.getDeviceId();
        
        device.setCertThumbprint(thumbprint);
        deviceRepository.save(device);

        // Store Cert Record
        DeviceCertificate cert = new DeviceCertificate();
        cert.setThumbprint(thumbprint);
        cert.setDeviceId(device.getDeviceId());
        cert.setExpiresAt(LocalDateTime.now().plusDays(365));
        cert.setIssuer("ProductivityX CA");
        cert.setSerialNumber(UUID.randomUUID().toString());
        certificateRepository.save(cert);

        // 5. Response
        return ResponseEntity.ok(new EnrollmentResponse(
            device.getDeviceId(),
            token.getScopeTenantId().toString(),
            device.getGroupId() != null ? device.getGroupId().toString() : null,
            pfxBase64,
            "mock-password",
            thumbprint
        ));
    }

    @Data
    static class EnrollmentRequest {
        private String token; // The bootstrap token or reg code
        private String fingerprintHash;
        private String hostname;
        private String osVersion;
        private String agentVersion;
    }

    @Data
    static class EnrollmentResponse {
        private String deviceId;
        private String tenantId;
        private String groupId;
        private String pfxBase64;
        private String pfxPassword;
        private String certThumbprint;
        
        public EnrollmentResponse(String deviceId, String tenantId, String groupId, String pfx, String pwd, String thumb) {
            this.deviceId = deviceId;
            this.tenantId = tenantId;
            this.groupId = groupId;
            this.pfxBase64 = pfx;
            this.pfxPassword = pwd;
            this.certThumbprint = thumb;
        }
    }
    
    @Data
    static class ErrorResponse {
        private String error;
        public ErrorResponse(String e) { error = e; }
    }
}
