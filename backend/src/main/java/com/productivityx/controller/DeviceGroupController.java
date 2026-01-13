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

    @PutMapping("/{id}")
    public ResponseEntity<DeviceGroup> updateGroup(@PathVariable UUID id, @RequestBody DeviceGroup group) {
        return groupRepository.findById(id)
            .map(existing -> {
                existing.setName(group.getName());
                existing.setDescription(group.getDescription());
                return ResponseEntity.ok(groupRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable UUID id) {
        groupRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
