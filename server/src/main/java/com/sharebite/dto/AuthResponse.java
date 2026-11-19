package com.sharebite.dto;

import com.sharebite.model.Role;
import com.sharebite.model.VerificationStatus;

public class AuthResponse {
    private String token;
    private String id;
    private String name;
    private String email;
    private Role role;
    private VerificationStatus verificationStatus;
    private String phone;
    private String organisationId;
    private String organisationName;

    public AuthResponse() {}

    public AuthResponse(String token, String id, String name, String email, Role role,
                        VerificationStatus verificationStatus, String phone, String organisationId, String organisationName) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.verificationStatus = verificationStatus;
        this.phone = phone;
        this.organisationId = organisationId;
        this.organisationName = organisationName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(String organisationId) {
        this.organisationId = organisationId;
    }

    public String getOrganisationName() {
        return organisationName;
    }

    public void setOrganisationName(String organisationName) {
        this.organisationName = organisationName;
    }
}
