package com.sharebite.controller;

import com.sharebite.dto.DonationCreateRequest;
import com.sharebite.dto.DonationUpdateRequest;
import com.sharebite.dto.MatchingResultDto;
import com.sharebite.model.Donation;
import com.sharebite.model.User;
import com.sharebite.service.DonationService;
import com.sharebite.service.MatchingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;
    private final MatchingService matchingService;

    public DonationController(DonationService donationService, MatchingService matchingService) {
        this.donationService = donationService;
        this.matchingService = matchingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<Donation> createDonation(
            @Valid @RequestBody DonationCreateRequest request,
            @AuthenticationPrincipal User user) {
        Donation created = donationService.createDonation(request, user.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Donation>> getAvailableDonations(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radiusKm) {
        return ResponseEntity.ok(donationService.getAvailableDonations(lat, lng, radiusKm));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<List<Donation>> getMyDonations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(donationService.getDonationsByDonor(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(@PathVariable String id) {
        return ResponseEntity.ok(donationService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<Donation> updateDonation(
            @PathVariable String id,
            @RequestBody DonationUpdateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(donationService.updateDonation(id, request, user.getId()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Donation> cancelDonation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        String reason = payload != null ? payload.get("reason") : "Donor cancelled";
        return ResponseEntity.ok(donationService.cancelDonation(id, user.getId(), reason));
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<MatchingResultDto>> getMatchingNgosForDonation(@PathVariable String id) {
        return ResponseEntity.ok(matchingService.matchVerifiedNgosForDonation(id));
    }

    @GetMapping("/matches-for-ngo")
    @PreAuthorize("hasAnyRole('NGO', 'ADMIN')")
    public ResponseEntity<List<MatchingResultDto>> getMatchesForNgo(@AuthenticationPrincipal User user) {
        String ngoId = user.getOrganisationId() != null ? user.getOrganisationId() : user.getId();
        return ResponseEntity.ok(matchingService.matchAvailableDonationsForNgo(ngoId));
    }
}
