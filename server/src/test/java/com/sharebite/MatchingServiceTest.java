package com.sharebite;

import com.sharebite.dto.MatchingResultDto;
import com.sharebite.model.*;
import com.sharebite.repository.DonationRepository;
import com.sharebite.repository.OrganisationRepository;
import com.sharebite.service.MatchingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private OrganisationRepository organisationRepository;

    @Mock
    private DonationRepository donationRepository;

    @InjectMocks
    private MatchingService matchingService;

    private Donation donation;
    private Organisation ngo;

    @BeforeEach
    void setUp() {
        donation = new Donation();
        donation.setId("don-test");
        donation.setTitle("Test Surplus Meals");
        donation.setEstimatedServings(50);
        donation.setPickupDeadline(Instant.now().plus(3, ChronoUnit.HOURS));
        donation.setLocation(new Location("Location A", 40.7128, -74.0060));

        ngo = new Organisation();
        ngo.setId("ngo-test");
        ngo.setName("Community Food Bank");
        ngo.setCapacity(60);
        ngo.setGeoCoordinates(new GeoCoordinates(40.7180, -74.0010)); // ~0.7 km away
    }

    @Test
    @DisplayName("Haversine distance calculates accurate geographic distance")
    void testHaversineDistance() {
        // NYC to Jersey City is approximately 4 to 6 km
        double distance = matchingService.calculateHaversineDistance(40.7128, -74.0060, 40.7282, -74.0776);
        assertTrue(distance > 3.0 && distance < 10.0, "Distance should be between 3km and 10km");
    }

    @Test
    @DisplayName("Deterministic scoring produces score in 0..100 range with full explanation breakdown")
    void testEvaluateMatchScoring() {
        MatchingResultDto result = matchingService.evaluateMatch(donation, ngo);

        assertNotNull(result);
        assertTrue(result.getOverallScore() >= 0 && result.getOverallScore() <= 100);
        assertTrue(result.getDistanceKm() >= 0);
        assertTrue(result.getDistanceScore() > 80, "Proximity under 1km should give high distance score");
        assertTrue(result.getCapacityScore() > 70, "Capacity 60 for 50 servings should yield high capacity score");
        assertTrue(result.getUrgencyScore() > 70, "3 hour window should yield high urgency score");
        assertNotNull(result.getExplanation());
        assertTrue(result.getExplanation().contains("Deterministic operational algorithm"));
        assertNotNull(result.getFormula());
    }

    @Test
    @DisplayName("Distant NGO receives a lower proximity score according to formula")
    void testDistantNgoReceivesLowerScore() {
        Organisation distantNgo = new Organisation();
        distantNgo.setId("ngo-distant");
        distantNgo.setCapacity(60);
        distantNgo.setGeoCoordinates(new GeoCoordinates(40.9500, -73.7000)); // ~35 km away

        MatchingResultDto nearResult = matchingService.evaluateMatch(donation, ngo);
        MatchingResultDto distantResult = matchingService.evaluateMatch(donation, distantNgo);

        assertTrue(nearResult.getOverallScore() > distantResult.getOverallScore(),
                "Nearby NGO score (" + nearResult.getOverallScore() + ") must exceed distant NGO score (" + distantResult.getOverallScore() + ")");
    }
}
