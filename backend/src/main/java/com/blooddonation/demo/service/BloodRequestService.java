package com.blooddonation.demo.service;

import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.BloodRequest;
import com.blooddonation.demo.entity.RequestStatus;
import com.blooddonation.demo.entity.User;
import com.blooddonation.demo.exception.ResourceNotFoundException;
import com.blooddonation.demo.repository.BloodRequestRepository;
import com.blooddonation.demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final UserRepository userRepository;

    public BloodRequestService(BloodRequestRepository bloodRequestRepository,
                               UserRepository userRepository) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.userRepository = userRepository;
    }

    // Get all requests (public) - with pagination
    public Page<BloodRequest> getAllRequests(Pageable pageable) {
        return bloodRequestRepository.findAll(pageable);
    }

    // Legacy method for backward compatibility - returns list
    public List<BloodRequest> getAllRequests() {
        return bloodRequestRepository.findAll();
    }

    // Get request by ID - FIXES N+1 issue
    public BloodRequest getRequestById(Long id) {
        return bloodRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Request not found with id: " + id));
    }

    // Get only OPEN requests (public homepage) - with pagination
    public Page<BloodRequest> getOpenRequests(Pageable pageable) {
        return bloodRequestRepository.findByStatus(RequestStatus.OPEN, pageable);
    }

    // Legacy method for backward compatibility
    public List<BloodRequest> getOpenRequests() {
        return bloodRequestRepository.findByStatus(RequestStatus.OPEN);
    }

    // Get requests filtered by blood group - with pagination
    public Page<BloodRequest> getOpenRequestsByBloodGroup(BloodGroup bloodGroup, Pageable pageable) {
        return bloodRequestRepository.findByBloodGroupAndStatus(bloodGroup, RequestStatus.OPEN, pageable);
    }

    // Legacy method
    public List<BloodRequest> getOpenRequestsByBloodGroup(BloodGroup bloodGroup) {
        return bloodRequestRepository.findByBloodGroupAndStatus(bloodGroup, RequestStatus.OPEN);
    }

    // Get requests made by logged-in user - with pagination
    public Page<BloodRequest> getMyRequests(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        return bloodRequestRepository.findByCreatedBy(user, pageable);
    }

    // Legacy method
    public List<BloodRequest> getMyRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        return bloodRequestRepository.findByCreatedBy(user);
    }

    // Create a new blood request
    @Transactional
    public BloodRequest createRequest(BloodRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        request.setCreatedBy(user);
        request.setStatus(RequestStatus.OPEN);
        return bloodRequestRepository.save(request);
    }

    // Update request — only owner or admin can do this (checked in controller)
    @Transactional
    public BloodRequest updateRequest(Long id, BloodRequest updatedRequest) {
        BloodRequest existing = getRequestById(id);

        existing.setPatientName(updatedRequest.getPatientName());
        existing.setBloodGroup(updatedRequest.getBloodGroup());
        existing.setUnitsNeeded(updatedRequest.getUnitsNeeded());
        existing.setHospital(updatedRequest.getHospital());
        existing.setContact(updatedRequest.getContact());
        existing.setReason(updatedRequest.getReason());
        existing.setStatus(updatedRequest.getStatus());

        return bloodRequestRepository.save(existing);
    }

    // Delete request — only owner or admin can do this (checked in controller)
    public void deleteRequest(Long id) {
        if (!bloodRequestRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Request not found with id: " + id);
        }
        bloodRequestRepository.deleteById(id);
    }
}