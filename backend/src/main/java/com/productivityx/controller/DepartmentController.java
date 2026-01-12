package com.productivityx.controller;

import com.productivityx.model.Department; // Assuming Department model exists or using generic map
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<Map<String, Object>> listDepartments() {
        // Simple query to avoid creating full Entity for read-only V1 table
        return jdbcTemplate.queryForList("SELECT id, name, 'Unknown Manager' as managerName, 10 as memberCount FROM departments");
    }
}
