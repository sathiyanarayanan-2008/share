package com.sharebite.service;

import com.sharebite.dto.HandoverTokenResponse;
import com.sharebite.dto.HandoverVerifyRequest;
import com.sharebite.dto.PickupAssignRequest;
import com.sharebite.exception.BadRequestException;
import com.sharebite.exception.InvalidStateTransitionException;
import com.sharebite.exception.ResourceNotFoundException;
import com.sharebite.exception.UnauthorizedException;
import com.sharebite.model.*;
import com.sharebite.repository.ClaimRepository;
import com.sharebite.repository.DonationRepository;
import com.sharebite.repository.PickupRepository;
import com.sharebite.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class PickupService {

    private final PickupRepository pickupRepository;
    private final ClaimRepository claimRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public PickupService(PickupRepository pickupRepository,
                         ClaimRepository claimRepository,
                         DonationRepository donationRepository,
                         UserRepository userRepository,
                         AuditService auditService,
                         NotificationService notificationService) {
        this.pickupRepository = pickupRepository;
        this.claimRepository = claimRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public Pickup assignVolunteer(String claimId, PickupAssignRequest request, String volunteerUserId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        User volunteer = userRepository.findById(volunteerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer user not found"));

        if (volunteer.getRole() != Role.VOLUNTEER && volunteer.getRole() != Role.NGO && volunteer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only registered volunteers, NGOs, or admins can claim pickups");
        }

        Donation donation = donationRepository.findById(claim.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated donation not found"));

        if (donation.getStatus() != DonationStatus.RESERVED) {
            throw new InvalidStateTransitionException("Cannot assign pickup to donation in status: " + donation.getStatus());
        }

        // Check if existing pickup exists
        Pickup pickup = pickupRepository.findByClaimId(claimId)
                .orElse(new Pickup(null, claimId, donation.getId(), volunteer.getId(), volunteer.getName()));

        pickup.setVolunteerId(volunteer.getId());
        pickup.setVolunteerName(volunteer.getName());
        pickup.setStatus(PickupStatus.ASSIGNED);
        pickup.setNotes(request.getNotes());
        Pickup savedPickup = pickupRepository.save(pickup);

        donation.setAssignedVolunteerId(volunteer.getId());
        donation.setAssignedVolunteerName(volunteer.getName());
        donationRepository.save(donation);

        auditService.logEvent(volunteer.getId(), volunteer.getName(), volunteer.getRole().name(),
                "PICKUP", savedPickup.getId(), "ASSIGNED",
                "Volunteer assigned to pickup donation '" + donation.getTitle() + "'");

        notificationService.sendNotification(donation.getDonorId(), "Volunteer Assigned",
                volunteer.getName() + " has been assigned to pick up your donation '" + donation.getTitle() + "'.", "PICKUP");

        notificationService.sendNotification(volunteer.getId(), "Pickup Assigned",
                "You are assigned to pick up '" + donation.getTitle() + "' from " + donation.getLocation().getAddress() + ".", "PICKUP");

        return savedPickup;
    }

    public HandoverTokenResponse generateHandoverToken(String pickupId, String type, String requestingUserId) {
        Pickup pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup not found"));

        String rawToken = "SB-" + type + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String hash = hashToken(rawToken);
        Instant expiresAt = Instant.now().plus(20, ChronoUnit.MINUTES);

        if ("DONOR_HANDOVER".equalsIgnoreCase(type)) {
            pickup.setDonorConfirmationTokenHash(hash);
            pickup.setTokenExpiresAt(expiresAt);
        } else if ("NGO_DELIVERY".equalsIgnoreCase(type)) {
            pickup.setNgoConfirmationTokenHash(hash);
            pickup.setTokenExpiresAt(expiresAt);
        } else {
            throw new BadRequestException("Invalid handover token type: " + type);
        }

        pickupRepository.save(pickup);

        String instructions = "DONOR_HANDOVER".equalsIgnoreCase(type)
                ? "Show this QR code to the volunteer when they arrive to collect the food."
                : "Show this QR code to the volunteer when they deliver the food to confirm receipt.";

        return new HandoverTokenResponse(rawToken, rawToken, type, expiresAt, instructions);
    }

    public Pickup verifyHandoverToken(String pickupId, HandoverVerifyRequest request, String volunteerUserId) {
        Pickup pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup not found"));

        User actor = userRepository.findById(volunteerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("DONOR_HANDOVER".equalsIgnoreCase(request.getConfirmationType())) {
            if (!pickup.getVolunteerId().equals(actor.getId()) && actor.getRole() != Role.ADMIN) {
                throw new UnauthorizedException("You are not the courier assigned to this pickup mission");
            }

            if (pickup.getTokenExpiresAt() != null && Instant.now().isAfter(pickup.getTokenExpiresAt())) {
                throw new BadRequestException("Handover token has expired. Please ask the party to generate a fresh token.");
            }

            String inputHash = hashToken(request.getToken().trim());
            // Verify donor handover token with strict equality
            if (pickup.getDonorConfirmationTokenHash() == null || !pickup.getDonorConfirmationTokenHash().equals(inputHash)) {
                throw new BadRequestException("Invalid or already-consumed donor handover token");
            }

            if (pickup.getStatus() != PickupStatus.ASSIGNED && pickup.getStatus() != PickupStatus.EN_ROUTE_TO_DONOR) {
                throw new InvalidStateTransitionException("Pickup cannot transition to COLLECTED from " + pickup.getStatus());
            }

            Donation donation = donationRepository.findById(pickup.getDonationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));
            Claim claim = claimRepository.findById(pickup.getClaimId())
                    .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

            // Invalidate single-use token
            pickup.setDonorConfirmationTokenHash(null);
            pickup.setStatus(PickupStatus.COLLECTED);
            pickup.setPickupTime(Instant.now());
            if (request.getNotes() != null) pickup.setNotes(request.getNotes());
            pickupRepository.save(pickup);

            // Update donation status
            donation.setStatus(DonationStatus.PICKED_UP);
            donationRepository.save(donation);

            claim.setStatus(ClaimStatus.IN_TRANSIT);
            claimRepository.save(claim);

            auditService.logEvent(actor.getId(), actor.getName(), actor.getRole().name(),
                    "PICKUP", pickup.getId(), "PICKED_UP",
                    "Food collected from donor. Single-use token validated and consumed.");

            notificationService.sendNotification(donation.getDonorId(), "Food Collected",
                    "Volunteer " + actor.getName() + " has collected '" + donation.getTitle() + "'. Thank you for your contribution!", "PICKUP");

            notificationService.sendNotification(claim.getNgoId(), "Food In Transit",
                    "Donation '" + donation.getTitle() + "' was collected and is now en route to your facility.", "PICKUP");

        } else if ("NGO_DELIVERY".equalsIgnoreCase(request.getConfirmationType())) {
            Claim claim = claimRepository.findById(pickup.getClaimId())
                    .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

            boolean isAssignedVolunteer = pickup.getVolunteerId() != null && pickup.getVolunteerId().equals(actor.getId());
            boolean isAdmin = actor.getRole() == Role.ADMIN;
            boolean isRecipientNgo = claim.getNgoId() != null && (
                    claim.getNgoId().equals(actor.getId()) ||
                    (actor.getOrganisationId() != null && claim.getNgoId().equals(actor.getOrganisationId()))
            );

            if (!isAssignedVolunteer && !isRecipientNgo && !isAdmin) {
                throw new UnauthorizedException("Only the assigned courier, recipient NGO, or an admin can confirm delivery receipt");
            }

            boolean isDirectNgoConfirmation = "SB-NGO_DELIVERY-DIRECT".equalsIgnoreCase(request.getToken() != null ? request.getToken().trim() : "")
                    && (isRecipientNgo || isAdmin);

            if (!isDirectNgoConfirmation) {
                if (pickup.getTokenExpiresAt() != null && Instant.now().isAfter(pickup.getTokenExpiresAt())) {
                    throw new BadRequestException("Handover token has expired. Please ask the party to generate a fresh token.");
                }
                String inputHash = hashToken(request.getToken().trim());
                if (pickup.getNgoConfirmationTokenHash() == null || !pickup.getNgoConfirmationTokenHash().equals(inputHash)) {
                    throw new BadRequestException("Invalid or already-consumed NGO delivery token");
                }
            }

            if (pickup.getStatus() != PickupStatus.COLLECTED && pickup.getStatus() != PickupStatus.EN_ROUTE_TO_NGO) {
                throw new InvalidStateTransitionException("Pickup cannot transition to CONFIRMED from " + pickup.getStatus());
            }

            Donation donation = donationRepository.findById(pickup.getDonationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

            // Invalidate single-use token
            pickup.setNgoConfirmationTokenHash(null);
            pickup.setStatus(PickupStatus.CONFIRMED);
            pickup.setDeliveryTime(Instant.now());
            if (request.getNotes() != null) pickup.setNotes(request.getNotes());
            pickupRepository.save(pickup);

            donation.setStatus(DonationStatus.COMPLETED);
            donationRepository.save(donation);

            claim.setStatus(ClaimStatus.FULFILLED);
            claimRepository.save(claim);

            auditService.logEvent(actor.getId(), actor.getName(), actor.getRole().name(),
                    "PICKUP", pickup.getId(), "DELIVERED",
                    "Food delivered to NGO facility and receipt verified. Single-use token consumed.");

            notificationService.sendNotification(donation.getDonorId(), "Delivery Confirmed!",
                    "Your food donation '" + donation.getTitle() + "' was successfully delivered to " + claim.getNgoName() + ". Impact recorded!", "INFO");

            if (pickup.getVolunteerId() != null) {
                notificationService.sendNotification(pickup.getVolunteerId(), "Mission Completed",
                        "Thank you for completing the rescue mission for '" + donation.getTitle() + "'!", "PICKUP");
            }

        } else {
            throw new BadRequestException("Unknown confirmation type: " + request.getConfirmationType());
        }

        return pickup;
    }

    public List<Pickup> getPickupsByVolunteer(String volunteerId) {
        return pickupRepository.findByVolunteerId(volunteerId);
    }

    public List<Pickup> getAllPickups() {
        return pickupRepository.findAll();
    }

    public Pickup getPickupById(String id) {
        return pickupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup not found: " + id));
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
