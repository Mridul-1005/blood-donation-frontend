package com.blooddonation.demo.controller;

import com.blooddonation.demo.dto.ApiResponse;
import com.blooddonation.demo.entity.BloodGroup;
import com.blooddonation.demo.entity.Role;
import com.blooddonation.demo.entity.User;
import com.blooddonation.demo.exception.AccessDeniedException;
import com.blooddonation.demo.exception.ResourceNotFoundException;
import com.blooddonation.demo.repository.UserRepository;
import com.blooddonation.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // ── GET /api/users  (ADMIN only) ─────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "All users fetched", userService.getAllUsers())
        );
    }

    // ── GET /api/users/{id}  (logged-in user) ────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "User fetched", userService.getUserById(id))
        );
    }

    // ── GET /api/users/me  (own profile) ─────────────────────
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + userDetails.getUsername()));

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Profile fetched", user)
        );
    }

    // ── PUT /api/users/{id}  (own profile update) ────────────
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + userDetails.getUsername()));

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !currentUser.getId().equals(id)) {
            throw new AccessDeniedException(
                    "You are not allowed to update this profile");
        }

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User updated", userService.updateUser(id, updatedUser))
        );
    }

    // ── PATCH /api/users/{id}/role  (ADMIN only) ─────────────
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateRole(
            @PathVariable Long id,
            @RequestParam Role role) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Role updated", userService.updateRole(id, role))
        );
    }

    // ── DELETE /api/users/{id}  (ADMIN only) ─────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted"));
    }

    // ── GET /api/users/donors/search?bloodGroup=A_POSITIVE  (public) ──
    @GetMapping("/donors/search")
    public ResponseEntity<ApiResponse<List<User>>> searchDonors(
            @RequestParam BloodGroup bloodGroup) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Donors found",
                        userService.getDonorsByBloodGroup(bloodGroup))
        );
    }

    // ── GET /api/users/donors  (ADMIN only) ──────────────────
    @GetMapping("/donors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllDonors() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "All donors fetched", userService.getAllDonors())
        );
    }
}