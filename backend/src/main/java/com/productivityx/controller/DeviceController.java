package com.productivityx.controller;

import com.productivityx.model.Device;
import com.productivityx.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices") // Standardized endpoint (removed /admin prefix for consistency)
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceRepository deviceRepository;

    @GetMapping
    public ResponseEntity<List<Device>> listDevices() {
        return ResponseEntity.ok(deviceRepository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Device> updateDevice(@PathVariable String id, @RequestBody Device device) {
        return deviceRepository.findById(id)
            .map(existing -> {
                existing.setName(device.getName());
                existing.setStatus(device.getStatus());
                existing.setGroupId(device.getGroupId());
                return ResponseEntity.ok(deviceRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable String id) {
        deviceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/heartbeat")
    public ResponseEntity<Void> heartbeat(@PathVariable String id, @RequestBody HeartbeatRequest request) {
        deviceRepository.findById(id).ifPresent(device -> {
             device.setLastSeenAt(java.time.LocalDateTime.now());
             // Update other fields if needed (e.g. status)
             device.setStatus("ONLINE");
             deviceRepository.save(device);
        });
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/rotate-cert")
    public ResponseEntity<?> rotateCert(@PathVariable String id) {
        // Mock Implementation
        return ResponseEntity.ok().body(java.util.Map.of("message", "Cert rotation initiated"));
    }

    @lombok.Data
    static class HeartbeatRequest {
        private String status;
        private String agentVersion;
    }
}
