package com.medical.patient_service.repositories;

import com.medical.patient_service.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
}
