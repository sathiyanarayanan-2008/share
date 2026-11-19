package com.sharebite.repository;

import com.sharebite.model.Claim;
import com.sharebite.model.ClaimStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends MongoRepository<Claim, String> {
    List<Claim> findByNgoId(String ngoId);
    Optional<Claim> findByDonationId(String donationId);
    List<Claim> findByStatus(ClaimStatus status);
}
