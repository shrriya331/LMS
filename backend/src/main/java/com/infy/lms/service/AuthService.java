package com.infy.lms.service;

import com.infy.lms.dto.LoginRequest;
import com.infy.lms.dto.RegistrationRequest;
import com.infy.lms.enums.UserStatus;
import com.infy.lms.model.User;
import com.infy.lms.repository.UserRepository;
import com.infy.lms.exception.BadRequestException;
import com.infy.lms.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.infy.lms.dto.UserSummaryDto;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User register(RegistrationRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already in use");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .role(req.getRole())
                .password(passwordEncoder.encode(req.getPassword()))
                .status(UserStatus.PENDING)
                .firstLogin(true)
                .build();
        return userRepository.save(user);
    }

    public User authenticate(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (user.getStatus() != UserStatus.APPROVED) {
            throw new BadRequestException("Account not approved by admin");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        return user;
    }

    @Transactional
    public User approveUser(Long userId) {
        User u = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        u.setStatus(UserStatus.APPROVED);
        u.setFirstLogin(true);
        return userRepository.save(u);
    }

    @Transactional
    public User rejectUser(Long userId, String reason) {
        User u = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        u.setStatus(UserStatus.REJECTED);
        return userRepository.save(u);
    }

    // File upload stub: implement storage logic (filesystem or cloud)
    @Transactional
    public void saveIdProof(Long userId, String storedPath) {
        User u = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        u.setIdProofPath(storedPath);
        u.setStatus(UserStatus.PENDING); // ensure admin re-approves after new upload
        userRepository.save(u);
    }

    //Return list of users with PENDING status.
    @Transactional(readOnly = true)
    public List<UserSummaryDto> listPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING)
                .stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getEmail(), u.getName(), u.getRole(), u.getStatus()))
                .collect(Collectors.toList());
    }
}
