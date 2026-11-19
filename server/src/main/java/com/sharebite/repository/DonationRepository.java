package com.sharebite.repository;

import com.sharebite.model.Donation;
import com.sharebite.model.DonationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends MongoRepository<Donation, String> {
    List<Donation> findByStatus(DonationStatus status);
    List<Donation> findByDonorId(String donorId);
    List<Donation> findByClaimedByNgoId(String claimedByNgoId);
    List<Donation> findByAssignedVolunteerId(String volunteerId);
    long countByStatus(DonationStatus status);
}
