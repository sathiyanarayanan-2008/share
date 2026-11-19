package com.sharebite.controller;

import com.sharebite.dto.AdminVerifyOrgRequest;
import com.sharebite.dto.ImpactAnalyticsDto;
import com.sharebite.dto.ReportRequest;
import com.sharebite.model.*;
import com.sharebite.repository.OrganisationRepository;
import com.sharebite.service.AdminService;
import com.sharebite.service.AuditService;
import com.sharebite.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final OrganisationRepository organisationRepository;
    private final DonationService donationService;
    private final AuditService auditService;

    public AdminController(AdminService adminService,
                           OrganisationRepository organisationRepository,
                           DonationService donationService,
                           AuditService auditService) {
        this.adminService = adminService;
        this.organisationRepository = organisationRepository;
        this.donationService = donationService;
        this.auditService = auditService;
    }

    @GetMapping("/organisations/pending")
    public ResponseEntity<List<Organisation>> getPendingOrganisations() {
        return ResponseEntity.ok(organisationRepository.findByVerificationStatus(VerificationStatus.PENDING));
    }

    @PostMapping("/organisations/{id}/verify")
    public ResponseEntity<Organisation> verifyOrganisation(
            @PathVariable String id,
            @Valid @RequestBody AdminVerifyOrgRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(adminService.verifyOrganisation(id, request, user.getId()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ImpactAnalyticsDto> getImpactAnalytics() {
        return ResponseEntity.ok(adminService.getImpactAnalytics());
    }

    @GetMapping("/donations")
    public ResponseEntity<List<Donation>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Report>> getReports() {
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<Report> resolveReport(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        String status = payload.getOrDefault("status", "RESOLVED");
        return ResponseEntity.ok(adminService.resolveReport(id, status, user.getId()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditEvent>> getAuditLogs() {
        return ResponseEntity.ok(auditService.getRecentEvents());
    }
}
