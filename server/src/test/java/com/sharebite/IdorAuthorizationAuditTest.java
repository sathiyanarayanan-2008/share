package com.sharebite;

import com.sharebite.dto.HandoverVerifyRequest;
import com.sharebite.exception.UnauthorizedException;
import com.sharebite.model.*;
import com.sharebite.repository.*;
import com.sharebite.service.AuditService;
import com.sharebite.service.ClaimService;
import com.sharebite.service.NotificationService;
import com.sharebite.service.PickupService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoOperations;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdorAuthorizationAuditTest {

    @Mock private ClaimRepository claimRepository;
    @Mock private PickupRepository pickupRepository;
    @Mock private DonationRepository donationRepository;
    @Mock private UserRepository userRepository;
    @Mock private MongoOperations mongoOperations;
    @Mock private AuditService auditService;
    @Mock private NotificationService notificationService;

    @InjectMocks private ClaimService claimService;
    @InjectMocks private PickupService pickupService;

    @Test
    @DisplayName("IDOR: NGO B cannot cancel a reservation owned by NGO A")
    void testCompetitorNgoCannotCancelClaim() {
        Claim claimA = new Claim("clm-ngo-a", "don-1", "org-hope-pantry", "Hope Pantry", 40, true);
        claimA.setStatus(ClaimStatus.RESERVED);

        User attackerNgoB = new User();
        attackerNgoB.setId("usr-attacker-b");
        attackerNgoB.setRole(Role.NGO);
        attackerNgoB.setOrganisationId("org-rival-pantry");

        when(claimRepository.findById("clm-ngo-a")).thenReturn(Optional.of(claimA));
        when(userRepository.findById("usr-attacker-b")).thenReturn(Optional.of(attackerNgoB));

        // When fix is applied, UnauthorizedException is thrown
        assertThrows(UnauthorizedException.class, () ->
                claimService.cancelClaim("clm-ngo-a", "usr-attacker-b")
        );
        verify(claimRepository, never()).save(any(Claim.class));
    }

    @Test
    @DisplayName("IDOR: Unassigned Volunteer courier cannot confirm handover on another courier's run")
    void testUnassignedCourierCannotConfirmPickup() {
        Pickup assignedPickup = new Pickup("pk-run-10", "clm-1", "don-1", "vol-assigned-legit", "Legit Courier");
        assignedPickup.setStatus(PickupStatus.ASSIGNED);
        assignedPickup.setDonorConfirmationTokenHash("samplehash");
        assignedPickup.setTokenExpiresAt(Instant.now().plusSeconds(600));

        User intruderVolunteer = new User();
        intruderVolunteer.setId("vol-intruder-99");
        intruderVolunteer.setRole(Role.VOLUNTEER);

        when(pickupRepository.findById("pk-run-10")).thenReturn(Optional.of(assignedPickup));
        when(userRepository.findById("vol-intruder-99")).thenReturn(Optional.of(intruderVolunteer));

        HandoverVerifyRequest req = new HandoverVerifyRequest("sampletoken", "DONOR_HANDOVER", "Intruder attempt");

        assertThrows(UnauthorizedException.class, () ->
                pickupService.verifyHandoverToken("pk-run-10", req, "vol-intruder-99")
        );
    }
}
