package com.blooddonation.demo.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting service for auth endpoints.
 * Prevents brute force attacks by limiting login attempts per IP.
 *
 * In production, use Redis for distributed rate limiting.
 */
@Service
public class RateLimitService {

    private final Map<String, LoginAttemptInfo> attempts = new ConcurrentHashMap<>();

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    private static final long LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes lockout

    public String checkRateLimit(String clientIp) {
        LoginAttemptInfo info = attempts.get(clientIp);

        if (info == null) {
            return null;
        }

        long now = System.currentTimeMillis();

        // Check if locked out
        if (info.lockedOut && now < info.lockoutEndTime) {
            long seconds = (info.lockoutEndTime - now) / 1000;
            return "Account temporarily locked. Try again in " + seconds + " seconds.";
        }

        // Reset if lockout expired
        if (info.lockedOut && now >= info.lockoutEndTime) {
            info.attempts = 0;
            info.lockedOut = false;
        }

        // Check attempt count
        if (info.attempts >= MAX_ATTEMPTS) {
            if (now - info.windowStart < WINDOW_MS) {
                return "Too many login attempts. Please try again later.";
            } else {
                // Window expired, reset
                info.attempts = 0;
                info.windowStart = now;
            }
        }

        return null;
    }

    public boolean recordFailedAttempt(String clientIp) {
        LoginAttemptInfo info = attempts.computeIfAbsent(clientIp, k -> new LoginAttemptInfo());

        long now = System.currentTimeMillis();

        // Reset if window expired
        if (now - info.windowStart > WINDOW_MS) {
            info.attempts = 0;
            info.windowStart = now;
            info.lockedOut = false;
        }

        info.attempts++;

        if (info.attempts >= MAX_ATTEMPTS) {
            info.lockedOut = true;
            info.lockoutEndTime = now + LOCKOUT_MS;
            return true;
        }

        return false;
    }

    public void recordSuccessfulLogin(String clientIp) {
        attempts.remove(clientIp);
    }

    public void clearRateLimit(String clientIp) {
        attempts.remove(clientIp);
    }

    public int getRemainingAttempts(String clientIp) {
        LoginAttemptInfo info = attempts.get(clientIp);
        if (info == null) {
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - info.attempts);
    }

    private static class LoginAttemptInfo {
        int attempts = 0;
        long windowStart = System.currentTimeMillis();
        boolean lockedOut = false;
        long lockoutEndTime = 0;
    }
}