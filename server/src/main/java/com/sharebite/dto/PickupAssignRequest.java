package com.sharebite.dto;

public class PickupAssignRequest {
    private String notes;

    public PickupAssignRequest() {}

    public PickupAssignRequest(String notes) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
