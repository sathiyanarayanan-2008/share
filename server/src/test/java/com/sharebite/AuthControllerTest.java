package com.sharebite;

import com.sharebite.config.JwtUtil;
import com.sharebite.dto.AuthRequest;
import com.sharebite.dto.AuthResponse;
import com.sharebite.dto.RegisterRequest;
import com.sharebite.exception.BadRequestException;
import com.sharebite.exception.UnauthorizedException;
import com.sharebite.model.Role;
import com.sharebite.model.User;
import com.sharebite.model.VerificationStatus;
import com.sharebite.repository.OrganisationRepository;
import com.sharebite.repository.UserRepository;
import com.sharebite.service.AuditService;
import com.sharebite.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganisationRepository organisationRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId("user-101");
        sampleUser.setName("Test Donor");
        sampleUser.setEmail("donor@test.com");
        sampleUser.setPasswordHash("$2a$10$hashedPasswordHere");
        sampleUser.setRole(Role.DONOR);
        sampleUser.setVerificationStatus(VerificationStatus.VERIFIED);
    }

    @Test
    @DisplayName("Successful login verifies BCrypt password and returns JWT auth response")
    void testSuccessfulLogin() {
        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("ValidPassword123!", "$2a$10$hashedPasswordHere")).thenReturn(true);
        when(jwtUtil.generateToken(sampleUser)).thenReturn("sample.jwt.token.here");

        AuthRequest request = new AuthRequest("donor@test.com", "ValidPassword123!");
        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("sample.jwt.token.here", response.getToken());
        assertEquals("user-101", response.getId());
        assertEquals(Role.DONOR, response.getRole());
    }

    @Test
    @DisplayName("Login with invalid password throws UnauthorizedException")
    void testInvalidPasswordThrowsUnauthorized() {
        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "$2a$10$hashedPasswordHere")).thenReturn(false);

        AuthRequest request = new AuthRequest("donor@test.com", "WrongPassword");
        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Registration rejects duplicate email with BadRequestException")
    void testDuplicateEmailRegistration() {
        when(userRepository.existsByEmail("donor@test.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest();
        request.setName("Duplicate User");
        request.setEmail("donor@test.com");
        request.setPassword("Password123!");
        request.setRole(Role.DONOR);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
