package com.sharebite.controller;

import com.sharebite.config.JwtUtil;
import com.sharebite.dto.AuthRequest;
import com.sharebite.dto.AuthResponse;
import com.sharebite.dto.RegisterRequest;
import com.sharebite.exception.ResourceNotFoundException;
import com.sharebite.model.Role;
import com.sharebite.model.User;
import com.sharebite.repository.UserRepository;
import com.sharebite.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getProfile(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new ResourceNotFoundException("No authenticated session");
        }
        User user = authService.getById(currentUser.getId());
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(
                token, user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getVerificationStatus(), user.getPhone(),
                user.getOrganisationId(), null
        ));
    }

    @PostMapping("/demo-login/{role}")
    public ResponseEntity<AuthResponse> demoLogin(@PathVariable String role) {
        String email;
        String password;
        switch (role.toUpperCase()) {
            case "DONOR" -> {
                email = "donor@sharebite.demo";
                password = "Password123!";
            }
            case "NGO" -> {
                email = "ngo@sharebite.demo";
                password = "Password123!";
            }
            case "VOLUNTEER" -> {
                email = "volunteer@sharebite.demo";
                password = "Password123!";
            }
            case "ADMIN" -> {
                email = "admin@sharebite.demo";
                password = "Password123!";
            }
            default -> throw new IllegalArgumentException("Unknown role for demo login: " + role);
        }

        return ResponseEntity.ok(authService.login(new AuthRequest(email, password)));
    }
}
