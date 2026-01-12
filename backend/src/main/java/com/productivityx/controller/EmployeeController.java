package com.productivityx.controller;

import com.productivityx.model.Employee;
import com.productivityx.repository.EmployeeRepository; // Need to create this
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping
    public List<Employee> listEmployees() {
        return employeeRepository.findAll();
    }
}
