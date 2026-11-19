package com.sharebite.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "reports")
public class Report {
    @Id
    private String id;

    private String reporterId;

    private String reporterName;

    private String targetType; // DONATION, USER, ORGANISATION

    private String targetId;

    private String reason; // SAFETY_VIOLATION, SPOILED_FOOD, NO_SHOW, MISREPRESENTATION, HARASSMENT, OTHER

    private String description;

    private String status = "OPEN"; // OPEN, UNDER_REVIEW, RESOLVED, DISMISSED

    private Instant createdAt = Instant.now();

    public Report() {}

    public Report(String id, String reporterId, String reporterName, String targetType, String targetId, String reason, String description) {
        this.id = id;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
        this.description = description;
        this.status = "OPEN";
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReporterId() {
        return reporterId;
    }

    public void setReporterId(String reporterId) {
        this.reporterId = reporterId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
