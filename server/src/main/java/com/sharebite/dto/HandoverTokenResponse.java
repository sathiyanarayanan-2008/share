package com.sharebite.dto;

import java.time.Instant;

public class HandoverTokenResponse {
    private String token;
    private String backupCode;
    private String type; // DONOR_HANDOVER, NGO_DELIVERY
    private Instant expiresAt;
    private String instructions;

    public HandoverTokenResponse() {}

    public HandoverTokenResponse(String token, String backupCode, String type, Instant expiresAt, String instructions) {
        this.token = token;
        this.backupCode = backupCode;
        this.type = type;
        this.expiresAt = expiresAt;
        this.instructions = instructions;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getBackupCode() {
        return backupCode;
    }

    public void setBackupCode(String backupCode) {
        this.backupCode = backupCode;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}
