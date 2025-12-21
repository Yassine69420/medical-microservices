package com.medical.patient_service.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Intervention {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID doctorId; // Auth-Service userId
    private UUID rdvId; // Rdv-Service RendezVous.id

    private String type;

    @Column(columnDefinition = "TEXT")
    private String doctorNotes;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "medical_record_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private MedicalRecord medicalRecord;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
