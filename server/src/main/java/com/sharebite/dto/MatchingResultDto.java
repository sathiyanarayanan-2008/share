package com.sharebite.dto;

import com.sharebite.model.Donation;
import com.sharebite.model.Organisation;

public class MatchingResultDto {
    private Donation donation;
    private Organisation organisation;
    private double overallScore; // 0 to 100
    private double distanceKm;
    private double distanceScore; // 0 to 100
    private double capacityRatio;
    private double capacityScore; // 0 to 100
    private double windowHoursRemaining;
    private double urgencyScore; // 0 to 100
    private String explanation;
    private String formula;

    public MatchingResultDto() {}

    public MatchingResultDto(Donation donation, Organisation organisation, double overallScore,
                             double distanceKm, double distanceScore, double capacityRatio,
                             double capacityScore, double windowHoursRemaining, double urgencyScore,
                             String explanation, String formula) {
        this.donation = donation;
        this.organisation = organisation;
        this.overallScore = overallScore;
        this.distanceKm = distanceKm;
        this.distanceScore = distanceScore;
        this.capacityRatio = capacityRatio;
        this.capacityScore = capacityScore;
        this.windowHoursRemaining = windowHoursRemaining;
        this.urgencyScore = urgencyScore;
        this.explanation = explanation;
        this.formula = formula;
    }

    public Donation getDonation() {
        return donation;
    }

    public void setDonation(Donation donation) {
        this.donation = donation;
    }

    public Organisation getOrganisation() {
        return organisation;
    }

    public void setOrganisation(Organisation organisation) {
        this.organisation = organisation;
    }

    public double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(double overallScore) {
        this.overallScore = overallScore;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getDistanceScore() {
        return distanceScore;
    }

    public void setDistanceScore(double distanceScore) {
        this.distanceScore = distanceScore;
    }

    public double getCapacityRatio() {
        return capacityRatio;
    }

    public void setCapacityRatio(double capacityRatio) {
        this.capacityRatio = capacityRatio;
    }

    public double getCapacityScore() {
        return capacityScore;
    }

    public void setCapacityScore(double capacityScore) {
        this.capacityScore = capacityScore;
    }

    public double getWindowHoursRemaining() {
        return windowHoursRemaining;
    }

    public void setWindowHoursRemaining(double windowHoursRemaining) {
        this.windowHoursRemaining = windowHoursRemaining;
    }

    public double getUrgencyScore() {
        return urgencyScore;
    }

    public void setUrgencyScore(double urgencyScore) {
        this.urgencyScore = urgencyScore;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getFormula() {
        return formula;
    }

    public void setFormula(String formula) {
        this.formula = formula;
    }
}
