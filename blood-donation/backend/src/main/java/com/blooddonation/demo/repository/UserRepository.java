package com.blooddonation.demo.repository;



import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email (used in login)
    Optional<User> findByEmail(String email);

    // Check if email already exists (used in register)
    boolean existsByEmail(String email);

    // Find all available donors by blood group (public search)
    List<User> findByBloodGroupAndIsAvailableTrue(BloodGroup bloodGroup);

    // Find all donors (admin panel)
    List<User> findByRole(com.blooddonation.demo.entity.Role role);
}