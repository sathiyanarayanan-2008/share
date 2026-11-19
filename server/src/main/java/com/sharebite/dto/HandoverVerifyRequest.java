package com.sharebite.dto;

import jakarta.validation.constraints.NotBlank;

public class HandoverVerifyRequest {
    @NotBlank(message = "Token or backup code is required")
    private String token;

    @NotBlank(message = "Confirmation type is required (DONOR_HANDOVER or NGO_DELIVERY)")
    private String confirmationType;

    private String notes;

    public HandoverVerifyRequest() {}

    public HandoverVerifyRequest(String token, String confirmationType, String notes) {
        this.token = token;
        this.confirmationType = confirmationType;
        this.notes = notes;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getConfirmationType() {
        return confirmationType;
    }

    public void setConfirmationType(String confirmationType) {
        this.confirmationType = confirmationType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
