package com.sharebite.dto;

public class ImpactAnalyticsDto {
    private long totalDonations;
    private long activeListings;
    private long reservedDonations;
    private long inTransitDonations;
    private long completedDonations;
    private long cancelledDonations;
    private long totalMealsRescued;
    private double totalKgDiverted;
    private double co2eKgAvoided; // calculated as ~2.5 kg CO2e saved per 1 kg food rescued
    private long verifiedNgosCount;
    private long activeVolunteersCount;
    private long totalDonorsCount;

    public ImpactAnalyticsDto() {}

    public long getTotalDonations() {
        return totalDonations;
    }

    public void setTotalDonations(long totalDonations) {
        this.totalDonations = totalDonations;
    }

    public long getActiveListings() {
        return activeListings;
    }

    public void setActiveListings(long activeListings) {
        this.activeListings = activeListings;
    }

    public long getReservedDonations() {
        return reservedDonations;
    }

    public void setReservedDonations(long reservedDonations) {
        this.reservedDonations = reservedDonations;
    }

    public long getInTransitDonations() {
        return inTransitDonations;
    }

    public void setInTransitDonations(long inTransitDonations) {
        this.inTransitDonations = inTransitDonations;
    }

    public long getCompletedDonations() {
        return completedDonations;
    }

    public void setCompletedDonations(long completedDonations) {
        this.completedDonations = completedDonations;
    }

    public long getCancelledDonations() {
        return cancelledDonations;
    }

    public void setCancelledDonations(long cancelledDonations) {
        this.cancelledDonations = cancelledDonations;
    }

    public long getTotalMealsRescued() {
        return totalMealsRescued;
    }

    public void setTotalMealsRescued(long totalMealsRescued) {
        this.totalMealsRescued = totalMealsRescued;
    }

    public double getTotalKgDiverted() {
        return totalKgDiverted;
    }

    public void setTotalKgDiverted(double totalKgDiverted) {
        this.totalKgDiverted = totalKgDiverted;
    }

    public double getCo2eKgAvoided() {
        return co2eKgAvoided;
    }

    public void setCo2eKgAvoided(double co2eKgAvoided) {
        this.co2eKgAvoided = co2eKgAvoided;
    }

    public long getVerifiedNgosCount() {
        return verifiedNgosCount;
    }

    public void setVerifiedNgosCount(long verifiedNgosCount) {
        this.verifiedNgosCount = verifiedNgosCount;
    }

    public long getActiveVolunteersCount() {
        return activeVolunteersCount;
    }

    public void setActiveVolunteersCount(long activeVolunteersCount) {
        this.activeVolunteersCount = activeVolunteersCount;
    }

    public long getTotalDonorsCount() {
        return totalDonorsCount;
    }

    public void setTotalDonorsCount(long totalDonorsCount) {
        this.totalDonorsCount = totalDonorsCount;
    }
}
