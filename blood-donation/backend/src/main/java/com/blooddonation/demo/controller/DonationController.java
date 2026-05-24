package com.blooddonation.demo.controller;


import com.blooddonation.demo.dto.ApiResponse;
import com.blooddonation.demo.entity.Donation;
import com.blooddonation.demo.entity.User;
import com.blooddonation.demo.repository.UserRepository;
import com.blooddonation.demo.service.DonationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {

    private final DonationService donationService;
    private final UserRepository userRepository;

    public DonationController(DonationService donationService,
                              UserRepository userRepository) {
        this.donationService = donationService;
        this.userRepository = userRepository;
    }

    // ── GET /api/donations  (ADMIN only) ─────────────────────
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Donation>>> getAllDonations() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "All donations fetched",
                        donationService.getAllDonations())
        );
    }

    // ── GET /api/donations/my  (DONOR only) ──────────────────
    @GetMapping("/my")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<List<Donation>>> getMyDonations(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Your donations fetched",
                        donationService.getMyDonations(user.getId()))
        );
    }

    // ── POST /api/donations  (DONOR only) ────────────────────
    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<Donation>> logDonation(
            @RequestBody Donation donation,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Donation logged successfully!",
                        donationService.logDonation(donation, user.getId()))
        );
    }

    // ── DELETE /api/donations/{id}  (ADMIN only) ─────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Donation record deleted"));
    }
}