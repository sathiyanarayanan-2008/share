package com.sharebite.dto;

import jakarta.validation.constraints.NotBlank;

public class ReportRequest {
    @NotBlank(message = "Target type is required (DONATION, USER, ORGANISATION)")
    private String targetType;

    @NotBlank(message = "Target ID is required")
    private String targetId;

    @NotBlank(message = "Reason is required (SAFETY_VIOLATION, SPOILED_FOOD, NO_SHOW, etc.)")
    private String reason;

    @NotBlank(message = "Description of report is required")
    private String description;

    public ReportRequest() {}

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
}
