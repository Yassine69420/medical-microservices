package com.medical.patient_service.web;

import com.medical.patient_service.entities.MedicalRecord;
import com.medical.patient_service.repositories.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/records")
public class MedicalRecordController {
    private final MedicalRecordRepository recordRepository;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getByPatientId(@PathVariable UUID patientId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        // View own medical record -> Patient (Need to check if it's THEIR record)
        // View any -> Doctor
        MedicalRecord record = recordRepository.findAll().stream()
                .filter(r -> r.getPatient() != null && r.getPatient().getId().equals(patientId))
                .findFirst()
                .orElse(null);

        if (record == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(record);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody MedicalRecord record,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        // Create medical record -> Doctor
        if (!"DOCTOR".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Doctors can create medical records");
        }
        return ResponseEntity.ok(recordRepository.save(record));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody MedicalRecord record,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        record.setId(id);
        return ResponseEntity.ok(recordRepository.save(record));
    }
}
