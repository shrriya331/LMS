package com.yourprojectname.yourapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.yourprojectname.yourapp.model.VerificationToken;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    VerificationToken findByToken(String token);
}
