package com.blooddonation.demo.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email", unique = true),
    @Index(name = "idx_users_blood_group", columnList = "blood_group"),
    @Index(name = "idx_users_role", columnList = "role"),
    @Index(name = "idx_users_is_available", columnList = "is_available")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false)
    private BloodGroup bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    private String address;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "last_donated")
    private LocalDate lastDonated;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PasswordResetToken> passwordResetTokens = new ArrayList<>();

    // ── Getters & Setters ──────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public BloodGroup getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(BloodGroup bloodGroup) { this.bloodGroup = bloodGroup; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public LocalDate getLastDonated() { return lastDonated; }
    public void setLastDonated(LocalDate lastDonated) { this.lastDonated = lastDonated; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<PasswordResetToken> getPasswordResetTokens() { return passwordResetTokens; }
    public void setPasswordResetTokens(List<PasswordResetToken> passwordResetTokens) { this.passwordResetTokens = passwordResetTokens; }
}