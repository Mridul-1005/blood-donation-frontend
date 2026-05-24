package com.blooddonation.demo.repository;

import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.BloodRequest;
import com.blooddonation.demo.entity.RequestStatus;
import com.blooddonation.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    // Get all open requests (public page) - with pagination
    Page<BloodRequest> findByStatus(RequestStatus status, Pageable pageable);

    // Legacy method for backward compatibility
    java.util.List<BloodRequest> findByStatus(RequestStatus status);

    // Get requests by blood group (filter feature) - with pagination
    Page<BloodRequest> findByBloodGroupAndStatus(BloodGroup bloodGroup, RequestStatus status, Pageable pageable);

    // Legacy method
    java.util.List<BloodRequest> findByBloodGroupAndStatus(BloodGroup bloodGroup, RequestStatus status);

    // Get requests created by a specific user - with pagination
    Page<BloodRequest> findByCreatedBy(User createdBy, Pageable pageable);

    // Legacy method
    java.util.List<BloodRequest> findByCreatedBy(User createdBy);

    // Optimized query with eager fetch of createdBy to avoid N+1
    @Query("SELECT r FROM BloodRequest r LEFT JOIN FETCH r.createdBy WHERE r.id = :id")
    Optional<BloodRequest> findByIdWithCreator(@Param("id") Long id);
}