package com.infy.lms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Security config:
     * - Allow all OPTIONS requests (CORS preflight) so browser preflight passes
     * - Leave /api/auth/** public
     * - Protect /api/admin/** for ROLE_ADMIN
     * - Keep everything else permitAll for milestone1
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .userDetailsService(userDetailsService)
                .authorizeHttpRequests(authorize -> authorize
                        // Allow CORS preflight requests without authentication
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // auth endpoints public
                        .requestMatchers("/api/auth/**").permitAll()

                        // admin endpoints require ROLE_ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // other endpoints open for now
                        .anyRequest().permitAll()
                )
                .httpBasic(basic -> {})   // keep basic auth for quick testing
                .formLogin(form -> form.disable());

        return http.build();
    }
}
