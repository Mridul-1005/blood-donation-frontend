package com.blooddonation.demo.service;

import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.Role;
import com.blooddonation.demo.entity.User;
import com.blooddonation.demo.exception.ResourceNotFoundException;
import com.blooddonation.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users (admin only)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get single user by id
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));
    }

    // Search available donors by blood group (public)
    public List<User> getDonorsByBloodGroup(BloodGroup bloodGroup) {
        return userRepository.findByBloodGroupAndIsAvailableTrue(bloodGroup);
    }

    // Get all donors (admin)
    public List<User> getAllDonors() {
        return userRepository.findByRole(Role.DONOR);
    }

    // Update user profile
    @Transactional
    public User updateUser(Long id, User updatedUser) {
        User existing = getUserById(id); // ← already throws ResourceNotFoundException

        existing.setName(updatedUser.getName());
        existing.setPhone(updatedUser.getPhone());
        existing.setAddress(updatedUser.getAddress());
        existing.setBloodGroup(updatedUser.getBloodGroup());
        existing.setIsAvailable(updatedUser.getIsAvailable());

        return userRepository.save(existing);
    }

    // Admin upgrades a user role (USER → DONOR → ADMIN)
    public User updateRole(Long id, Role newRole) {
        User user = getUserById(id); // ← already throws ResourceNotFoundException
        user.setRole(newRole);
        return userRepository.save(user);
    }

    // Delete user (admin only)
    public void deleteUser(Long id) {
        // Check if exists before deleting
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}