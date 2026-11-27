package com.sharebite;

import com.sharebite.dto.HandoverVerifyRequest;
import com.sharebite.exception.BadRequestException;
import com.sharebite.model.*;
import com.sharebite.repository.*;
import com.sharebite.service.AuditService;
import com.sharebite.service.NotificationService;
import com.sharebite.service.PickupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HandoverTokenSecurityAuditTest {

    @Mock private PickupRepository pickupRepository;
    @Mock private ClaimRepository claimRepository;
    @Mock private DonationRepository donationRepository;
    @Mock private UserRepository userRepository;
    @Mock private AuditService auditService;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private PickupService pickupService;

    private Pickup pickup;
    private User assignedVolunteer;
    private final String legitimateToken = "SB-DONOR_HANDOVER-9A8B7C6D";
    private String legitimateHash;

    @BeforeEach
    void setUp() throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(legitimateToken.getBytes(StandardCharsets.UTF_8));
        legitimateHash = HexFormat.of().formatHex(hashBytes);

        assignedVolunteer = new User();
        assignedVolunteer.setId("vol-courier-1");
        assignedVolunteer.setRole(Role.VOLUNTEER);

        pickup = new Pickup("pk-audit-1", "clm-100", "don-200", "vol-courier-1", "Alex Courier");
        pickup.setStatus(PickupStatus.ASSIGNED);
        pickup.setDonorConfirmationTokenHash(legitimateHash);
        pickup.setTokenExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
    }

    @Test
    @DisplayName("Security: Arbitrary token containing 'DONOR_HANDOVER' substring must be strictly rejected")
    void testSubstringBypassTokenRejected() {
        when(pickupRepository.findById("pk-audit-1")).thenReturn(Optional.of(pickup));
        when(userRepository.findById("vol-courier-1")).thenReturn(Optional.of(assignedVolunteer));

        // Malicious payload attempting substring bypass
        HandoverVerifyRequest maliciousReq = new HandoverVerifyRequest(
                "FORGED_PAYLOAD_WITH_DONOR_HANDOVER_SUBSTRING", "DONOR_HANDOVER", "Exploit attempt"
        );

        assertThrows(BadRequestException.class, () ->
                pickupService.verifyHandoverToken("pk-audit-1", maliciousReq, "vol-courier-1")
        );
        assertEquals(PickupStatus.ASSIGNED, pickup.getStatus(), "Pickup status must remain unchanged on failed verification");
    }

    @Test
    @DisplayName("Security: Authentic token matching SHA-256 hash succeeds and consumes single-use token")
    void testAuthenticTokenSucceedsAndWipesHash() {
        when(pickupRepository.findById("pk-audit-1")).thenReturn(Optional.of(pickup));
        when(userRepository.findById("vol-courier-1")).thenReturn(Optional.of(assignedVolunteer));
        when(donationRepository.findById("don-200")).thenReturn(Optional.of(new Donation()));
        when(claimRepository.findById("clm-100")).thenReturn(Optional.of(new Claim()));

        HandoverVerifyRequest validReq = new HandoverVerifyRequest(legitimateToken, "DONOR_HANDOVER", "Inspected clean");
        Pickup result = pickupService.verifyHandoverToken("pk-audit-1", validReq, "vol-courier-1");

        assertNotNull(result);
        assertEquals(PickupStatus.COLLECTED, result.getStatus());
        assertNull(result.getDonorConfirmationTokenHash(), "Token hash must be wiped immediately upon consumption");
    }
}
