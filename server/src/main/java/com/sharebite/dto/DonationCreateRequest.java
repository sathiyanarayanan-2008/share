package com.sharebite.dto;

import com.sharebite.model.FoodCategory;
import com.sharebite.model.StorageCondition;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class DonationCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Food category is required")
    private FoodCategory foodCategory;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Double quantity;

    @NotBlank(message = "Unit is required (e.g., kg, portions, boxes, trays)")
    private String unit;

    @NotNull(message = "Estimated servings is required")
    @Min(value = 1, message = "Servings must be at least 1")
    private Integer estimatedServings;

    @NotNull(message = "Preparation/packaging time is required")
    private Instant preparationTime;

    @NotBlank(message = "Safe handling notes and allergen disclosure are required")
    private String safeHandlingNotes;

    @NotNull(message = "Pickup start time is required")
    private Instant pickupStart;

    @NotNull(message = "Pickup deadline is required")
    private Instant pickupDeadline;

    @NotNull(message = "Storage conditions are required")
    private StorageCondition storageConditions;

    @NotBlank(message = "Pickup address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    public DonationCreateRequest() {}

    // Getters and Setters
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
