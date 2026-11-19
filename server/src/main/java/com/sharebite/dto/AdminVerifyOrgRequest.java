package com.sharebite.dto;

import com.sharebite.model.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public class AdminVerifyOrgRequest {
    @NotNull(message = "Verification status is required (VERIFIED or REJECTED)")
    private VerificationStatus status;

    private String notes;

    public AdminVerifyOrgRequest() {}

    public AdminVerifyOrgRequest(VerificationStatus status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
