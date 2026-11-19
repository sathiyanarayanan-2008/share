package com.sharebite.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "pickups")
public class Pickup {
    @Id
    private String id;

    private String claimId;

    private String donationId;

    private String volunteerId;

    private String volunteerName;

    private PickupStatus status = PickupStatus.ASSIGNED;

    private Instant pickupTime;

    private Instant deliveryTime;

    private String donorConfirmationTokenHash;

    private String ngoConfirmationTokenHash;

    private Instant tokenExpiresAt;

    private String notes;

    private Instant createdAt = Instant.now();

    public Pickup() {}

    public Pickup(String id, String claimId, String donationId, String volunteerId, String volunteerName) {
        this.id = id;
        this.claimId = claimId;
        this.donationId = donationId;
        this.volunteerId = volunteerId;
        this.volunteerName = volunteerName;
        this.status = PickupStatus.ASSIGNED;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClaimId() {
        return claimId;
    }

    public void setClaimId(String claimId) {
        this.claimId = claimId;
    }

    public String getDonationId() {
        return donationId;
    }

    public void setDonationId(String donationId) {
        this.donationId = donationId;
    }

    public String getVolunteerId() {
        return volunteerId;
    }

    public void setVolunteerId(String volunteerId) {
        this.volunteerId = volunteerId;
    }

    public String getVolunteerName() {
        return volunteerName;
    }

    public void setVolunteerName(String volunteerName) {
        this.volunteerName = volunteerName;
    }

    public PickupStatus getStatus() {
        return status;
    }

    public void setStatus(PickupStatus status) {
        this.status = status;
    }

    public Instant getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(Instant pickupTime) {
        this.pickupTime = pickupTime;
    }

    public Instant getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(Instant deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public String getDonorConfirmationTokenHash() {
        return donorConfirmationTokenHash;
    }

    public void setDonorConfirmationTokenHash(String donorConfirmationTokenHash) {
        this.donorConfirmationTokenHash = donorConfirmationTokenHash;
    }

    public String getNgoConfirmationTokenHash() {
        return ngoConfirmationTokenHash;
    }

    public void setNgoConfirmationTokenHash(String ngoConfirmationTokenHash) {
        this.ngoConfirmationTokenHash = ngoConfirmationTokenHash;
    }

    public Instant getTokenExpiresAt() {
        return tokenExpiresAt;
    }

    public void setTokenExpiresAt(Instant tokenExpiresAt) {
        this.tokenExpiresAt = tokenExpiresAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
