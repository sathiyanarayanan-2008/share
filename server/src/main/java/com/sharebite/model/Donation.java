package com.sharebite.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "donations")
public class Donation {
    @Id
    private String id;

    private String donorId;

    private String donorName;

    private String title;

    private FoodCategory foodCategory;

    private Double quantity;

    private String unit; // kg, portions, boxes, trays, liters

    private Integer estimatedServings;

    private Instant preparationTime;

    private String safeHandlingNotes;

    private Instant pickupStart;

    private Instant pickupDeadline;

    private StorageCondition storageConditions;

    private Location location;

    private DonationStatus status = DonationStatus.AVAILABLE;

    private String claimedByNgoId;

    private String claimedByNgoName;

    private String assignedVolunteerId;

    private String assignedVolunteerName;

    private Instant createdAt = Instant.now();

    @Version
    private Long version;

    public Donation() {}

    public Donation(String id, String donorId, String donorName, String title, FoodCategory foodCategory,
                    Double quantity, String unit, Integer estimatedServings, Instant preparationTime,
                    String safeHandlingNotes, Instant pickupStart, Instant pickupDeadline,
                    StorageCondition storageConditions, Location location) {
        this.id = id;
        this.donorId = donorId;
        this.donorName = donorName;
        this.title = title;
        this.foodCategory = foodCategory;
        this.quantity = quantity;
        this.unit = unit;
        this.estimatedServings = estimatedServings;
        this.preparationTime = preparationTime;
        this.safeHandlingNotes = safeHandlingNotes;
        this.pickupStart = pickupStart;
        this.pickupDeadline = pickupDeadline;
        this.storageConditions = storageConditions;
        this.location = location;
        this.status = DonationStatus.AVAILABLE;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDonorId() {
        return donorId;
    }

    public void setDonorId(String donorId) {
        this.donorId = donorId;
    }

    public String getDonorName() {
        return donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public FoodCategory getFoodCategory() {
        return foodCategory;
    }

    public void setFoodCategory(FoodCategory foodCategory) {
        this.foodCategory = foodCategory;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getEstimatedServings() {
        return estimatedServings;
    }

    public void setEstimatedServings(Integer estimatedServings) {
        this.estimatedServings = estimatedServings;
    }

    public Instant getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(Instant preparationTime) {
        this.preparationTime = preparationTime;
    }

    public String getSafeHandlingNotes() {
        return safeHandlingNotes;
    }

    public void setSafeHandlingNotes(String safeHandlingNotes) {
        this.safeHandlingNotes = safeHandlingNotes;
    }

    public Instant getPickupStart() {
        return pickupStart;
    }

    public void setPickupStart(Instant pickupStart) {
        this.pickupStart = pickupStart;
    }

    public Instant getPickupDeadline() {
        return pickupDeadline;
    }

    public void setPickupDeadline(Instant pickupDeadline) {
        this.pickupDeadline = pickupDeadline;
    }

    public StorageCondition getStorageConditions() {
        return storageConditions;
    }

    public void setStorageConditions(StorageCondition storageConditions) {
        this.storageConditions = storageConditions;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
    }

    public String getClaimedByNgoId() {
        return claimedByNgoId;
    }

    public void setClaimedByNgoId(String claimedByNgoId) {
        this.claimedByNgoId = claimedByNgoId;
    }

    public String getClaimedByNgoName() {
        return claimedByNgoName;
    }

    public void setClaimedByNgoName(String claimedByNgoName) {
        this.claimedByNgoName = claimedByNgoName;
    }

    public String getAssignedVolunteerId() {
        return assignedVolunteerId;
    }

    public void setAssignedVolunteerId(String assignedVolunteerId) {
        this.assignedVolunteerId = assignedVolunteerId;
    }

    public String getAssignedVolunteerName() {
        return assignedVolunteerName;
    }

    public void setAssignedVolunteerName(String assignedVolunteerName) {
        this.assignedVolunteerName = assignedVolunteerName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
