package com.sharebite.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ClaimRequest {
    @NotNull(message = "Allocated servings count is required")
    @Min(value = 1, message = "Allocated servings must be at least 1")
    private Integer allocatedServings;

    @AssertTrue(message = "You must accept the Food Safety Acknowledgement and inspection checklist before reserving")
    private boolean safetyAcknowledgementAccepted;

    public ClaimRequest() {}

    public ClaimRequest(Integer allocatedServings, boolean safetyAcknowledgementAccepted) {
        this.allocatedServings = allocatedServings;
        this.safetyAcknowledgementAccepted = safetyAcknowledgementAccepted;
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
