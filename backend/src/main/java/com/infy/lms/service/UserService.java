package com.yourproject.yourapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yourproject.yourapp.repository.UserRepository;
import com.yourproject.yourapp.repository.VerificationTokenRepository;
import com.yourproject.yourapp.model.User;
import com.yourproject.yourapp.model.VerificationToken;

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

    public User register(User user) {
        user.setEnabled(false); // user must verify
        return userRepository.save(user);
    }

    public void sendVerificationEmail(User user) {

        String token = UUID.randomUUID().toString();

        VerificationToken vToken = new VerificationToken();
        vToken.setToken(token);
        vToken.setUser(user);
        vToken.setExpiryDate(LocalDateTime.now().plusHours(24));

        tokenRepo.save(vToken);

        String url = "http://localhost:8080/api/auth/verify?token=" + token;

        emailService.sendEmail(
                user.getEmail(),
                "Verify your LMS account",
                "Click the link to activate your account: " + url
        );
    }
}
