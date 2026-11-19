package com.sharebite.service;

import com.sharebite.exception.ResourceNotFoundException;
import com.sharebite.model.Organisation;
import com.sharebite.model.VerificationStatus;
import com.sharebite.repository.OrganisationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrganisationService {

    private final OrganisationRepository organisationRepository;

    public OrganisationService(OrganisationRepository organisationRepository) {
        this.organisationRepository = organisationRepository;
    }

    public List<Organisation> getAllOrganisations() {
        return organisationRepository.findAll();
    }

    public List<Organisation> getVerifiedOrganisations() {
        return organisationRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
    }

    public Organisation getById(String id) {
        return organisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organisation not found with id: " + id));
    }

    public Organisation updateCapacity(String id, Integer newCapacity) {
        Organisation org = getById(id);
        org.setCapacity(newCapacity);
        return organisationRepository.save(org);
    }
}
