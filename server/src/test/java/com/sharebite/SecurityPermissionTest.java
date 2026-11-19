package com.sharebite;

import com.sharebite.dto.ClaimRequest;
import com.sharebite.dto.HandoverTokenResponse;
import com.sharebite.dto.HandoverVerifyRequest;
import com.sharebite.exception.BadRequestException;
import com.sharebite.exception.UnauthorizedException;
import com.sharebite.model.*;
import com.sharebite.repository.*;
import com.sharebite.service.AuditService;
import com.sharebite.service.ClaimService;
import com.sharebite.service.NotificationService;
import com.sharebite.service.PickupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoOperations;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityPermissionTest {

    @Mock
    private MongoOperations mongoTemplate;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganisationRepository organisationRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private PickupRepository pickupRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ClaimService claimService;

    @InjectMocks
    private PickupService pickupService;

    private User unverifiedNgoUser;
    private Organisation unverifiedOrg;
    private User volunteerUser;

    @BeforeEach
    void setUp() {
        unverifiedOrg = new Organisation();
        unverifiedOrg.setId("org-unverified");
        unverifiedOrg.setName("Unverified Haven");
        unverifiedOrg.setVerificationStatus(VerificationStatus.PENDING);

        unverifiedNgoUser = new User();
        unverifiedNgoUser.setId("ngo-unverified-user");
        unverifiedNgoUser.setRole(Role.NGO);
        unverifiedNgoUser.setOrganisationId("org-unverified");
        unverifiedNgoUser.setVerificationStatus(VerificationStatus.PENDING);

        volunteerUser = new User();
        volunteerUser.setId("vol-1");
        volunteerUser.setName("Alex Volunteer");
        volunteerUser.setRole(Role.VOLUNTEER);
    }

    @Test
    @DisplayName("Unverified NGO cannot claim donations (throws UnauthorizedException)")
    void testUnverifiedNgoCannotClaim() {
        when(userRepository.findById("ngo-unverified-user")).thenReturn(Optional.of(unverifiedNgoUser));
        when(organisationRepository.findById("org-unverified")).thenReturn(Optional.of(unverifiedOrg));

        ClaimRequest req = new ClaimRequest(20, true);

        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> claimService.reserveDonation("don-any", req, "ngo-unverified-user")
        );

        assertTrue(exception.getMessage().contains("verification is pending"));
    }

    @Test
    @DisplayName("Generating single-use handover token produces valid token and hashes it")
    void testHandoverTokenGeneration() {
        Pickup pickup = new Pickup("pk-1", "clm-1", "don-1", "vol-1", "Alex");
        when(pickupRepository.findById("pk-1")).thenReturn(Optional.of(pickup));
        when(pickupRepository.save(any(Pickup.class))).thenAnswer(i -> i.getArgument(0));

        HandoverTokenResponse response = pickupService.generateHandoverToken("pk-1", "DONOR_HANDOVER", "donor-1");

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(response.getToken().startsWith("SB-DONOR_HANDOVER"));
        assertNotNull(pickup.getDonorConfirmationTokenHash(), "SHA-256 hash must be stored in pickup");
        assertNotNull(pickup.getTokenExpiresAt());
    }

    @Test
    @DisplayName("Expired handover token is rejected by server")
    void testExpiredHandoverTokenRejected() {
        Pickup pickup = new Pickup("pk-1", "clm-1", "don-1", "vol-1", "Alex");
        pickup.setTokenExpiresAt(Instant.now().minus(5, ChronoUnit.MINUTES)); // expired 5 mins ago
        pickup.setDonorConfirmationTokenHash("fakehash");

        when(pickupRepository.findById("pk-1")).thenReturn(Optional.of(pickup));
        when(userRepository.findById("vol-1")).thenReturn(Optional.of(volunteerUser));

        HandoverVerifyRequest req = new HandoverVerifyRequest("SB-DONOR_HANDOVER-FAKE", "DONOR_HANDOVER", "Notes");

        assertThrows(BadRequestException.class, () ->
                pickupService.verifyHandoverToken("pk-1", req, "vol-1")
        );
    }
}
