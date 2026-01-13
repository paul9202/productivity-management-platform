package com.productivityx.controller;

import com.productivityx.dto.LoginRequest;
import com.productivityx.dto.LoginResponse;
import com.productivityx.model.User;
import com.productivityx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        // Simple mock password check (supports {noop} prefix from seed data)
        if (!user.getPasswordHash().equals("{noop}" + request.password())) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // Generate a mock token (in real app, use JWT)
        String token = "mock-token-" + UUID.randomUUID().toString() + "-" + user.getRole();

        return new LoginResponse(token, user);
    }
}
