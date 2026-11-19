package com.sharebite.service;

import com.sharebite.dto.DonationCreateRequest;
import com.sharebite.dto.DonationUpdateRequest;
import com.sharebite.exception.BadRequestException;
import com.sharebite.exception.InvalidStateTransitionException;
import com.sharebite.exception.ResourceNotFoundException;
import com.sharebite.exception.UnauthorizedException;
import com.sharebite.model.*;
import com.sharebite.repository.DonationRepository;
import com.sharebite.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public DonationService(DonationRepository donationRepository,
                           UserRepository userRepository,
                           AuditService auditService,
                           NotificationService notificationService) {
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public Donation createDonation(DonationCreateRequest request, String donorUserId) {
        User donor = userRepository.findById(donorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));

        if (donor.getRole() != Role.DONOR && donor.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only users with role DONOR can list food donations");
        }

        // Validate timestamps
        if (request.getPickupDeadline().isBefore(request.getPickupStart())) {
            throw new BadRequestException("Pickup deadline must be after pickup start time");
        }

        Donation donation = new Donation();
        donation.setDonorId(donor.getId());
        donation.setDonorName(donor.getName());
        donation.setTitle(request.getTitle());
        donation.setFoodCategory(request.getFoodCategory());
        donation.setQuantity(request.getQuantity());
        donation.setUnit(request.getUnit());
        donation.setEstimatedServings(request.getEstimatedServings());
        donation.setPreparationTime(request.getPreparationTime());
        donation.setSafeHandlingNotes(request.getSafeHandlingNotes());
        donation.setPickupStart(request.getPickupStart());
        donation.setPickupDeadline(request.getPickupDeadline());
        donation.setStorageConditions(request.getStorageConditions());
        donation.setLocation(new Location(request.getAddress(), request.getLatitude(), request.getLongitude()));
        donation.setStatus(DonationStatus.AVAILABLE);

        Donation saved = donationRepository.save(donation);

        auditService.logEvent(donor.getId(), donor.getName(), donor.getRole().name(),
                "DONATION", saved.getId(), "CREATED", "Created food listing: " + saved.getTitle());

        notificationService.sendNotification(donor.getId(), "Listing Published",
                "Your donation '" + saved.getTitle() + "' is now live for verified NGOs to review and reserve.", "INFO");

        return saved;
    }

    public Donation updateDonation(String donationId, DonationUpdateRequest request, String userId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (!donation.getDonorId().equals(userId)) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getRole() != Role.ADMIN) {
                throw new UnauthorizedException("You do not have permission to edit this listing");
            }
        }

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new InvalidStateTransitionException("Cannot edit donation once it has been claimed or processed (Current status: " + donation.getStatus() + ")");
        }

        if (request.getTitle() != null) donation.setTitle(request.getTitle());
        if (request.getFoodCategory() != null) donation.setFoodCategory(request.getFoodCategory());
        if (request.getQuantity() != null) donation.setQuantity(request.getQuantity());
        if (request.getUnit() != null) donation.setUnit(request.getUnit());
        if (request.getEstimatedServings() != null) donation.setEstimatedServings(request.getEstimatedServings());
        if (request.getPreparationTime() != null) donation.setPreparationTime(request.getPreparationTime());
        if (request.getSafeHandlingNotes() != null) donation.setSafeHandlingNotes(request.getSafeHandlingNotes());
        if (request.getPickupStart() != null) donation.setPickupStart(request.getPickupStart());
        if (request.getPickupDeadline() != null) donation.setPickupDeadline(request.getPickupDeadline());
        if (request.getStorageConditions() != null) donation.setStorageConditions(request.getStorageConditions());

        if (request.getAddress() != null || request.getLatitude() != null || request.getLongitude() != null) {
            String addr = request.getAddress() != null ? request.getAddress() : donation.getLocation().getAddress();
            Double lat = request.getLatitude() != null ? request.getLatitude() : donation.getLocation().getLatitude();
            Double lng = request.getLongitude() != null ? request.getLongitude() : donation.getLocation().getLongitude();
            donation.setLocation(new Location(addr, lat, lng));
        }

        Donation updated = donationRepository.save(donation);
        auditService.logEvent(userId, donation.getDonorName(), "DONOR",
                "DONATION", updated.getId(), "UPDATED", "Updated listing details");

        return updated;
    }

    public Donation cancelDonation(String donationId, String userId, String reason) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!donation.getDonorId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only the owner or an admin can cancel this listing");
        }

        if (donation.getStatus() == DonationStatus.PICKED_UP || donation.getStatus() == DonationStatus.COMPLETED) {
            throw new InvalidStateTransitionException("Cannot cancel donation that is already in transit or completed");
        }

        donation.setStatus(DonationStatus.CANCELLED);
        Donation saved = donationRepository.save(donation);

        auditService.logEvent(user.getId(), user.getName(), user.getRole().name(),
                "DONATION", saved.getId(), "CANCELLED", "Cancelled donation. Reason: " + (reason != null ? reason : "None provided"));

        notificationService.sendNotification(donation.getDonorId(), "Donation Cancelled",
                "Your donation '" + donation.getTitle() + "' was marked cancelled.", "ALERT");

        return saved;
    }

    public Donation getById(String id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
    }

    public List<Donation> getAvailableDonations() {
        return donationRepository.findByStatus(DonationStatus.AVAILABLE);
    }

    public List<Donation> getAvailableDonations(Double lat, Double lng, Double radiusKm) {
        List<Donation> allAvailable = donationRepository.findByStatus(DonationStatus.AVAILABLE);
        if (lat == null || lng == null || radiusKm == null || radiusKm <= 0) {
            return allAvailable;
        }
        Instant now = Instant.now();
        return allAvailable.stream()
                .filter(d -> d.getPickupDeadline() == null || d.getPickupDeadline().isAfter(now))
                .filter(d -> d.getLocation() != null && d.getLocation().getLatitude() != null && d.getLocation().getLongitude() != null)
                .filter(d -> {
                    double dist = calculateDistance(lat, lng, d.getLocation().getLatitude(), d.getLocation().getLongitude());
                    return dist <= radiusKm;
                })
                .toList();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double EARTH_RADIUS_KM = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);
        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS_KM * c;
    }

    public List<Donation> getDonationsByDonor(String donorId) {
        return donationRepository.findByDonorId(donorId);
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }
}
