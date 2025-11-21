package com.infy.lms.dto;

import com.infy.lms.enums.Role;
import com.infy.lms.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String email;
    private String name;
    private Role role;
    private UserStatus status;
}
