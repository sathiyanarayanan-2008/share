package com.sharebite.repository;

import com.sharebite.model.Organisation;
import com.sharebite.model.VerificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganisationRepository extends MongoRepository<Organisation, String> {
    List<Organisation> findByVerificationStatus(VerificationStatus verificationStatus);
    List<Organisation> findByType(String type);
}
