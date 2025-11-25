package com.infy.lms.service;

import com.infy.lms.dto.RegistrationRequest;
import com.infy.lms.dto.UserSummaryDto;
import com.infy.lms.enums.UserStatus;
import com.infy.lms.exception.BadRequestException;
import com.infy.lms.exception.ResourceAlreadyExistsException;
import com.infy.lms.model.User;
import com.infy.lms.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService; // real implementation (JavaMailSender)

    @Transactional
    public void registerUser(RegistrationRequest request, String idProofPath) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResourceAlreadyExistsException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.PENDING);
        user.setFirstLogin(true);
        user.setEnabled(false);
        user.setIdProofPath(idProofPath);

        userRepository.save(user);
    }

    // ----------------- Admin actions -----------------

    /**
     * Approve a pending user. Sets status to APPROVED and returns saved User.
     * Also sends an approval email (with idProof attachment if available).
     */
    @Transactional
    public User approveUser(Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            throw new BadRequestException("User not found with id: " + id);
        }
        User user = opt.get();
        if (user.getStatus() != UserStatus.PENDING) {
            throw new BadRequestException("Only PENDING users can be approved");
        }
        user.setStatus(UserStatus.APPROVED);
        user.setEnabled(true);
        User saved = userRepository.save(user);

        // Build email body
        String body = "<p>Hi " + saved.getName() + ",</p>"
                + "<p>Your registration for LMS has been <strong>APPROVED</strong> by the admin.</p>"
                + "<p>You can now log in using your credentials.</p>"
                + "<p>Regards,<br/>LMS Team</p>";

        // Attach idProof if available
        if (saved.getIdProofPath() != null && !saved.getIdProofPath().isBlank()) {
            emailService.sendEmailWithAttachment(saved.getEmail(), "LMS: Account Approved", body, saved.getIdProofPath());
        } else {
            emailService.sendEmail(saved.getEmail(), "LMS: Account Approved", body);
        }

        return saved;
    }

    /**
     * Reject a pending user. Sets status to REJECTED and returns saved User.
     * Sends a rejection email (with optional reason).
     */
    @Transactional
    public User rejectUser(Long id, String reason) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            throw new BadRequestException("User not found with id: " + id);
        }
        User user = opt.get();
        if (user.getStatus() != UserStatus.PENDING) {
            throw new BadRequestException("Only PENDING users can be rejected");
        }
        user.setStatus(UserStatus.REJECTED);
        User saved = userRepository.save(user);

        String body = "<p>Hi " + saved.getName() + ",</p>"
                + "<p>Your registration for LMS has been <strong>REJECTED</strong> by the admin.</p>"
                + "<p>Reason: " + (reason == null ? "Not provided" : escapeHtml(reason)) + "</p>"
                + "<p>If you believe this is a mistake, please contact support.</p>"
                + "<p>Regards,<br/>LMS Team</p>";

        // Attach idProof if available (optional)
        if (saved.getIdProofPath() != null && !saved.getIdProofPath().isBlank()) {
            emailService.sendEmailWithAttachment(saved.getEmail(), "LMS: Account Rejected", body, saved.getIdProofPath());
        } else {
            emailService.sendEmail(saved.getEmail(), "LMS: Account Rejected", body);
        }

        return saved;
    }

    /**
     * List all users with status PENDING and map to summary DTOs.
     */
    public List<UserSummaryDto> listPendingUsers() {
        List<User> pending = userRepository.findAllByStatus(UserStatus.PENDING);
        return pending.stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole(), u.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // Simple HTML-escape for reason text to avoid breaking email HTML
    private String escapeHtml(String input) {
        if (input == null) return null;
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
