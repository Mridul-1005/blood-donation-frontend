package com.blooddonation.demo.exception;

import com.blooddonation.demo.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── 404 Resource Not Found ────────────────────────────────
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, ex.getMessage()));
    }

    // ── 403 Access Denied ─────────────────────────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "You don't have permission to perform this action"));
    }

    // ── 409 Duplicate Resource ────────────────────────────────
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(false, ex.getMessage()));
    }

    // ── 401 Bad Credentials (wrong password) ─────────────────
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        // Don't reveal whether email or password is wrong
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, "Invalid email or password"));
    }

    // ── 400 Validation Errors (@Valid failures) ───────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        // Collect all field errors into a map
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            // Make error messages user-friendly
            String message = getFriendlyErrorMessage(error.getField(), error.getDefaultMessage());
            errors.put(error.getField(), message);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Validation failed. Please check your input.", errors));
    }

    // ── 500 Any Other Unexpected Error ───────────────────────
    // IMPORTANT: Don't expose internal error details in production!
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        // Log the full error for debugging
        logger.error("Unexpected error occurred", ex);

        // Return generic message to client (don't leak internal details)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "An unexpected error occurred. Please try again later."));
    }

    // Convert technical field names to user-friendly messages
    private String getFriendlyErrorMessage(String field, String defaultMessage) {
        Map<String, String> friendlyNames = Map.of(
            "name", "Full Name",
            "email", "Email Address",
            "password", "Password",
            "phone", "Phone Number",
            "bloodGroup", "Blood Group"
        );

        String friendlyField = friendlyNames.getOrDefault(field, field);
        return defaultMessage.replace(field, friendlyField);
    }
}