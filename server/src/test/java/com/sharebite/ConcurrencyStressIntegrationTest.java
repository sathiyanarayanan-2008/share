package com.sharebite;

import com.sharebite.dto.ClaimRequest;
import com.sharebite.exception.DonationAlreadyReservedException;
import com.sharebite.model.*;
import com.sharebite.repository.*;
import com.sharebite.service.ClaimService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/sharebite_concurrency_audit",
    "sharebite.seed-demo-data=false"
})
class ConcurrencyStressIntegrationTest {

    @Autowired private ClaimService claimService;
    @Autowired private DonationRepository donationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OrganisationRepository organisationRepository;
    @Autowired private ClaimRepository claimRepository;

    private String donationId;

    @BeforeEach
    void setUp() {
        claimRepository.deleteAll();
        donationRepository.deleteAll();
        userRepository.deleteAll();
        organisationRepository.deleteAll();

        // Seed 1 verified NGO organisation
        Organisation org = new Organisation();
        org.setId("org-stress-pantry");
        org.setName("Stress Test Pantry");
        org.setVerificationStatus(VerificationStatus.VERIFIED);
        org.setCapacity(500);
        organisationRepository.save(org);

        // Seed 20 distinct NGO user accounts
        for (int i = 1; i <= 20; i++) {
            User ngoUser = new User();
            ngoUser.setId("ngo-user-" + i);
            ngoUser.setName("NGO Representative " + i);
            ngoUser.setEmail("ngo" + i + "@stress.test");
            ngoUser.setRole(Role.NGO);
            ngoUser.setOrganisationId("org-stress-pantry");
            ngoUser.setVerificationStatus(VerificationStatus.VERIFIED);
            userRepository.save(ngoUser);
        }

        // Seed 1 AVAILABLE listing
        Donation donation = new Donation();
        donation.setTitle("High Demand Gourmet Surplus Trays");
        donation.setFoodCategory(FoodCategory.COOKED_MEALS);
        donation.setQuantity(50.0);
        donation.setUnit("portions");
        donation.setEstimatedServings(50);
        donation.setStorageConditions(StorageCondition.HOT_HELD);
        donation.setPickupDeadline(Instant.now().plus(4, ChronoUnit.HOURS));
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setDonorId("donor-999");
        Donation saved = donationRepository.save(donation);
        donationId = saved.getId();
    }

    @AfterEach
    void tearDown() {
        claimRepository.deleteAll();
        donationRepository.deleteAll();
    }

    @Test
    @DisplayName("Concurrency: 20 simultaneous threads racing for 1 listing must produce exactly 1 claim and 19 conflicts")
    void testSimultaneousReservationRace() throws InterruptedException {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch endGate = new CountDownLatch(threadCount);

        AtomicInteger successCounter = new AtomicInteger(0);
        AtomicInteger conflictCounter = new AtomicInteger(0);

        for (int i = 1; i <= threadCount; i++) {
            final String userId = "ngo-user-" + i;
            executor.submit(() -> {
                try {
                    startGate.await(); // Hold all threads until release
                    ClaimRequest request = new ClaimRequest(50, true);
                    claimService.reserveDonation(donationId, request, userId);
                    successCounter.incrementAndGet();
                } catch (DonationAlreadyReservedException conflict) {
                    conflictCounter.incrementAndGet();
                } catch (Exception e) {
                    // unexpected exception
                } finally {
                    endGate.countDown();
                }
            });
        }

        startGate.countDown(); // Fire all 20 requests simultaneously
        boolean finished = endGate.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertEquals(true, finished, "All threads should complete within 10 seconds");
        assertEquals(1, successCounter.get(), "Exactly one reservation must succeed");
        assertEquals(19, conflictCounter.get(), "Remaining 19 concurrent requests must receive 409 Conflict");

        Donation finalDonationState = donationRepository.findById(donationId).orElseThrow();
        assertEquals(DonationStatus.RESERVED, finalDonationState.getStatus());
        assertEquals(1, claimRepository.findAll().size(), "Database must persist exactly one Claim document");
    }
}
