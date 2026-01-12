package com.productivityx.controller;

import com.productivityx.model.PolicySettings;
import com.productivityx.repository.PolicySettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    @Autowired
    private PolicySettingsRepository policyRepository;

    @GetMapping
    public PolicySettings getPolicy() {
        return policyRepository.findAll().stream().findFirst().orElse(null);
    }
}
