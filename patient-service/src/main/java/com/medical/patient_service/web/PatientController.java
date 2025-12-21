package com.medical.patient_service.web;

import com.medical.patient_service.entities.Patient;
import com.medical.patient_service.repositories.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PatientController {
    private final PatientRepository patientRepository;

    @GetMapping("/patients")
    public ResponseEntity<?> getAll(@RequestHeader(value = "X-User-Role", required = false) String role) {
        // Any authenticated user can list patients? Usually admins or doctors.
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patients")
    public ResponseEntity<?> save(@RequestBody Patient patient,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        System.out.println("DEBUG: Save Patient Request - Role: " + role + ", Data: " + patient);
        // Allow both Patients (self-registration) and Doctors (admin registration)
        if (!"PATIENT".equalsIgnoreCase(role) && !"DOCTOR".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Insufficient permissions to create patient profile");
        }
        try {
            Patient saved = patientRepository.save(patient);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving patient: " + e.getMessage());
        }
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Patient patient,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        patient.setId(id);
        return ResponseEntity.ok(patientRepository.save(patient));
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        patientRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
