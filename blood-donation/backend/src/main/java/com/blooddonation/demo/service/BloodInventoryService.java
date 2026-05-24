package com.blooddonation.demo.service;

import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.BloodInventory;
import com.blooddonation.demo.exception.ResourceNotFoundException;
import com.blooddonation.demo.repository.BloodInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BloodInventoryService {

    private final BloodInventoryRepository inventoryRepository;

    public BloodInventoryService(BloodInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    // Get all blood stock (public)
    public List<BloodInventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // Get stock of one blood group
    public BloodInventory getByBloodGroup(BloodGroup bloodGroup) {
        return inventoryRepository.findByBloodGroup(bloodGroup)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Blood group not found in inventory: " + bloodGroup));
    }

    // Admin manually updates stock
    @Transactional
    public BloodInventory updateStock(BloodGroup bloodGroup, Integer units) {
        BloodInventory inventory = getByBloodGroup(bloodGroup); // ← throws ResourceNotFoundException
        inventory.setUnits(units);
        inventory.setUpdatedAt(LocalDateTime.now());
        return inventoryRepository.save(inventory);
    }
}