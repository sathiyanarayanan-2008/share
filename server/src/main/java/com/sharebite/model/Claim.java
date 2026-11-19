package com.sharebite.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "claims")
public class Claim {
    @Id
    private String id;

    private String donationId;

    private String ngoId;

    private String ngoName;

    private ClaimStatus status = ClaimStatus.RESERVED;

    private Instant reservedAt = Instant.now();

    private Integer allocatedServings;

    private boolean safetyAcknowledgementAccepted;

    public Claim() {}

    public Claim(String id, String donationId, String ngoId, String ngoName, Integer allocatedServings, boolean safetyAcknowledgementAccepted) {
        this.id = id;
        this.donationId = donationId;
        this.ngoId = ngoId;
        this.ngoName = ngoName;
        this.allocatedServings = allocatedServings;
        this.safetyAcknowledgementAccepted = safetyAcknowledgementAccepted;
        this.status = ClaimStatus.RESERVED;
        this.reservedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDonationId() {
        return donationId;
    }

    public void setDonationId(String donationId) {
        this.donationId = donationId;
    }

    public String getNgoId() {
        return ngoId;
    }

    public void setNgoId(String ngoId) {
        this.ngoId = ngoId;
    }

    public String getNgoName() {
        return ngoName;
    }

    public void setNgoName(String ngoName) {
        this.ngoName = ngoName;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public Instant getReservedAt() {
        return reservedAt;
    }

    public void setReservedAt(Instant reservedAt) {
        this.reservedAt = reservedAt;
    }

    public Integer getAllocatedServings() {
        return allocatedServings;
    }

    public void setAllocatedServings(Integer allocatedServings) {
        this.allocatedServings = allocatedServings;
    }

    public boolean isSafetyAcknowledgementAccepted() {
        return safetyAcknowledgementAccepted;
    }

    public void setSafetyAcknowledgementAccepted(boolean safetyAcknowledgementAccepted) {
        this.safetyAcknowledgementAccepted = safetyAcknowledgementAccepted;
    }
}
