package com.blooddonation.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "donations", indexes = {
    @Index(name = "idx_donations_donor_id", columnList = "donor_id"),
    @Index(name = "idx_donations_donated_at", columnList = "donated_at"),
    @Index(name = "idx_donations_request_id", columnList = "request_id")
})
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many donations can belong to one donor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    // Donation may or may not be linked to a request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private BloodRequest bloodRequest;

    @Column(name = "units_donated", nullable = false)
    private Integer unitsDonated;

    @Column(name = "donated_at", nullable = false)
    private LocalDate donatedAt;

    private String location;

    private String notes;

    // ── Getters & Setters ──────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getDonor() { return donor; }
    public void setDonor(User donor) { this.donor = donor; }

    public BloodRequest getBloodRequest() { return bloodRequest; }
    public void setBloodRequest(BloodRequest bloodRequest) { this.bloodRequest = bloodRequest; }

    public Integer getUnitsDonated() { return unitsDonated; }
    public void setUnitsDonated(Integer unitsDonated) { this.unitsDonated = unitsDonated; }

    public LocalDate getDonatedAt() { return donatedAt; }
    public void setDonatedAt(LocalDate donatedAt) { this.donatedAt = donatedAt; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
