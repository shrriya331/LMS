package com.infy.lms.service;

import com.infy.lms.model.User;
import com.infy.lms.model.VerificationToken;
import com.infy.lms.repository.UserRepository;
import com.infy.lms.repository.VerificationTokenRepository;
import com.infy.lms.enums.UserStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationTokenRepository tokenRepo;

    @Autowired
    private EmailService emailService;

    // SAVE USER IN DATABASE WITH STATUS = PENDING
    public User register(User user) {

        user.setStatus(UserStatus.PENDING);   // because your User model has UserStatus
        user.setFirstLogin(true);

        return userRepository.save(user);
    }

    // GENERATE TOKEN + SEND EMAIL
    public void sendVerificationEmail(User user) {

        String token = UUID.randomUUID().toString();

        VerificationToken vToken = new VerificationToken();
        vToken.setToken(token);
        vToken.setUser(user);
        vToken.setExpiryDate(LocalDateTime.now().plusHours(24));

        tokenRepo.save(vToken);

        String url = "http://localhost:8081/api/auth/verify?token=" + token;

        emailService.sendEmail(
                user.getEmail(),
                "Verify your LMS account",
                "Click the link to activate your account: " + url
        );
    }
}
