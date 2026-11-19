package com.sharebite.controller;

import com.sharebite.model.Organisation;
import com.sharebite.service.OrganisationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organisations")
public class OrganisationController {

    private final OrganisationService organisationService;

    public OrganisationController(OrganisationService organisationService) {
        this.organisationService = organisationService;
    }

    @GetMapping
    public ResponseEntity<List<Organisation>> getOrganisations(
            @RequestParam(required = false, defaultValue = "false") boolean verifiedOnly) {
        if (verifiedOnly) {
            return ResponseEntity.ok(organisationService.getVerifiedOrganisations());
        }
        return ResponseEntity.ok(organisationService.getAllOrganisations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organisation> getById(@PathVariable String id) {
        return ResponseEntity.ok(organisationService.getById(id));
    }

    @PatchMapping("/{id}/capacity")
    public ResponseEntity<Organisation> updateCapacity(
            @PathVariable String id,
            @RequestBody Map<String, Integer> payload) {
        Integer newCapacity = payload.get("capacity");
        if (newCapacity == null || newCapacity < 1) {
            throw new IllegalArgumentException("Capacity must be at least 1");
        }
        return ResponseEntity.ok(organisationService.updateCapacity(id, newCapacity));
    }
}
