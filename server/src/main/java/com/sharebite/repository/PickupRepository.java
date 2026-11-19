package com.sharebite.repository;

import com.sharebite.model.Pickup;
import com.sharebite.model.PickupStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PickupRepository extends MongoRepository<Pickup, String> {
    List<Pickup> findByVolunteerId(String volunteerId);
    Optional<Pickup> findByClaimId(String claimId);
    Optional<Pickup> findByDonationId(String donationId);
    List<Pickup> findByStatus(PickupStatus status);
}
