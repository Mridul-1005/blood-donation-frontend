package com.blooddonation.demo.service;

import com.blooddonation.demo.entity.BloodInventory;
import com.blooddonation.demo.entity.Donation;
import com.blooddonation.demo.entity.User;
import com.blooddonation.demo.exception.ResourceNotFoundException;
import com.blooddonation.demo.repository.BloodInventoryRepository;
import com.blooddonation.demo.repository.DonationRepository;
import com.blooddonation.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final BloodInventoryRepository inventoryRepository;

    public DonationService(DonationRepository donationRepository,
                           UserRepository userRepository,
                           BloodInventoryRepository inventoryRepository) {
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // Get all donations (admin)
    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    // Get donation history of a specific donor
    public List<Donation> getMyDonations(Long donorId) {
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Donor not found with id: " + donorId));
        return donationRepository.findByDonor(donor);
    }

    // Log a new donation & update blood inventory automatically
    @Transactional
    public Donation logDonation(Donation donation, Long donorId) {
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Donor not found with id: " + donorId));

        donation.setDonor(donor);

        // Update last donated date on donor profile
        donor.setLastDonated(donation.getDonatedAt());
        userRepository.save(donor);

        // Auto update blood inventory
        BloodInventory inventory = inventoryRepository
                .findByBloodGroup(donor.getBloodGroup())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for blood group: " + donor.getBloodGroup()));

        inventory.setUnits(inventory.getUnits() + donation.getUnitsDonated());
        inventoryRepository.save(inventory);

        return donationRepository.save(donation);
    }

    // Delete a donation record (admin only)
    public void deleteDonation(Long id) {
        if (!donationRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Donation not found with id: " + id);
        }
        donationRepository.deleteById(id);
    }
}