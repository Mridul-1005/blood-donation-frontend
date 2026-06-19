package com.blooddonation.demo.service;

import com.blooddonation.demo.config.JwtUtil;
import com.blooddonation.demo.dto.AuthResponse;
import com.blooddonation.demo.dto.LoginRequest;
import com.blooddonation.demo.dto.RegisterRequest;
import com.blooddonation.demo.entity.PasswordResetToken;
import com.blooddonation.demo.entity.Role;
import com.blooddonation.demo.entity.User;
import com.blooddonation.demo.exception.DuplicateResourceException;
import com.blooddonation.demo.exception.ResourceNotFoundException;
import com.blooddonation.demo.repository.PasswordResetTokenRepository;
import com.blooddonation.demo.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    private static final String FRONTEND_URL = "http://localhost:4200";

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    // Register new user
    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setBloodGroup(request.getBloodGroup());
        user.setAddress(request.getAddress());
        user.setRole(Role.USER);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getName(), user.getId());
    }

    // Login existing user
    public AuthResponse login(LoginRequest request) {

        // Spring Security validates credentials — throws BadCredentialsException
        // automatically if wrong, which GlobalExceptionHandler catches
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + request.getEmail()));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getName(), user.getId());
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No user found with email: " + email));

        String resetToken = UUID.randomUUID().toString();

        passwordResetTokenRepository.markAllTokensAsUsedByUserId(user.getId());

        PasswordResetToken passwordResetToken = new PasswordResetToken(resetToken, user);
        passwordResetTokenRepository.save(passwordResetToken);

        String resetLink = FRONTEND_URL + "/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired reset token"));

        if (!passwordResetToken.isValid()) {
            throw new IllegalArgumentException("Reset token has expired or already been used");
        }

        User user = passwordResetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetToken.setUsed(true);
        passwordResetTokenRepository.save(passwordResetToken);
    }
}