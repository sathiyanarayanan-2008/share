package com.sharebite.service;

import com.sharebite.dto.ClaimRequest;
import com.sharebite.exception.BadRequestException;
import com.sharebite.exception.DonationAlreadyReservedException;
import com.sharebite.exception.InvalidStateTransitionException;
import com.sharebite.exception.ResourceNotFoundException;
import com.sharebite.exception.UnauthorizedException;
import com.sharebite.model.*;
import com.sharebite.repository.ClaimRepository;
import com.sharebite.repository.DonationRepository;
import com.sharebite.repository.OrganisationRepository;
import com.sharebite.repository.UserRepository;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ClaimService {

    private final MongoOperations mongoOperations;
    private final ClaimRepository claimRepository;
    private final DonationRepository donationRepository;
    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ClaimService(MongoOperations mongoOperations,
                        ClaimRepository claimRepository,
                        DonationRepository donationRepository,
                        OrganisationRepository organisationRepository,
                        UserRepository userRepository,
                        AuditService auditService,
                        NotificationService notificationService) {
        this.mongoOperations = mongoOperations;
        this.claimRepository = claimRepository;
        this.donationRepository = donationRepository;
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public Claim reserveDonation(String donationId, ClaimRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.NGO && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only registered NGOs can reserve donations");
        }

        String ngoId = user.getOrganisationId() != null ? user.getOrganisationId() : user.getId();
        String ngoName = user.getName();

        if (user.getOrganisationId() != null) {
            Organisation org = organisationRepository.findById(user.getOrganisationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organisation profile not found"));

            if (org.getVerificationStatus() != VerificationStatus.VERIFIED && user.getRole() != Role.ADMIN) {
                throw new UnauthorizedException("Your organisation verification is pending approval by admin before reserving food");
            }
            ngoName = org.getName();
        }

        if (!request.isSafetyAcknowledgementAccepted()) {
            throw new BadRequestException("You must acknowledge the food safety handling requirements and inspection checklist");
        }

        // ATOMIC RESERVATION via MongoDB findAndModify
        Query query = new Query(Criteria.where("id").is(donationId).and("status").is(DonationStatus.AVAILABLE));
        Update update = new Update()
                .set("status", DonationStatus.RESERVED)
                .set("claimedByNgoId", ngoId)
                .set("claimedByNgoName", ngoName);

        Donation reservedDonation = mongoOperations.findAndModify(
                query, update, FindAndModifyOptions.options().returnNew(true), Donation.class
        );

        if (reservedDonation == null) {
            // Check if donation even exists or was taken
            Donation existing = donationRepository.findById(donationId).orElse(null);
            if (existing == null) {
                throw new ResourceNotFoundException("Donation not found with id: " + donationId);
            }
            throw new DonationAlreadyReservedException("This donation is no longer available. It has already been claimed or cancelled.");
        }

        // Create Claim Record
        int servings = request.getAllocatedServings() != null ? request.getAllocatedServings() : reservedDonation.getEstimatedServings();
        Claim claim = new Claim(null, donationId, ngoId, ngoName, servings, true);
        Claim savedClaim = claimRepository.save(claim);

        // Audit & Notifications
        auditService.logEvent(user.getId(), user.getName(), user.getRole().name(),
                "CLAIM", savedClaim.getId(), "RESERVED",
                "Atomically reserved donation '" + reservedDonation.getTitle() + "' for NGO: " + ngoName);

        // Notify Donor
        notificationService.sendNotification(reservedDonation.getDonorId(), "Donation Claimed!",
                "Your listing '" + reservedDonation.getTitle() + "' was successfully reserved by " + ngoName + ". A volunteer will be dispatched for pickup.",
                "CLAIM");

        // Notify Claiming NGO
        notificationService.sendNotification(user.getId(), "Reservation Confirmed",
                "You reserved '" + reservedDonation.getTitle() + "'. A volunteer can now be assigned for pickup.",
                "CLAIM");

        return savedClaim;
    }

    public Claim cancelClaim(String claimId, String userId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isOwner = (user.getOrganisationId() != null && user.getOrganisationId().equals(claim.getNgoId()))
                || user.getId().equals(claim.getNgoId());

        if (!isOwner && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You do not have permission to cancel this claim");
        }

        if (claim.getStatus() != ClaimStatus.RESERVED) {
            throw new InvalidStateTransitionException("Cannot cancel claim in status: " + claim.getStatus());
        }

        claim.setStatus(ClaimStatus.CANCELLED);
        Claim updatedClaim = claimRepository.save(claim);

        // Revert donation status to AVAILABLE
        donationRepository.findById(claim.getDonationId()).ifPresent(d -> {
            d.setStatus(DonationStatus.AVAILABLE);
            d.setClaimedByNgoId(null);
            d.setClaimedByNgoName(null);
            donationRepository.save(d);
        });

        auditService.logEvent(userId, "User", "NGO", "CLAIM", claim.getId(), "CANCELLED", "Claim cancelled, donation returned to available pool");

        return updatedClaim;
    }

    public List<Claim> getClaimsByNgo(String ngoId) {
        return claimRepository.findByNgoId(ngoId);
    }

    public Claim getByDonationId(String donationId) {
        return claimRepository.findByDonationId(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("No active claim for donation: " + donationId));
    }
}
