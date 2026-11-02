package com.example.smartcitygovernance.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Complaint Info
    private String title;

    @Column(length = 1000)
    private String description;

    // GPS Location
    private Double latitude;
    private Double longitude;

    // Complaint Status
    private String status;

    // Timestamp
    private LocalDateTime createdAt;

    @Column
    private Integer rating;// 1–5

    @Column(length = 1000)
    private String feedback;    // text

    // Relationship: Citizen who raised complaint
    @ManyToOne
    @JoinColumn(name = "citizen_id")
    private User citizen;

    // Relationship: Officer assigned to complaint
    @ManyToOne
    @JoinColumn(name = "officer_id")
    private User assignedOfficer;

    // Auto set time before saving
    @PrePersist
    public void setCreationTime() {
        this.createdAt = LocalDateTime.now();
        this.status = "Pending";  // default status
    }
    @Column(name = "image_path")
    private String imagePath;

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }


}


