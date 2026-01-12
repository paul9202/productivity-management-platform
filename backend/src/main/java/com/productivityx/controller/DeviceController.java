package com.productivityx.controller;

import com.productivityx.model.DeviceRegistry;
import com.productivityx.repository.DeviceRegistryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceRegistryRepository deviceRepository;

    @GetMapping
    public ResponseEntity<List<DeviceRegistry>> listDevices() {
        return ResponseEntity.ok(deviceRepository.findAll());
    }
}
