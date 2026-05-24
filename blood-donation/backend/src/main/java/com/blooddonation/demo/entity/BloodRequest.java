package com.blooddonation.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_requests", indexes = {
    @Index(name = "idx_blood_requests_status", columnList = "status"),
    @Index(name = "idx_blood_requests_blood_group", columnList = "blood_group"),
    @Index(name = "idx_blood_requests_created_by", columnList = "created_by"),
    @Index(name = "idx_blood_requests_status_blood_group", columnList = "status, blood_group")
})
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false)
    private BloodGroup bloodGroup;

    @Column(name = "units_needed", nullable = false)
    private Integer unitsNeeded;

    @Column(nullable = false)
    private String hospital;

    @Column(nullable = false)
    private String contact;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.OPEN;

    // Many requests can be created by one user - using EAGER for simplicity in this app
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ──────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public BloodGroup getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(BloodGroup bloodGroup) { this.bloodGroup = bloodGroup; }

    public Integer getUnitsNeeded() { return unitsNeeded; }
    public void setUnitsNeeded(Integer unitsNeeded) { this.unitsNeeded = unitsNeeded; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}