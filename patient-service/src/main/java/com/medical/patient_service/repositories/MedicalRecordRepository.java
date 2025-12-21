package com.medical.patient_service.repositories;

import com.medical.patient_service.entities.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
}
