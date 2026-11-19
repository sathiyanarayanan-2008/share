package com.sharebite.service;

import com.sharebite.config.JwtUtil;
import com.sharebite.dto.AuthRequest;
import com.sharebite.dto.AuthResponse;
import com.sharebite.dto.RegisterRequest;
import com.sharebite.exception.BadRequestException;
import com.sharebite.exception.ResourceNotFoundException;
import com.sharebite.exception.UnauthorizedException;
import com.sharebite.model.*;
import com.sharebite.repository.OrganisationRepository;
import com.sharebite.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       OrganisationRepository organisationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.auditService = auditService;
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String orgName = null;
        if (user.getOrganisationId() != null) {
            orgName = organisationRepository.findById(user.getOrganisationId())
                    .map(Organisation::getName)
                    .orElse(null);
        }

        String token = jwtUtil.generateToken(user);
        auditService.logEvent(user.getId(), user.getName(), user.getRole().name(),
                "USER", user.getId(), "LOGIN", "User logged in successfully");

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getVerificationStatus(), user.getPhone(), user.getOrganisationId(), orgName);
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " already exists");
        }

        String orgId = null;
        String orgName = null;
        VerificationStatus verificationStatus = VerificationStatus.PENDING;

        // If registering as NGO or with organisation details
        if (request.getOrganisationName() != null && !request.getOrganisationName().isBlank()) {
            Organisation org = new Organisation();
            org.setName(request.getOrganisationName());
            org.setType(request.getOrganisationType() != null ? request.getOrganisationType() : "COMMUNITY_KITCHEN");
            org.setAddress(request.getAddress());
            Double lat = request.getLatitude() != null ? request.getLatitude() : 40.7128;
            Double lng = request.getLongitude() != null ? request.getLongitude() : -74.0060;
            org.setGeoCoordinates(new GeoCoordinates(lat, lng));
            org.setCapacity(request.getCapacity() != null ? request.getCapacity() : 100);
            org.setContactPerson(request.getName());
            org.setContactEmail(email);
            org.setContactPhone(request.getPhone());
            org.setRegistrationNumber(request.getRegistrationNumber());
            org.setVerificationStatus(VerificationStatus.PENDING);

            Organisation savedOrg = organisationRepository.save(org);
            orgId = savedOrg.getId();
            orgName = savedOrg.getName();
        } else if (request.getRole() == Role.ADMIN) {
            verificationStatus = VerificationStatus.VERIFIED;
        } else if (request.getRole() == Role.DONOR || request.getRole() == Role.VOLUNTEER) {
            // Self-registered donors and volunteers are verified for basic participation
            verificationStatus = VerificationStatus.VERIFIED;
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setVerificationStatus(verificationStatus);
        user.setOrganisationId(orgId);

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser);
        auditService.logEvent(savedUser.getId(), savedUser.getName(), savedUser.getRole().name(),
                "USER", savedUser.getId(), "REGISTER", "New user registered with role " + savedUser.getRole());

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(),
                savedUser.getRole(), savedUser.getVerificationStatus(), savedUser.getPhone(), savedUser.getOrganisationId(), orgName);
    }

    public User getById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
