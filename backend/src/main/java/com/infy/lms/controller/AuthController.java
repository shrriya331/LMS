package com.infy.lms.controller;

import com.infy.lms.dto.ForgotPasswordRequest;
import com.infy.lms.dto.RegistrationRequest;
import com.infy.lms.dto.ResetPasswordRequest;
import com.infy.lms.dto.UserSummaryDto;
import com.infy.lms.exception.BadRequestException;
import com.infy.lms.service.AuthService;
import com.infy.lms.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final FileStorageService fileStorageService;
    private final AuthenticationConfiguration authenticationConfiguration;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendBaseUrl;

    // ---------- existing endpoints (register / forgot / reset) ----------
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @ModelAttribute RegistrationRequest request,
            BindingResult bindingResult,
            @RequestPart(value = "idProof", required = false) MultipartFile idProof
    ) {
        if (bindingResult.hasErrors()) {
            String err = bindingResult.getFieldErrors().stream()
                    .map(f -> f.getField() + ": " + f.getDefaultMessage())
                    .reduce((a, b) -> a + "; " + b).orElse("Validation error");
            throw new BadRequestException(err);
        }

        String storedPath = null;
        if (idProof != null && !idProof.isEmpty()) {
            storedPath = fileStorageService.storeFile(idProof);
        }

        authService.registerUser(request, storedPath);
        return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful. Pending admin approval.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String resetBase = frontendBaseUrl + "/reset-password";
        authService.createPasswordResetToken(req.getEmail(), resetBase);
        return ResponseEntity.ok(Map.of("message", "If that email exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    // ---------- NEW: login endpoint ----------
    public static record LoginRequest(String email, String password) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        try {
            AuthenticationManager am = authenticationConfiguration.getAuthenticationManager();

            Authentication auth = am.authenticate(
                    new UsernamePasswordAuthenticationToken(body.email(), body.password())
            );

            // If authentication succeeds, return a small user summary DTO (email, role, status, etc.)
            UserSummaryDto summary = authService.getUserSummaryByEmail(body.email());

            return ResponseEntity.ok(summary);

        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        } catch (DisabledException ex) {
            return ResponseEntity.status(403).body(Map.of("message", "User disabled or not approved"));
        } catch (UsernameNotFoundException ex) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Login failed"));
        }
    }
}
