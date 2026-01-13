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

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable java.util.UUID id, @RequestBody Department dept) {
        return deptRepository.findById(id)
            .map(existing -> {
                existing.setName(dept.getName());
                existing.setManagerId(dept.getManagerId());
                return ResponseEntity.ok(deptRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable java.util.UUID id) {
        deptRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
