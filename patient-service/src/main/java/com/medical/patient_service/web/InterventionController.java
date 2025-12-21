package com.medical.patient_service.web;

import com.medical.patient_service.clients.RdvServiceClient;
import com.medical.patient_service.entities.Intervention;
import com.medical.patient_service.repositories.InterventionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/interventions")
public class InterventionController {
    private final InterventionRepository interventionRepository;
    private final RdvServiceClient rdvServiceClient;

    @GetMapping("/record/{recordId}")
    public List<Intervention> getByRecordId(@PathVariable UUID recordId) {
        return interventionRepository.findAll().stream()
                .filter(i -> i.getMedicalRecord() != null && i.getMedicalRecord().getId().equals(recordId))
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Intervention intervention,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        // Create intervention -> Doctor
        // Write doctor notes -> Doctor
        if (!"DOCTOR".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Doctors can create interventions");
        }

        if (intervention.getRdvId() != null) {
            try {
                rdvServiceClient.getRdv(intervention.getRdvId());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Rendez-vous not found");
            }
        }
        return ResponseEntity.ok(interventionRepository.save(intervention));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Intervention intervention,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        // Modify intervention -> Doctor
        if (!"DOCTOR".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Doctors can modify interventions");
        }
        intervention.setId(id);
        return ResponseEntity.ok(interventionRepository.save(intervention));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        interventionRepository.deleteById(id);
    }
}
