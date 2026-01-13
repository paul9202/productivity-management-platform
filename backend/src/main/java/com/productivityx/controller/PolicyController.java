package com.productivityx.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    // Todo: Implement M2 Policy Logic
    
    @GetMapping
    public Map<String, Object> getPolicy() {
        return Map.of(); // Return empty object for now to satisfy frontend contract
    }
}
