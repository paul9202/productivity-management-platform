package com.productivityx.controller;

import com.productivityx.model.Department;
import com.productivityx.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository deptRepository;

    @GetMapping
    public ResponseEntity<List<Department>> listDepartments() {
        // In a real app we'd fetch member count and manager name via JOIN or separate queries
        return ResponseEntity.ok(deptRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department dept) {
        return ResponseEntity.ok(deptRepository.save(dept));
    }
}
