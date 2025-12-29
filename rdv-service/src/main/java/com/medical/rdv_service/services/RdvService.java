package com.medical.rdv_service.services;

import com.medical.rdv_service.entities.RendezVous;
import com.medical.rdv_service.repositories.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RdvService {
    private final RendezVousRepository rdvRepo;

    public RendezVous getRdv(UUID id) {
        return rdvRepo.findById(id).orElse(null);
    }

    public List<RendezVous> getAllRdvs() {
        return rdvRepo.findAll();
    }

    public List<RendezVous> getUpcomingAppointments(UUID doctorId) {
        return rdvRepo.findTop3ByDoctorIdAndDateTimeAfterOrderByDateTimeAsc(doctorId, java.time.LocalDateTime.now());
    }

    public RendezVous save(RendezVous rdv) {
        // Validation: Check for overlap
        // Assume 30 min duration
        java.time.LocalDateTime start = rdv.getDateTime();
        java.time.LocalDateTime conflictStart = start.minusMinutes(30);
        java.time.LocalDateTime conflictEnd = start.plusMinutes(30);

        if (rdvRepo.hasOverlappingAppointments(rdv.getDoctorId(), conflictStart, conflictEnd)) {
            throw new RuntimeException("Time slot overlaps with an existing appointment");
        }

        return rdvRepo.save(rdv);
    }

    public RendezVous update(UUID id, RendezVous rdv) {
        rdv.setId(id);
        return rdvRepo.save(rdv);
    }

    public void delete(UUID id) {
        rdvRepo.deleteById(id);
    }
}
