package com.sharebite.controller;

import com.sharebite.dto.ClaimRequest;
import com.sharebite.model.Claim;
import com.sharebite.model.User;
import com.sharebite.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping("/{donationId}")
    @PreAuthorize("hasAnyRole('NGO', 'ADMIN')")
    public ResponseEntity<Claim> reserveDonation(
            @PathVariable String donationId,
            @Valid @RequestBody ClaimRequest request,
            @AuthenticationPrincipal User user) {
        Claim claim = claimService.reserveDonation(donationId, request, user.getId());
        return new ResponseEntity<>(claim, HttpStatus.CREATED);
    }

    @PostMapping("/{claimId}/cancel")
    @PreAuthorize("hasAnyRole('NGO', 'ADMIN')")
    public ResponseEntity<Claim> cancelClaim(
            @PathVariable String claimId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.cancelClaim(claimId, user.getId()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('NGO', 'ADMIN')")
    public ResponseEntity<List<Claim>> getMyClaims(@AuthenticationPrincipal User user) {
        String ngoId = user.getOrganisationId() != null ? user.getOrganisationId() : user.getId();
        return ResponseEntity.ok(claimService.getClaimsByNgo(ngoId));
    }

    @GetMapping("/by-donation/{donationId}")
    public ResponseEntity<Claim> getByDonationId(@PathVariable String donationId) {
        return ResponseEntity.ok(claimService.getByDonationId(donationId));
    }
}
