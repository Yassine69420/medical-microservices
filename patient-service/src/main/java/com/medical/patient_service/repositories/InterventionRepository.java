package com.medical.patient_service.repositories;

import com.medical.patient_service.entities.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface InterventionRepository extends JpaRepository<Intervention, UUID> {
}
