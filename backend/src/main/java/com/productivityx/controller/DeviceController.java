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
}
