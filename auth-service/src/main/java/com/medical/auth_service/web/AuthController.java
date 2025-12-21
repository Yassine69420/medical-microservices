package com.medical.auth_service.web;

import com.medical.auth_service.entities.User;
import com.medical.auth_service.services.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        // Safety check if accessed through gateway or internally
        if (role != null && !"DOCTOR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("message", "Only Doctors or Admins can register new users"));
        }

        String token = authService.register(user);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", user.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true));
        } else {
            return ResponseEntity.status(401).body(Map.of("valid", false));
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        return authService.getUserById(id)
                .map(user -> {
                    // Return read-only version without passwordHash
                    user.setPasswordHash(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}
