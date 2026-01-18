package com.productivityx.controller;

import com.productivityx.dto.policy.DevicePolicyAckDTO;
import com.productivityx.dto.policy.PolicySnapshotDTO;
import com.productivityx.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping("/snapshot")
    public ResponseEntity<PolicySnapshotDTO> getSnapshot(
            @RequestParam String deviceId,
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {
            
        return policyService.getSnapshotForDevice(deviceId, ifNoneMatch)
            .map(snapshot -> {
                // If ETag matches, return 304
                if (ifNoneMatch != null && ifNoneMatch.replace("\"", "").equals(snapshot.getEtag())) {
                    return ResponseEntity.status(304)
                            .eTag(snapshot.getEtag())
                            .body((PolicySnapshotDTO) null);
                }
                
                return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS))
                    .eTag(snapshot.getEtag())
                    .body(snapshot);
            })
            .orElse(ResponseEntity.noContent().build()); // 204 if no assignment
    }

    @PostMapping("/ack")
    public ResponseEntity<Void> ackPolicy(@RequestBody DevicePolicyAckDTO ack) {
        policyService.recordAck(
            ack.getDeviceId(),
            ack.getPolicyId(),
            ack.getVersion(),
            ack.getStatus(),
            ack.getReason(),
            ack.getAppliedAtMs(),
            ack.getAgentVersion(),
            ack.getClientEtag()
        );
        return ResponseEntity.ok().build();
    }
}
