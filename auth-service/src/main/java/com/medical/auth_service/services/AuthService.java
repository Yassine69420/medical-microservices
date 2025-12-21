package com.medical.auth_service.services;

import com.medical.auth_service.entities.User;
import com.medical.auth_service.repositories.UserRepository;
import com.medical.auth_service.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    public String register(User user) {
        String rawPassword = user.getPasswordHash();
        if (rawPassword == null || rawPassword.isEmpty()) {
            rawPassword = "defaultPassword123";
        }

        logger.info("=========================================");
        logger.info("NEW USER REGISTERED");
        logger.info("Email: {}", user.getEmail());
        logger.info("Password: {}", rawPassword);
        logger.info("Role: {}", user.getRole());
        logger.info("=========================================");

        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        if (user.getRole() == null) {
            user.setRole("PATIENT");
        }
        userRepository.save(user);
        return jwtUtils.generateToken(user.getEmail(), user.getRole());
    }

    public String login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            return jwtUtils.generateToken(email, userOpt.get().getRole());
        }
        throw new RuntimeException("Invalid credentials");
    }

    public boolean validateToken(String token) {
        try {
            String email = jwtUtils.extractUsername(token);
            return jwtUtils.validateToken(token, email);
        } catch (Exception e) {
            return false;
        }
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }
}
