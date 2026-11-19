package com.sharebite.service;

import com.sharebite.dto.MatchingResultDto;
import com.sharebite.model.Donation;
import com.sharebite.model.Organisation;
import com.sharebite.model.VerificationStatus;
import com.sharebite.repository.DonationRepository;
import com.sharebite.repository.OrganisationRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class MatchingService {

    private final OrganisationRepository organisationRepository;
    private final DonationRepository donationRepository;

    public MatchingService(OrganisationRepository organisationRepository, DonationRepository donationRepository) {
        this.organisationRepository = organisationRepository;
        this.donationRepository = donationRepository;
    }

    public List<MatchingResultDto> matchVerifiedNgosForDonation(String donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new IllegalArgumentException("Donation not found with id: " + donationId));

        List<Organisation> verifiedNgos = organisationRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
        List<MatchingResultDto> results = new ArrayList<>();

        for (Organisation ngo : verifiedNgos) {
            MatchingResultDto match = evaluateMatch(donation, ngo);
            results.add(match);
        }

        // Sort descending by overall score
        results.sort(Comparator.comparingDouble(MatchingResultDto::getOverallScore).reversed());
        return results;
    }

    public List<MatchingResultDto> matchAvailableDonationsForNgo(String ngoId) {
        Organisation ngo = organisationRepository.findById(ngoId)
                .orElseThrow(() -> new IllegalArgumentException("Organisation not found with id: " + ngoId));

        List<Donation> availableDonations = donationRepository.findByStatus(com.sharebite.model.DonationStatus.AVAILABLE);
        List<MatchingResultDto> results = new ArrayList<>();

        for (Donation donation : availableDonations) {
            MatchingResultDto match = evaluateMatch(donation, ngo);
            results.add(match);
        }

        results.sort(Comparator.comparingDouble(MatchingResultDto::getOverallScore).reversed());
        return results;
    }

    public MatchingResultDto evaluateMatch(Donation donation, Organisation ngo) {
        // 1. Calculate Haversine Distance in Kilometers
        double donLat = donation.getLocation() != null && donation.getLocation().getLatitude() != null
                ? donation.getLocation().getLatitude() : 40.7128;
        double donLng = donation.getLocation() != null && donation.getLocation().getLongitude() != null
                ? donation.getLocation().getLongitude() : -74.0060;

        double ngoLat = ngo.getGeoCoordinates() != null && ngo.getGeoCoordinates().getLatitude() != null
                ? ngo.getGeoCoordinates().getLatitude() : 40.7128;
        double ngoLng = ngo.getGeoCoordinates() != null && ngo.getGeoCoordinates().getLongitude() != null
                ? ngo.getGeoCoordinates().getLongitude() : -74.0060;

        double distanceKm = calculateHaversineDistance(donLat, donLng, ngoLat, ngoLng);

        // Distance Score (45% weight): Closer is better.
        // <=1km: 100; linearly decreases by 3 pts per km up to 30km; past 30km decays rapidly.
        double distanceScore;
        if (distanceKm <= 1.0) {
            distanceScore = 100.0;
        } else if (distanceKm <= 30.0) {
            distanceScore = Math.max(10.0, 100.0 - (distanceKm - 1.0) * 3.1);
        } else {
            distanceScore = Math.max(0.0, 10.0 - (distanceKm - 30.0) * 1.0);
        }

        // 2. Capacity Score (30% weight)
        int servings = donation.getEstimatedServings() != null ? donation.getEstimatedServings() : 10;
        int capacity = ngo.getCapacity() != null ? ngo.getCapacity() : 50;
        double capacityRatio = (double) capacity / (double) servings;

        double capacityScore;
        if (capacity >= servings) {
            // Can absorb all servings. Slight penalty if excessively oversized for small batch
            double excessFactor = Math.min(4.0, (capacity - servings) / (double) servings);
            capacityScore = Math.max(70.0, 100.0 - excessFactor * 7.5);
        } else {
            // Partial capacity
            capacityScore = Math.max(15.0, capacityRatio * 75.0);
        }

        // 3. Pickup Window / Urgency Score (25% weight)
        Instant now = Instant.now();
        double hoursRemaining = 0.0;
        if (donation.getPickupDeadline() != null) {
            Duration duration = Duration.between(now, donation.getPickupDeadline());
            hoursRemaining = Math.max(0.0, duration.toMinutes() / 60.0);
        }

        double urgencyScore;
        if (hoursRemaining <= 0.0) {
            urgencyScore = 0.0;
        } else if (hoursRemaining < 1.5) {
            // Imminent expiry: high urgency priority if close enough to pick up
            urgencyScore = (distanceKm <= 8.0) ? 98.0 : 45.0;
        } else if (hoursRemaining <= 4.0) {
            urgencyScore = 92.0; // Prime action window
        } else if (hoursRemaining <= 12.0) {
            urgencyScore = 80.0;
        } else {
            urgencyScore = 65.0; // Comfortable window
        }

        // Total weighted score
        double overallScore = (0.45 * distanceScore) + (0.30 * capacityScore) + (0.25 * urgencyScore);
        overallScore = Math.round(overallScore * 10.0) / 10.0;
        distanceKm = Math.round(distanceKm * 10.0) / 10.0;
        hoursRemaining = Math.round(hoursRemaining * 10.0) / 10.0;
        distanceScore = Math.round(distanceScore * 10.0) / 10.0;
        capacityScore = Math.round(capacityScore * 10.0) / 10.0;
        urgencyScore = Math.round(urgencyScore * 10.0) / 10.0;

        String explanation = String.format(
                "Proximity: %.1f km (Score: %.1f/100, W: 45%%) | Capacity: %d servings vs %d capacity (Score: %.1f/100, W: 30%%) | Window: %.1f hrs left (Score: %.1f/100, W: 25%%). Deterministic operational algorithm.",
                distanceKm, distanceScore, servings, capacity, capacityScore, hoursRemaining, urgencyScore
        );

        String formula = "Overall Score = 0.45 * DistanceScore + 0.30 * CapacityScore + 0.25 * WindowUrgencyScore";

        return new MatchingResultDto(
                donation, ngo, overallScore, distanceKm, distanceScore,
                capacityRatio, capacityScore, hoursRemaining, urgencyScore,
                explanation, formula
        );
    }

    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double EARTH_RADIUS_KM = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS_KM * c;
    }
}
