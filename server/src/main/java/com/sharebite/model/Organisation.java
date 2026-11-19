package com.sharebite.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "organisations")
public class Organisation {
    @Id
    private String id;

    private String name;

    private String type; // SHELTER, FOOD_BANK, COMMUNITY_KITCHEN, CHARITY, SOUP_KITCHEN, RESTAURANT_DONOR, etc.

    private String address;

    private GeoCoordinates geoCoordinates;

    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    private Integer capacity; // Servings pickup capacity per run

    private String contactPerson;

    private String contactPhone;

    private String contactEmail;

    private String registrationNumber;

    private Instant createdAt = Instant.now();

    public Organisation() {}

    public Organisation(String id, String name, String type, String address, GeoCoordinates geoCoordinates,
                        VerificationStatus verificationStatus, Integer capacity, String contactPerson,
                        String contactPhone, String contactEmail, String registrationNumber) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.address = address;
        this.geoCoordinates = geoCoordinates;
        this.verificationStatus = verificationStatus;
        this.capacity = capacity;
        this.contactPerson = contactPerson;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.registrationNumber = registrationNumber;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public GeoCoordinates getGeoCoordinates() {
        return geoCoordinates;
    }

    public void setGeoCoordinates(GeoCoordinates geoCoordinates) {
        this.geoCoordinates = geoCoordinates;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
