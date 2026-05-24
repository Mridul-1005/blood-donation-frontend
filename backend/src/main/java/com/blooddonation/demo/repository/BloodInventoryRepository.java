package com.blooddonation.demo.repository;



import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.BloodInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BloodInventoryRepository extends JpaRepository<BloodInventory, Long> {

    // Find inventory by blood group
    Optional<BloodInventory> findByBloodGroup(BloodGroup bloodGroup);
}
