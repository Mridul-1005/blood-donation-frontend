package com.blooddonation.demo.controller;

import com.blooddonation.demo.dto.ApiResponse;
import com.blooddonation.demo.dto.AuthResponse;
import com.blooddonation.demo.dto.LoginRequest;
import com.blooddonation.demo.dto.RegisterRequest;
import com.blooddonation.demo.service.AuthService;
import com.blooddonation.demo.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:4200}")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    public AuthController(AuthService authService, RateLimitService rateLimitService) {
        this.authService = authService;
        this.rateLimitService = rateLimitService;
    }

    // ── POST /api/auth/register ──────────────────
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Registered successfully!", response)
        );
    }

    // ── POST /api/auth/login ─────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = getClientIp(httpRequest);

        // Check rate limit before processing login
        String rateLimitError = rateLimitService.checkRateLimit(clientIp);
        if (rateLimitError != null) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponse<>(false, rateLimitError));
        }

        try {
            AuthResponse response = authService.login(request);

            // Successful login - reset rate limit for this IP
            rateLimitService.recordSuccessfulLogin(clientIp);

            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Login successful!", response)
            );
        } catch (Exception e) {
            // Failed login attempt - record it
            boolean isLocked = rateLimitService.recordFailedAttempt(clientIp);

            int remainingAttempts = rateLimitService.getRemainingAttempts(clientIp);

            if (isLocked) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(new ApiResponse<>(false,
                                "Too many failed attempts. Account locked for 5 minutes."));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false,
                                "Invalid email or password. " + remainingAttempts + " attempts remaining."));
            }
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}