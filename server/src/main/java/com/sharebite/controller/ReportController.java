package com.sharebite.controller;

import com.sharebite.dto.ReportRequest;
import com.sharebite.model.Report;
import com.sharebite.model.User;
import com.sharebite.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final AdminService adminService;

    public ReportController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<Report> submitReport(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal User user) {
        String reporterId = user != null ? user.getId() : "anonymous";
        Report report = adminService.createReport(request, reporterId);
        return new ResponseEntity<>(report, HttpStatus.CREATED);
    }
}
