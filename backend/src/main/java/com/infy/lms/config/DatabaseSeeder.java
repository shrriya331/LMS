package com.infy.lms.config;

import com.infy.lms.enums.Role;
import com.infy.lms.enums.UserStatus;
import com.infy.lms.model.User;
import com.infy.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates a default admin user if not present.
 * Default credentials:
 *   email: admin
 *   password: Admin@123
 *
 * Change these values in production.
 */
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // email "admin" used in your earlier spec; you can change to "admin@lms.local"
        String adminEmail = "admin";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("System Admin")
                    .email(adminEmail)
                    .phone(null)
                    .role(Role.ADMIN)
                    .password(passwordEncoder.encode("Admin@123"))
                    .status(UserStatus.APPROVED)
                    .firstLogin(false)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded default admin -> email: " + adminEmail + " password: Admin@123");
        }
    }
}
