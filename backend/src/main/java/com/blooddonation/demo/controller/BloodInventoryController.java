package com.blooddonation.demo.controller;


import com.blooddonation.demo.dto.ApiResponse;
import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.BloodInventory;
import com.blooddonation.demo.service.BloodInventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class BloodInventoryController {

    private final BloodInventoryService inventoryService;

    public BloodInventoryController(BloodInventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // ── GET /api/inventory  (public) ─────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<BloodInventory>>> getAllInventory() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Inventory fetched",
                        inventoryService.getAllInventory())
        );
    }

    // ── GET /api/inventory/{bloodGroup}  (public) ────────────
    @GetMapping("/{bloodGroup}")
    public ResponseEntity<ApiResponse<BloodInventory>> getByBloodGroup(
            @PathVariable BloodGroup bloodGroup) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Stock fetched",
                        inventoryService.getByBloodGroup(bloodGroup))
        );
    }

    // ── PATCH /api/inventory/update  (ADMIN only) ────────────
    @PatchMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BloodInventory>> updateStock(
            @RequestParam BloodGroup bloodGroup,
            @RequestParam Integer units) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Stock updated",
                        inventoryService.updateStock(bloodGroup, units))
        );
    }
}