package com.productivityx.controller;

import com.productivityx.model.Organization;
import com.productivityx.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationRepository orgRepository;

    @GetMapping
    public ResponseEntity<List<Organization>> listOrgs() {
        return ResponseEntity.ok(orgRepository.findAll());
    }
}
