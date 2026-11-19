package com.sharebite.service;

import com.sharebite.dto.AdminVerifyOrgRequest;
import com.sharebite.dto.ImpactAnalyticsDto;
import com.sharebite.dto.ReportRequest;
import com.sharebite.exception.ResourceNotFoundException;
import com.sharebite.model.*;
import com.sharebite.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final OrganisationRepository organisationRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AdminService(OrganisationRepository organisationRepository,
                        DonationRepository donationRepository,
                        UserRepository userRepository,
                        ReportRepository reportRepository,
                        NotificationService notificationService,
                        AuditService auditService) {
        this.organisationRepository = organisationRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public Organisation verifyOrganisation(String orgId, AdminVerifyOrgRequest request, String adminUserId) {
        Organisation org = organisationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organisation not found with id: " + orgId));

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        org.setVerificationStatus(request.getStatus());
        Organisation savedOrg = organisationRepository.save(org);

        // Also update any affiliated users' verificationStatus
        userRepository.findAll().stream()
                .filter(u -> orgId.equals(u.getOrganisationId()))
                .forEach(u -> {
                    u.setVerificationStatus(request.getStatus());
                    userRepository.save(u);
                    notificationService.sendNotification(u.getId(), "Verification Status Updated",
                            "Your organisation '" + org.getName() + "' verification was marked: " + request.getStatus() +
                                    (request.getNotes() != null ? " (" + request.getNotes() + ")" : ""), "VERIFICATION");
                });

        auditService.logEvent(admin.getId(), admin.getName(), "ADMIN",
                "ORGANISATION", org.getId(), request.getStatus().name(),
                "Organisation verification status changed to " + request.getStatus() + ". Notes: " + request.getNotes());

        return savedOrg;
    }

    public ImpactAnalyticsDto getImpactAnalytics() {
        List<Donation> allDonations = donationRepository.findAll();
        long totalDonations = allDonations.size();
        long active = allDonations.stream().filter(d -> d.getStatus() == DonationStatus.AVAILABLE).count();
        long reserved = allDonations.stream().filter(d -> d.getStatus() == DonationStatus.RESERVED).count();
        long inTransit = allDonations.stream().filter(d -> d.getStatus() == DonationStatus.PICKED_UP).count();
        long completed = allDonations.stream().filter(d -> d.getStatus() == DonationStatus.COMPLETED).count();
        long cancelled = allDonations.stream().filter(d -> d.getStatus() == DonationStatus.CANCELLED).count();

        // Calculate meals rescued from completed & in-transit donations
        long mealsRescued = allDonations.stream()
                .filter(d -> d.getStatus() == DonationStatus.COMPLETED || d.getStatus() == DonationStatus.PICKED_UP)
                .mapToLong(d -> d.getEstimatedServings() != null ? d.getEstimatedServings() : 0)
                .sum();

        // Calculate approximate kg diverted (assume ~0.45kg per meal or use specified quantity if unit in kg)
        double totalKg = allDonations.stream()
                .filter(d -> d.getStatus() == DonationStatus.COMPLETED || d.getStatus() == DonationStatus.PICKED_UP)
                .mapToDouble(d -> {
                    if ("kg".equalsIgnoreCase(d.getUnit()) && d.getQuantity() != null) {
                        return d.getQuantity();
                    } else if (d.getEstimatedServings() != null) {
                        return d.getEstimatedServings() * 0.45;
                    }
                    return 5.0;
                })
                .sum();

        // CO2e avoided ~ 2.5 kg CO2e per 1 kg food waste diverted (FAO standard benchmark)
        double co2eAvoided = totalKg * 2.5;

        long verifiedNgos = organisationRepository.findByVerificationStatus(VerificationStatus.VERIFIED).size();
        long activeVolunteers = userRepository.findByRole(Role.VOLUNTEER).size();
        long totalDonors = userRepository.findByRole(Role.DONOR).size();

        ImpactAnalyticsDto dto = new ImpactAnalyticsDto();
        dto.setTotalDonations(totalDonations);
        dto.setActiveListings(active);
        dto.setReservedDonations(reserved);
        dto.setInTransitDonations(inTransit);
        dto.setCompletedDonations(completed);
        dto.setCancelledDonations(cancelled);
        dto.setTotalMealsRescued(mealsRescued);
        dto.setTotalKgDiverted(Math.round(totalKg * 10.0) / 10.0);
        dto.setCo2eKgAvoided(Math.round(co2eAvoided * 10.0) / 10.0);
        dto.setVerifiedNgosCount(verifiedNgos);
        dto.setActiveVolunteersCount(activeVolunteers);
        dto.setTotalDonorsCount(totalDonors);

        return dto;
    }

    public Report createReport(ReportRequest request, String reporterUserId) {
        User reporter = userRepository.findById(reporterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Report report = new Report(null, reporter.getId(), reporter.getName(),
                request.getTargetType(), request.getTargetId(), request.getReason(), request.getDescription());

        Report saved = reportRepository.save(report);

        auditService.logEvent(reporter.getId(), reporter.getName(), reporter.getRole().name(),
                "REPORT", saved.getId(), "REPORTED", "Submitted report for " + request.getTargetType() + ": " + request.getTargetId());

        return saved;
    }

    public List<Report> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    public Report resolveReport(String reportId, String status, String adminUserId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        report.setStatus(status);
        return reportRepository.save(report);
    }
}
