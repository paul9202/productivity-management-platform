package com.productivityx.controller;

import com.productivityx.model.DeviceGroup;
import com.productivityx.repository.DeviceGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/device-groups")
@RequiredArgsConstructor
public class DeviceGroupController {

    private final DeviceGroupRepository groupRepository;

    @GetMapping
    public ResponseEntity<List<DeviceGroup>> listGroups(@RequestParam(required = false) UUID organizationId) {
        if (organizationId != null) {
            return ResponseEntity.ok(groupRepository.findByOrganizationId(organizationId));
        }
        return ResponseEntity.ok(groupRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<DeviceGroup> createGroup(@RequestBody DeviceGroup group) {
        return ResponseEntity.ok(groupRepository.save(group));
    }
}
