package com.infy.lms.controller;

import com.infy.lms.dto.RegistrationRequest;
import com.infy.lms.exception.BadRequestException;
import com.infy.lms.service.AuthService;
import com.infy.lms.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private FileStorageService fileStorageService;

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
}
