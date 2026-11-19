package com.sharebite.controller;

import com.sharebite.dto.HandoverTokenResponse;
import com.sharebite.dto.HandoverVerifyRequest;
import com.sharebite.dto.PickupAssignRequest;
import com.sharebite.model.Pickup;
import com.sharebite.model.PickupStatus;
import com.sharebite.model.User;
import com.sharebite.service.PickupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickups")
public class PickupController {

    private final PickupService pickupService;

    public PickupController(PickupService pickupService) {
        this.pickupService = pickupService;
    }

    @PostMapping("/{claimId}/assign")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'NGO', 'ADMIN')")
    public ResponseEntity<Pickup> assignVolunteer(
            @PathVariable String claimId,
            @RequestBody(required = false) PickupAssignRequest request,
            @AuthenticationPrincipal User user) {
        if (request == null) request = new PickupAssignRequest("");
        return ResponseEntity.ok(pickupService.assignVolunteer(claimId, request, user.getId()));
    }

    @PostMapping("/{pickupId}/token")
    public ResponseEntity<HandoverTokenResponse> generateToken(
            @PathVariable String pickupId,
            @RequestParam(defaultValue = "DONOR_HANDOVER") String type,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(pickupService.generateHandoverToken(pickupId, type, user.getId()));
    }

    @PostMapping("/{pickupId}/verify")
    public ResponseEntity<Pickup> verifyHandover(
            @PathVariable String pickupId,
            @Valid @RequestBody HandoverVerifyRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(pickupService.verifyHandoverToken(pickupId, request, user.getId()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<List<Pickup>> getMyPickups(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(pickupService.getPickupsByVolunteer(user.getId()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Pickup>> getAllPickups() {
        return ResponseEntity.ok(pickupService.getAllPickups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pickup> getPickupById(@PathVariable String id) {
        return ResponseEntity.ok(pickupService.getPickupById(id));
    }
}
