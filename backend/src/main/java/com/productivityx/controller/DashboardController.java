package com.productivityx.controller;

import com.productivityx.dto.DashboardSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/summary")
    public DashboardSummary getSummary() {
        // Mock data for demo purposes, or query DB for real stats
        // For simplicity in this demo sync, we return hardcoded stats matching V2 seed data
        // In production, this would be complex SQL aggregation
        
        return new DashboardSummary(
            78.5, 
            1240.0, 
            12.0, 
            5, 
            List.of(), // Trends would require generating 7 days data
            List.of(), // App usage
            List.of(), // Blocked domains
            List.of()  // Dept stats
        );
    }
}
