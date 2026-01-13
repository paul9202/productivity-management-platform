package com.productivityx.controller;

import com.productivityx.model.User;
import com.productivityx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // In a real app we would hash the password here
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable java.util.UUID id, @RequestBody User user) {
        return userRepository.findById(id)
            .map(existing -> {
                existing.setName(user.getName());
                existing.setEmail(user.getEmail());
                existing.setRole(user.getRole());
                existing.setDepartmentId(user.getDepartmentId());
                existing.setStatus(user.getStatus());
                return ResponseEntity.ok(userRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable java.util.UUID id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
