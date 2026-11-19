package com.sharebite.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "audit_events")
public class AuditEvent {
    @Id
    private String id;

    private String actorId;

    private String actorName;

    private String actorRole;

    private String entityType; // DONATION, CLAIM, PICKUP, ORGANISATION, USER

    private String entityId;

    private String action; // CREATED, UPDATED, RESERVED, CANCELLED, PICKED_UP, DELIVERED, VERIFIED, REJECTED, REPORTED

    private Instant timestamp = Instant.now();

    private String details;

    public AuditEvent() {}

    public AuditEvent(String id, String actorId, String actorName, String actorRole, String entityType, String entityId, String action, String details) {
        this.id = id;
        this.actorId = actorId;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.details = details;
        this.timestamp = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public String getActorRole() {
        return actorRole;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
