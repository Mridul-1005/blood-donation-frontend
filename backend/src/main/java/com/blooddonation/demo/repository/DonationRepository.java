package com.blooddonation.demo.repository;

import com.blooddonation.demo.entity.Donation;
import com.blooddonation.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    // Get donation history of a donor
    List<Donation> findByDonor(User donor);

    // Get all donations linked to a specific request
    List<Donation> findByBloodRequestId(Long requestId);
}
