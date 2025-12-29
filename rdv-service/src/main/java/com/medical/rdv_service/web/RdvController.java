package com.medical.rdv_service.web;

import com.medical.rdv_service.clients.AuthServiceClient;
import com.medical.rdv_service.entities.RendezVous;
import com.medical.rdv_service.services.RdvService;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RefreshScope
@RequiredArgsConstructor
@RequestMapping("/rendezvous")
public class RdvController {

    private final RdvService rdvService;
    private final AuthServiceClient authServiceClient;

    @GetMapping("/{id}")
    public ResponseEntity<?> getRdv(@PathVariable UUID id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        RendezVous rdv = rdvService.getRdv(id);
        if (rdv == null)
            return ResponseEntity.notFound().build();

        // View rendez-vous -> Patient or Doctor involved
        // For now, listing is open but we could check X-User-Email vs
        // doctorId/patientId email
        return ResponseEntity.ok(rdv);
    }

    @GetMapping
    public List<RendezVous> getAll() {
        return rdvService.getAllRdvs();
    }

    @GetMapping("/doctor/{doctorId}/upcoming")
    public List<RendezVous> getUpcomingAppointments(@PathVariable UUID doctorId) {
        return rdvService.getUpcomingAppointments(doctorId);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody RendezVous rdv,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        // Create rendez-vous -> Patient / Doctor
        if (!"PATIENT".equalsIgnoreCase(role) && !"DOCTOR".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Patients or Doctors can create appointments");
        }

        // Note: patientId here refers to the patient-service Patient ID, not
        // auth-service userId.
        // We skip auth-service validation as we're already authenticated via JWT.
        // Optionally, you could add a patient-service Feign client to validate if
        // needed.

        try {
            return ResponseEntity.ok(rdvService.save(rdv));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody RendezVous rdv) {
        return ResponseEntity.ok(rdvService.update(id, rdv));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        rdvService.delete(id);
    }
}
