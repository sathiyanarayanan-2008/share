package com.sharebite;

import com.sharebite.dto.DonationUpdateRequest;
import com.sharebite.exception.InvalidStateTransitionException;
import com.sharebite.exception.UnauthorizedException;
import com.sharebite.model.*;
import com.sharebite.repository.DonationRepository;
import com.sharebite.repository.UserRepository;
import com.sharebite.service.AuditService;
import com.sharebite.service.DonationService;
import com.sharebite.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonationStateTransitionTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private DonationService donationService;

    private Donation donation;
    private User donorUser;

    @BeforeEach
    void setUp() {
        donorUser = new User();
        donorUser.setId("donor-123");
        donorUser.setName("GreenBite Donor");
        donorUser.setRole(Role.DONOR);

        donation = new Donation();
        donation.setId("don-123");
        donation.setDonorId("donor-123");
        donation.setDonorName("GreenBite Donor");
        donation.setTitle("Vegetable Lasagna");
        donation.setStatus(DonationStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Editing a RESERVED donation throws InvalidStateTransitionException")
    void testCannotEditReservedDonation() {
        donation.setStatus(DonationStatus.RESERVED);
        when(donationRepository.findById("don-123")).thenReturn(Optional.of(donation));

        DonationUpdateRequest updateReq = new DonationUpdateRequest();
        updateReq.setTitle("Modified Lasagna Title");

        assertThrows(InvalidStateTransitionException.class, () ->
                donationService.updateDonation("don-123", updateReq, "donor-123")
        );
    }

    @Test
    @DisplayName("Editing a COMPLETED donation throws InvalidStateTransitionException")
    void testCannotEditCompletedDonation() {
        donation.setStatus(DonationStatus.COMPLETED);
        when(donationRepository.findById("don-123")).thenReturn(Optional.of(donation));

        DonationUpdateRequest updateReq = new DonationUpdateRequest();
        updateReq.setTitle("Modified Title");

        assertThrows(InvalidStateTransitionException.class, () ->
                donationService.updateDonation("don-123", updateReq, "donor-123")
        );
    }

    @Test
    @DisplayName("Cancelling a PICKED_UP donation throws InvalidStateTransitionException")
    void testCannotCancelInTransitDonation() {
        donation.setStatus(DonationStatus.PICKED_UP);
        when(donationRepository.findById("don-123")).thenReturn(Optional.of(donation));
        when(userRepository.findById("donor-123")).thenReturn(Optional.of(donorUser));

        assertThrows(InvalidStateTransitionException.class, () ->
                donationService.cancelDonation("don-123", "donor-123", "Changed mind")
        );
    }

    @Test
    @DisplayName("Non-owner user cannot edit or cancel listing (throws UnauthorizedException)")
    void testOwnershipPermissionCheck() {
        when(donationRepository.findById("don-123")).thenReturn(Optional.of(donation));
        User stranger = new User();
        stranger.setId("stranger-456");
        stranger.setRole(Role.DONOR);
        when(userRepository.findById("stranger-456")).thenReturn(Optional.of(stranger));

        DonationUpdateRequest updateReq = new DonationUpdateRequest();
        updateReq.setTitle("Hacked Title");

        assertThrows(UnauthorizedException.class, () ->
                donationService.updateDonation("don-123", updateReq, "stranger-456")
        );
    }
}
