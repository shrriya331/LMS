package com.infy.lms.dto;

import com.infy.lms.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String status;       // ADDED
    private String idProofPath;  // ADDED
    private Instant createdAt;
}
