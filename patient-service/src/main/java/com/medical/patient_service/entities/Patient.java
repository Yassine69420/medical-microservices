package com.medical.patient_service.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId; // Auth-Service User.id

    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String phone;
    private String address;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL)
    private MedicalRecord record;
}
