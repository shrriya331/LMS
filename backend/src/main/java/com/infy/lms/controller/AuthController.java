package com.infy.lms.controller;

import com.infy.lms.dto.LoginRequest;
import com.infy.lms.dto.RegistrationRequest;
import com.infy.lms.model.User;
import com.infy.lms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest req) {
        User created = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                // minimal safe response
                java.util.Map.of("id", created.getId(), "email", created.getEmail(), "status", created.getStatus())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = authService.authenticate(req);
        // For milestone 1 we return a basic user summary. Later: generate JWT.
        return ResponseEntity.ok(java.util.Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole(),
                "firstLogin", user.getFirstLogin()
        ));
    }

    // File upload endpoint will be in AdminController or separate controller (see below)
}
