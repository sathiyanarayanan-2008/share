package com.sharebite.dto;

import com.sharebite.model.FoodCategory;
import com.sharebite.model.StorageCondition;

import java.time.Instant;

public class DonationUpdateRequest {
    private String title;
    private FoodCategory foodCategory;
    private Double quantity;
    private String unit;
    private Integer estimatedServings;
    private Instant preparationTime;
    private String safeHandlingNotes;
    private Instant pickupStart;
    private Instant pickupDeadline;
    private StorageCondition storageConditions;
    private String address;
    private Double latitude;
    private Double longitude;

    public DonationUpdateRequest() {}

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
