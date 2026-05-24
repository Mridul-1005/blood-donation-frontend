package com.blooddonation.demo.controller;

import com.blooddonation.demo.dto.ApiResponse;
import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.BloodRequest;
import com.blooddonation.demo.entity.User;
import com.blooddonation.demo.exception.AccessDeniedException;
import com.blooddonation.demo.exception.ResourceNotFoundException;
import com.blooddonation.demo.repository.UserRepository;
import com.blooddonation.demo.service.BloodRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class BloodRequestController {

    private final BloodRequestService bloodRequestService;
    private final UserRepository userRepository;

    public BloodRequestController(BloodRequestService bloodRequestService,
                                  UserRepository userRepository) {
        this.bloodRequestService = bloodRequestService;
        this.userRepository = userRepository;
    }

    // ── GET /api/requests  (public) ──────────────────────────
    // Supports pagination: ?page=0&size=20
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BloodRequest>>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<BloodRequest> requests = bloodRequestService.getAllRequests(pageable);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "All requests fetched", requests)
        );
    }

    // ── GET /api/requests/open  (public) ─────────────────────
    // Supports pagination: ?page=0&size=20
    @GetMapping("/open")
    public ResponseEntity<ApiResponse<Page<BloodRequest>>> getOpenRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BloodRequest> requests = bloodRequestService.getOpenRequests(pageable);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Open requests fetched", requests)
        );
    }

    // ── GET /api/requests/search?bloodGroup=A_POSITIVE  (public) ──
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<BloodRequest>>> searchByBloodGroup(
            @RequestParam BloodGroup bloodGroup,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BloodRequest> requests = bloodRequestService.getOpenRequestsByBloodGroup(bloodGroup, pageable);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Requests fetched", requests)
        );
    }

    // ── GET /api/requests/{id}  (public) ─────────────────────
    // NEW: Get single request by ID - FIXES N+1 issue
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BloodRequest>> getRequestById(@PathVariable Long id) {
        BloodRequest request = bloodRequestService.getRequestById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Request fetched", request)
        );
    }

    // ── GET /api/requests/my  (logged-in user) ───────────────
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<BloodRequest>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + userDetails.getUsername()));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BloodRequest> requests = bloodRequestService.getMyRequests(user.getId(), pageable);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Your requests fetched", requests)
        );
    }

    // ── POST /api/requests  (any logged-in user) ─────────────
    @PostMapping
    public ResponseEntity<ApiResponse<BloodRequest>> createRequest(
            @RequestBody BloodRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + userDetails.getUsername()));

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Request created",
                        bloodRequestService.createRequest(request, user.getId()))
        );
    }

    // ── PUT /api/requests/{id}  (owner or ADMIN) ─────────────
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BloodRequest>> updateRequest(
            @PathVariable Long id,
            @RequestBody BloodRequest updatedRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + userDetails.getUsername()));

        // FIXED: Use service method to get single request directly
        BloodRequest existing = bloodRequestService.getRequestById(id);

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boolean isOwner = existing.getCreatedBy().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException(
                    "You are not allowed to update this request");
        }

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Request updated",
                        bloodRequestService.updateRequest(id, updatedRequest))
        );
    }

    // ── DELETE /api/requests/{id}  (owner or ADMIN) ──────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + userDetails.getUsername()));

        // FIXED: Use service method to get single request directly
        BloodRequest existing = bloodRequestService.getRequestById(id);

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boolean isOwner = existing.getCreatedBy().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException(
                    "You are not allowed to delete this request");
        }

        bloodRequestService.deleteRequest(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Request deleted"));
    }
}