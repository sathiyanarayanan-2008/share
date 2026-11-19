package com.sharebite;

import com.sharebite.dto.ClaimRequest;
import com.sharebite.exception.DonationAlreadyReservedException;
import com.sharebite.model.*;
import com.sharebite.repository.ClaimRepository;
import com.sharebite.repository.DonationRepository;
import com.sharebite.repository.OrganisationRepository;
import com.sharebite.repository.UserRepository;
import com.sharebite.service.AuditService;
import com.sharebite.service.ClaimService;
import com.sharebite.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonationConcurrencyClaimTest {

    @Mock
    private MongoOperations mongoTemplate;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private OrganisationRepository organisationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ClaimService claimService;

    private User ngoUser;
    private Organisation verifiedOrg;
    private Donation donation;

    @BeforeEach
    void setUp() {
        verifiedOrg = new Organisation();
        verifiedOrg.setId("org-hope");
        verifiedOrg.setName("Hope Food Pantry");
        verifiedOrg.setVerificationStatus(VerificationStatus.VERIFIED);
        verifiedOrg.setCapacity(100);

        ngoUser = new User();
        ngoUser.setId("ngo-user-1");
        ngoUser.setName("Elena Rostova");
        ngoUser.setRole(Role.NGO);
        ngoUser.setOrganisationId("org-hope");

        donation = new Donation();
        donation.setId("don-target");
        donation.setTitle("Sandwich Trays");
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setDonorId("donor-99");
        donation.setEstimatedServings(40);
    }

    @Test
    @DisplayName("First claim succeeds atomically and transitions donation to RESERVED")
    void testFirstClaimSucceedsAtomically() {
        when(userRepository.findById("ngo-user-1")).thenReturn(Optional.of(ngoUser));
        when(organisationRepository.findById("org-hope")).thenReturn(Optional.of(verifiedOrg));

        Donation reservedDonation = new Donation();
        reservedDonation.setId("don-target");
        reservedDonation.setTitle("Sandwich Trays");
        reservedDonation.setStatus(DonationStatus.RESERVED);
        reservedDonation.setClaimedByNgoId("org-hope");
        reservedDonation.setClaimedByNgoName("Hope Food Pantry");
        reservedDonation.setDonorId("donor-99");
        reservedDonation.setEstimatedServings(40);

        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(Donation.class)))
                .thenReturn(reservedDonation);

        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> {
            Claim c = invocation.getArgument(0);
            c.setId("clm-success-1");
            return c;
        });

        ClaimRequest req = new ClaimRequest(40, true);
        Claim claim = claimService.reserveDonation("don-target", req, "ngo-user-1");

        assertNotNull(claim);
        assertEquals("clm-success-1", claim.getId());
        assertEquals("don-target", claim.getDonationId());
        assertEquals(ClaimStatus.RESERVED, claim.getStatus());
        verify(mongoTemplate, times(1)).findAndModify(any(), any(), any(), eq(Donation.class));
    }

    @Test
    @DisplayName("Simultaneous second claim fails: Mongo findAndModify returns null and throws DonationAlreadyReservedException")
    void testSecondSimultaneousClaimThrowsConflict() {
        when(userRepository.findById("ngo-user-1")).thenReturn(Optional.of(ngoUser));
        when(organisationRepository.findById("org-hope")).thenReturn(Optional.of(verifiedOrg));

        // When second concurrent transaction runs findAndModify, the query condition (status == AVAILABLE)
        // is no longer met because the first transaction already set status to RESERVED.
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(Donation.class)))
                .thenReturn(null);

        // Mock existing donation lookup to confirm it exists but was taken
        Donation alreadyReserved = new Donation();
        alreadyReserved.setId("don-target");
        alreadyReserved.setStatus(DonationStatus.RESERVED);
        when(donationRepository.findById("don-target")).thenReturn(Optional.of(alreadyReserved));

        ClaimRequest req = new ClaimRequest(40, true);

        DonationAlreadyReservedException exception = assertThrows(
                DonationAlreadyReservedException.class,
                () -> claimService.reserveDonation("don-target", req, "ngo-user-1")
        );

        assertTrue(exception.getMessage().contains("no longer available"));
        verify(claimRepository, never()).save(any(Claim.class));
    }
}
